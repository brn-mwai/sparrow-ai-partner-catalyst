// ============================================
// SPARROW AI - Admin Stats API
// GET /api/admin/stats - Get dashboard statistics
// ============================================

import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin/config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();

    // Get total users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalUsers } = await (supabase as any)
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get users by plan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: planCounts } = await (supabase as any)
      .from('users')
      .select('plan');

    const plans = {
      free: 0,
      starter: 0,
      pro: 0,
    };

    planCounts?.forEach((u: { plan: string }) => {
      if (u.plan in plans) {
        plans[u.plan as keyof typeof plans]++;
      }
    });

    // Get total calls
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalCalls } = await (supabase as any)
      .from('calls')
      .select('*', { count: 'exact', head: true });

    // Get calls today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: callsToday } = await (supabase as any)
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get new users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: newUsersWeek } = await (supabase as any)
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Get active users (users with calls in last 7 days)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: activeUserData } = await (supabase as any)
      .from('calls')
      .select('user_id')
      .gte('created_at', weekAgo.toISOString());

    const activeUsers = new Set(activeUserData?.map((c: { user_id: string }) => c.user_id)).size;

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        newThisWeek: newUsersWeek || 0,
        active: activeUsers,
        byPlan: plans,
      },
      calls: {
        total: totalCalls || 0,
        today: callsToday || 0,
      },
      revenue: {
        mrr: plans.starter * 29 + plans.pro * 79,
        estimated: (plans.starter * 29 + plans.pro * 79) * 12,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
