// ============================================
// SPARROW AI - User Progress API
// GET /api/user/progress - Get user's progress data
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { UserProgress, Call, CallScore, PersonaConfig } from '@/types/database';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    const supabase = createAdminClient();

    // Get user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ progress: null });
    }

    // Get user progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: progressData } = await (supabase as any)
      .from('user_progress')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    const progress = progressData as UserProgress | null;

    // Calculate date filter
    let dateFilter: string | null = null;
    const now = new Date();
    if (range === '7d') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (range === '30d') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Get calls with scores for history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let callsQuery = (supabase as any)
      .from('calls')
      .select(`
        *,
        call_scores (
          overall_score,
          outcome
        )
      `)
      .eq('user_id', userData.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (dateFilter) {
      callsQuery = callsQuery.gte('created_at', dateFilter);
    }

    const { data: callsData } = await callsQuery;

    const calls = (callsData || []) as Array<Call & { call_scores: CallScore | null }>;

    // Calculate score history (group by date)
    const scoreByDate: Record<string, number[]> = {};
    calls.forEach(call => {
      const date = call.completed_at?.split('T')[0] || call.created_at.split('T')[0];
      const score = call.call_scores?.overall_score;
      if (score) {
        if (!scoreByDate[date]) scoreByDate[date] = [];
        scoreByDate[date].push(score);
      }
    });

    const score_history = Object.entries(scoreByDate)
      .map(([date, scores]) => ({
        date,
        score: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate calls by type
    const callsByType: Record<string, number> = {};
    calls.forEach(call => {
      const typeLabel = call.type === 'cold_call' ? 'Cold Call' :
                       call.type === 'discovery' ? 'Discovery' :
                       call.type === 'objection_gauntlet' ? 'Objection Gauntlet' : call.type;
      callsByType[typeLabel] = (callsByType[typeLabel] || 0) + 1;
    });

    const calls_by_type = Object.entries(callsByType).map(([type, count]) => ({
      type,
      count,
    }));

    // Calculate outcomes
    const outcomes = {
      meeting_booked: calls.filter(c => c.call_scores?.outcome === 'meeting_booked').length,
      callback: calls.filter(c => c.call_scores?.outcome === 'callback').length,
      rejected: calls.filter(c => c.call_scores?.outcome === 'rejected').length,
      no_decision: calls.filter(c => c.call_scores?.outcome === 'no_decision').length,
    };

    // Calculate total duration
    const total_duration_seconds = calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);

    // Default skill scores if not available
    const defaultSkillScores = {
      opening: null,
      discovery: null,
      objection_handling: null,
      call_control: null,
      closing: null,
    };

    const progressResponse = {
      total_calls: progress?.total_calls || calls.length,
      total_duration_seconds: progress?.total_duration_seconds || total_duration_seconds,
      current_streak: progress?.current_streak || 0,
      longest_streak: progress?.longest_streak || 0,
      avg_overall_score: progress?.avg_overall_score ||
        (calls.length > 0
          ? calls.filter(c => c.call_scores?.overall_score).reduce((sum, c) => sum + (c.call_scores?.overall_score || 0), 0) /
            calls.filter(c => c.call_scores?.overall_score).length
          : null),
      skill_scores: (progress?.skill_scores as typeof defaultSkillScores) || defaultSkillScores,
      score_history,
      calls_by_type,
      outcomes,
    };

    return NextResponse.json({ progress: progressResponse });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
