import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getSignedUrl } from '@/lib/elevenlabs/client';
import type { CallType, PersonaConfig } from '@/types/database';

export const runtime = 'nodejs';

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

    // Get user ID from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error: userError } = await (supabase as any)
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      // Create user if doesn't exist
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newUser, error: createError } = await (supabase as any)
        .from('users')
        .insert({
          clerk_id: userId,
          email: `${userId}@placeholder.com`, // Will be updated by webhook
        })
        .select('id')
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
    }

    const dbUserId = user?.id;

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
