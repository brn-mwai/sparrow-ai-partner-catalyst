// ============================================
// SPARROW AI - Calls List API
// GET /api/calls - Get user's call history
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { Call, CallScore, PersonaConfig } from '@/types/database';

export const runtime = 'nodejs';

interface CallWithScore extends Call {
  call_scores?: CallScore | null;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Get user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ calls: [] });
    }

    // Get calls with scores
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: callsData, error } = await (supabase as any)
      .from('calls')
      .select(`
        *,
        call_scores (
          overall_score,
          outcome
        )
      `)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch calls:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calls' },
        { status: 500 }
      );
    }

    const calls = (callsData || []).map((call: CallWithScore) => {
      const persona = call.persona_config as unknown as PersonaConfig;
      const score = call.call_scores;

      return {
        id: call.id,
        type: call.type,
        persona_name: persona?.name || 'Unknown',
        persona_title: persona?.title || '',
        persona_company: persona?.company || '',
        status: call.status,
        duration_seconds: call.duration_seconds,
        overall_score: score?.overall_score || null,
        outcome: score?.outcome || null,
        created_at: call.created_at,
        completed_at: call.completed_at,
      };
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Get calls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}
