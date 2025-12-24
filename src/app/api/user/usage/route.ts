import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Plan limits configuration
const PLAN_LIMITS = {
  free: 4,      // Free users get 4 calls total
  starter: 50,  // Starter plan: 50 calls/month
  pro: -1,      // Pro plan: unlimited (-1 means no limit)
} as const;

const PLAN_NAMES = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
} as const;

// GET /api/user/usage - Get user's usage stats and limits
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Get user with plan info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error: userError } = await (supabase as any)
      .from('users')
      .select('id, plan')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: true,
        usage: {
          plan: 'free',
          planName: 'Free',
          callsUsed: 0,
          callsLimit: PLAN_LIMITS.free,
          callsRemaining: PLAN_LIMITS.free,
          isUnlimited: false,
          percentUsed: 0,
        },
      });
    }

    const userPlan = (user.plan || 'free') as keyof typeof PLAN_LIMITS;
    const callLimit = PLAN_LIMITS[userPlan];
    const isUnlimited = callLimit === -1;

    // Count user's COMPLETED calls only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error: countError } = await (supabase as any)
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (countError) {
      console.error('Failed to count calls:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch usage' },
        { status: 500 }
      );
    }

    const callsUsed = count || 0;
    const callsRemaining = isUnlimited ? -1 : Math.max(0, callLimit - callsUsed);
    const percentUsed = isUnlimited ? 0 : Math.round((callsUsed / callLimit) * 100);

    return NextResponse.json({
      success: true,
      usage: {
        plan: userPlan,
        planName: PLAN_NAMES[userPlan],
        callsUsed,
        callsLimit: callLimit,
        callsRemaining,
        isUnlimited,
        percentUsed: Math.min(100, percentUsed),
      },
    });
  } catch (error) {
    console.error('Usage fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
