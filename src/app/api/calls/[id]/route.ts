// ============================================
// SPARROW AI - Single Call API
// GET /api/calls/:id - Get call details with scores and feedback
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { Call, CallScore, CallFeedback, CallTranscript, PersonaConfig, User } from '@/types/database';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Get call with relations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: callData, error: callError } = await (supabase as any)
      .from('calls')
      .select(`
        *,
        call_scores (*),
        call_feedback (*),
        call_transcripts (*)
      `)
      .eq('id', callId)
      .single();

    if (callError || !callData) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    const call = callData as Call & {
      call_scores: CallScore | null;
      call_feedback: CallFeedback[];
      call_transcripts: CallTranscript | null;
    };

    // Verify user owns this call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('clerk_id')
      .eq('id', call.user_id)
      .single();

    const user = userData as User | null;

    if (!user || user.clerk_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const persona = call.persona_config as unknown as PersonaConfig;
    const scores = call.call_scores;
    const feedback = call.call_feedback || [];
    const transcript = (call.call_transcripts?.messages || []) as Array<{
      speaker: 'user' | 'prospect';
      content: string;
      timestamp_ms: number;
    }>;

    const result = {
      callId: call.id,
      type: call.type,
      status: call.status,
      duration_seconds: call.duration_seconds || 0,
      created_at: call.created_at,
      completed_at: call.completed_at,
      persona,
      scores: scores
        ? {
            overall: scores.overall_score,
            categories: {
              opening: scores.opening_score,
              discovery: scores.discovery_score,
              objection_handling: scores.objection_score,
              call_control: scores.control_score,
              closing: scores.closing_score,
            },
            outcome: scores.outcome,
          }
        : null,
      feedback: feedback.map((f) => ({
        category: f.category,
        timestamp_ms: f.timestamp_ms,
        type: f.feedback_type,
        content: f.content,
        suggestion: f.suggestion,
        excerpt: f.transcript_excerpt,
      })),
      transcript,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get call error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call' },
      { status: 500 }
    );
  }
}
