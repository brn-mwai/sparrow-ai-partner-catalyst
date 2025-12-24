import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getConversationHistory, endConversation } from '@/lib/elevenlabs/client';
import { quickScore as groqQuickScore, deepAnalysis as groqDeepAnalysis } from '@/lib/groq/client';
import { quickScore as geminiQuickScore, deepAnalysis as geminiDeepAnalysis } from '@/lib/gemini/client';
import type {
  CallType,
  PersonaConfig,
  TranscriptMessage,
  Call,
  User,
  UserProgress,
  ScoreResult,
} from '@/types/database';
import type { DeepAnalysisResult as GroqDeepAnalysisResult } from '@/lib/groq/client';
import type { DeepAnalysisResult as GeminiDeepAnalysisResult } from '@/lib/gemini/client';

export const runtime = 'nodejs';

interface EndCallRequest {
  transcript?: TranscriptMessage[]; // Client-captured transcript
  duration_seconds?: number;
}

interface FeedbackItem {
  category: string;
  timestamp_estimate: string;
  type: 'positive' | 'negative' | 'missed_opportunity';
  content: string;
  suggestion?: string;
  excerpt?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: EndCallRequest = await req.json().catch(() => ({}));

    // Get Supabase client
    const supabase = createAdminClient();

    // Get call record
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .single();

    if (callError || !callData) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    const call = callData as Call;

    // Get user to verify ownership
    const { data: userData } = await supabase
      .from('users')
      .select('clerk_id')
      .eq('id', call.user_id)
      .single();

    const user = userData as User | null;

