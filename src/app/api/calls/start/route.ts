import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getSignedUrl } from '@/lib/elevenlabs/client';
import type { CallType, PersonaConfig } from '@/types/database';

export const runtime = 'nodejs';

// Plan limits configuration
const PLAN_LIMITS = {
  free: 4,      // Free users get 4 calls total
  starter: 50,  // Starter plan: 50 calls/month
  pro: -1,      // Pro plan: unlimited (-1 means no limit)
} as const;

interface StartCallRequest {
  type: CallType;
  persona: PersonaConfig;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: StartCallRequest = await req.json();
    const { type, persona } = body;

    // Validate required fields
    if (!type || !persona) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = createAdminClient();

    // Get user with plan info from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error: userError } = await (supabase as any)
      .from('users')
      .select('id, plan')
      .eq('clerk_id', userId)
      .single();

    let dbUserId: string;
    let userPlan: 'free' | 'starter' | 'pro' = 'free';

    if (userError || !user) {
      // Create user if doesn't exist
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newUser, error: createError } = await (supabase as any)
        .from('users')
        .insert({
          clerk_id: userId,
          email: `${userId}@placeholder.com`, // Will be updated by webhook
          plan: 'free',
        })
        .select('id, plan')
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      if (!newUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      dbUserId = newUser.id;
      userPlan = newUser.plan || 'free';
    } else {
      dbUserId = user.id;
      userPlan = user.plan || 'free';
    }

    // Check rate limits based on plan
    const callLimit = PLAN_LIMITS[userPlan];

    if (callLimit !== -1) {
      // Count user's COMPLETED calls only (not failed/abandoned attempts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count, error: countError } = await (supabase as any)
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', dbUserId)
        .eq('status', 'completed');

      if (countError) {
        console.error('Failed to count calls:', countError);
        return NextResponse.json(
          { error: 'Failed to check usage limits' },
          { status: 500 }
        );
      }

      const currentCallCount = count || 0;

      if (currentCallCount >= callLimit) {
        return NextResponse.json(
          {
            error: 'Call limit reached',
            message: `You've reached your limit of ${callLimit} calls on the ${userPlan} plan. Please upgrade to continue practicing.`,
            code: 'RATE_LIMIT_EXCEEDED',
            currentCount: currentCallCount,
            limit: callLimit,
            plan: userPlan,
          },
          { status: 429 }
        );
      }
    }

    // Create call record in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: call, error: callError } = await (supabase as any)
      .from('calls')
      .insert({
        user_id: dbUserId,
        type,
        persona_config: persona as unknown as Record<string, unknown>,
        status: 'ready',
      })
      .select()
      .single();

    if (callError || !call) {
      console.error('Failed to create call:', callError);
      return NextResponse.json(
        { error: 'Failed to create call' },
        { status: 500 }
      );
    }

    // Get signed URL from ElevenLabs for the conversation
    let elevenLabsSession;
    try {
      elevenLabsSession = await getSignedUrl({
        persona: {
          name: persona.name,
          gender: persona.gender, // Pass explicit gender for voice selection
          title: persona.title,
          company: persona.company,
          background: persona.background,
          personality: persona.personality,
          current_challenges: persona.current_challenges || [],
          hidden_pain_points: persona.hidden_pain_points,
          objections: persona.objections,
          triggers: persona.triggers,
          communication_style: persona.communication_style || '',
          opening_mood: persona.opening_mood || 'neutral',
          difficulty: persona.difficulty,
          first_response: persona.first_response,
        },
        callType: type,
      });
    } catch (elevenLabsError) {
      console.error('ElevenLabs error:', elevenLabsError);
      // Update call status to indicate ElevenLabs failed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('calls')
        .update({ status: 'abandoned' })
        .eq('id', call.id);

      return NextResponse.json(
        { error: 'Failed to initialize voice agent' },
        { status: 500 }
      );
    }

    // Update call with ElevenLabs conversation ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('calls')
      .update({
        elevenlabs_conversation_id: elevenLabsSession.conversationId,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', call.id);

    // Create empty transcript record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('call_transcripts')
      .insert({
        call_id: call.id,
        messages: [],
      });

    return NextResponse.json({
      success: true,
      callId: call.id,
      persona,
      elevenlabs: {
        conversationId: elevenLabsSession.conversationId,
        signedUrl: elevenLabsSession.signedUrl,
        agentId: elevenLabsSession.agentId,
        voiceId: elevenLabsSession.voiceId,
      },
    });
  } catch (error) {
    console.error('Start call error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start call' },
      { status: 500 }
    );
  }
}