    // Verify user owns this call
    if (!user || user.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // End ElevenLabs conversation
    if (call.elevenlabs_conversation_id) {
      try {
        await endConversation(call.elevenlabs_conversation_id);
      } catch (err) {
        console.error('Failed to end ElevenLabs conversation:', err);
        // Continue anyway
      }
    }

    // Use client-provided transcript as primary, fallback to ElevenLabs API
    let transcript: TranscriptMessage[] = body.transcript || [];

    // If no client transcript, try to get from ElevenLabs
    if (transcript.length === 0 && call.elevenlabs_conversation_id) {
      try {
        const history = await getConversationHistory(call.elevenlabs_conversation_id);
        transcript = history.map((msg) => ({
          speaker: msg.speaker === 'user' ? 'user' : 'prospect',
          content: msg.content,
          timestamp_ms: msg.timestamp,
        }));
      } catch (err) {
        console.error('Failed to get transcript from ElevenLabs:', err);
      }
    }

    console.log(`📝 Transcript has ${transcript.length} messages`);

    // Update transcript in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('call_transcripts')
      .update({
        messages: transcript,
        updated_at: new Date().toISOString(),
      })
      .eq('call_id', callId);

    // Calculate duration
    const startTime = call.started_at ? new Date(call.started_at).getTime() : Date.now();
    const duration = body.duration_seconds || Math.floor((Date.now() - startTime) / 1000);

    // Update call status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('calls')
      .update({
        status: 'completed' as const,
        duration_seconds: duration,
        completed_at: new Date().toISOString(),
      })
      .eq('id', callId);

    // Format transcript for scoring
    const transcriptText = transcript
      .map((msg) => `${msg.speaker === 'user' ? 'Sales Rep' : 'Prospect'}: ${msg.content}`)
      .join('\n');

    const personaConfig = call.persona_config as unknown as PersonaConfig;
    const personaContext = `${personaConfig.name}, ${personaConfig.title} at ${personaConfig.company}. ${personaConfig.personality} personality, ${personaConfig.difficulty} difficulty.`;

    // Perform scoring
    let scores: ScoreResult;
    let feedback: FeedbackItem[] = [];
    let scoringProvider = 'none';
    let quickScoreLatency = 0;
    let deepAnalysisLatency = 0;

    // Only score if we have transcript content
    if (transcript.length > 0 && transcriptText.trim().length > 0) {
      scoringProvider = 'groq';

      // Quick score with Groq (fast)
      const startQuickScore = Date.now();
      try {
        const groqResult = await groqQuickScore(
          transcriptText,
          call.type as CallType,
          personaContext
        );
        scores = {
          overall: groqResult.overall,
          categories: groqResult.categories,
          outcome: groqResult.outcome,
          confidence: groqResult.confidence,
        };
      } catch (groqError) {
        console.error('Groq quick score failed, trying Gemini:', groqError);
        scoringProvider = 'gemini';
        try {
          const geminiResult = await geminiQuickScore(
            transcriptText,
            call.type as CallType,
            personaContext
          );
          scores = {
            overall: geminiResult.overall,
            categories: geminiResult.categories,
            outcome: geminiResult.outcome,
            confidence: geminiResult.confidence,
          };
        } catch (geminiError) {
          console.error('Gemini quick score also failed:', geminiError);
          // Use default scores
          scores = {
            overall: 5,
            categories: {
              opening: 5,
              discovery: 5,
              objection_handling: 5,
              call_control: 5,
              closing: 5,
            },
            outcome: 'no_decision',
            confidence: 0,
          };
        }
      }
      quickScoreLatency = Date.now() - startQuickScore;

      // Deep analysis (can be slower)
      const startDeepAnalysis = Date.now();
      try {
        const deepResult: GroqDeepAnalysisResult | GeminiDeepAnalysisResult = scoringProvider === 'groq'
          ? await groqDeepAnalysis(transcriptText, call.type as CallType, personaContext, scores)
          : await geminiDeepAnalysis(transcriptText, call.type as CallType, personaContext, scores);

        // Update scores with deep analysis if more confident
        if (deepResult.scores.confidence > scores.confidence) {
          scores = deepResult.scores;
        }
        feedback = deepResult.feedback as FeedbackItem[];
      } catch (deepError) {
        console.error('Deep analysis failed:', deepError);
        feedback = [];
      }
      deepAnalysisLatency = Date.now() - startDeepAnalysis;
    } else {
      // No transcript - use default scores
      console.log('No transcript available, using default scores');
      scores = {
        overall: 5,
        categories: {
          opening: 5,
          discovery: 5,
          objection_handling: 5,
          call_control: 5,
          closing: 5,
        },
        outcome: 'no_decision',
        confidence: 0,
      };
    }

    // Save scores to database
    // Map code category names to database column names:
    // - objection_handling -> objection_score
    // - call_control -> communication_score (database uses communication)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: scoreError } = await (supabase as any)
      .from('call_scores')
      .insert({
        call_id: callId,
        overall_score: scores.overall,
        opening_score: scores.categories.opening,
        discovery_score: scores.categories.discovery,
        objection_score: scores.categories.objection_handling,
        communication_score: scores.categories.call_control,
        closing_score: scores.categories.closing,
        outcome: scores.outcome,
        scoring_provider: scoringProvider,
        scoring_latency_ms: quickScoreLatency + deepAnalysisLatency,
      });

    if (scoreError) {
      console.error('Failed to save scores:', scoreError);
    }

    // Save feedback to database
    // Map code category names to database enum values:
    // - objection_handling -> objection
    // - call_control -> communication
    const mapCategoryToDb = (cat: string): string => {
      const mapping: Record<string, string> = {
        'objection_handling': 'objection',
        'call_control': 'communication',
      };
      return mapping[cat] || cat;
    };

    if (feedback && feedback.length > 0) {
      const feedbackRecords = feedback.map((f) => ({
        call_id: callId,
        category: mapCategoryToDb(f.category),
        timestamp_ms: parseTimestamp(f.timestamp_estimate),
        feedback_type: f.type as 'positive' | 'negative' | 'missed_opportunity',
        title: f.content.substring(0, 100), // Use first 100 chars as title
        content: f.content,
        suggestion: f.suggestion || null,
        transcript_excerpt: f.excerpt || null,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: feedbackError } = await (supabase as any)
        .from('call_feedback')
        .insert(feedbackRecords);

      if (feedbackError) {
        console.error('Failed to save feedback:', feedbackError);
      }
    }

    // Update user progress
    await updateUserProgress(supabase, call.user_id, scores);

    return NextResponse.json({
      success: true,
      callId,
      duration_seconds: duration,
      scores: {
        overall: scores.overall,
        categories: scores.categories,
        outcome: scores.outcome,
      },
      feedback: feedback || [],
      transcript,
    });
  } catch (error) {
    console.error('End call error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to end call' },
      { status: 500 }
    );
  }
}

function parseTimestamp(timestamp: string): number {
  // Convert "0:30" or "1:15" format to milliseconds
  const parts = timestamp.replace(':', '').match(/(\d+):?(\d+)?/);
  if (!parts) return 0;

  const minutes = parseInt(parts[1]) || 0;
  const seconds = parseInt(parts[2]) || 0;
  return (minutes * 60 + seconds) * 1000;
}

async function updateUserProgress(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  scores: ScoreResult
) {
  // Get existing progress
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  const progress = progressData as UserProgress | null;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (progress) {
    // Calculate new streak
    let newStreak = progress.current_streak;
    if (progress.last_call_date === yesterday) {
      newStreak = progress.current_streak + 1;
    } else if (progress.last_call_date !== today) {
      newStreak = 1;
    }

    // Calculate new averages
    const totalCalls = progress.total_calls + 1;
    const newAvgScore = progress.avg_overall_score
      ? (progress.avg_overall_score * progress.total_calls + scores.overall) / totalCalls
      : scores.overall;

    // Update skill scores (weighted average)
    // Note: Database uses 'objection' and 'communication' instead of 'objection_handling' and 'call_control'
    const existingSkills = progress.skill_scores as {
      opening: number | null;
      discovery: number | null;
      objection: number | null;
      communication: number | null;
      closing: number | null;
    };

    const weight = 0.3; // Weight for new score
    const newSkillScores = {
      opening: existingSkills.opening
        ? existingSkills.opening * (1 - weight) + scores.categories.opening * weight
        : scores.categories.opening,
      discovery: existingSkills.discovery
        ? existingSkills.discovery * (1 - weight) + scores.categories.discovery * weight
        : scores.categories.discovery,
      objection: existingSkills.objection
        ? existingSkills.objection * (1 - weight) + scores.categories.objection_handling * weight
        : scores.categories.objection_handling,
      communication: existingSkills.communication
        ? existingSkills.communication * (1 - weight) + scores.categories.call_control * weight
        : scores.categories.call_control,
      closing: existingSkills.closing
        ? existingSkills.closing * (1 - weight) + scores.categories.closing * weight
        : scores.categories.closing,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_progress')
      .update({
        total_calls: totalCalls,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, progress.longest_streak),
        last_call_date: today,
        avg_overall_score: newAvgScore,
        skill_scores: newSkillScores as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } else {
    // Create new progress record
    // Note: Database uses 'objection' and 'communication' instead of 'objection_handling' and 'call_control'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_progress')
      .insert({
        user_id: userId,
        total_calls: 1,
        current_streak: 1,
        longest_streak: 1,
        last_call_date: today,
        avg_overall_score: scores.overall,
        skill_scores: {
          opening: scores.categories.opening,
          discovery: scores.categories.discovery,
          objection: scores.categories.objection_handling,
          communication: scores.categories.call_control,
          closing: scores.categories.closing,
        } as unknown as Record<string, unknown>,
      });
  }
}
