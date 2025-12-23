// ============================================
// SPARROW AI - Onboarding API
// POST /api/user/onboarding - Complete onboarding
// GET /api/user/onboarding - Check onboarding status
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Get onboarding status
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error } = await (supabase as any)
      .from('users')
      .select('onboarding_completed, role, industry, preferences')
      .eq('clerk_id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({
        onboarding_completed: false,
        needs_setup: true,
      });
    }

    return NextResponse.json({
      onboarding_completed: user.onboarding_completed,
      role: user.role,
      industry: user.industry,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
}

// Complete onboarding
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { role, industry, goals, company_name } = body;

    // Validate required fields
    if (!role || !industry) {
      return NextResponse.json(
        { error: 'Role and industry are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Update user with onboarding data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error: updateError } = await (supabase as any)
      .from('users')
      .update({
        role,
        industry,
        preferences: {
          goals: goals || [],
          company_name: company_name || null,
          show_tour: true, // Enable tour for new users
        },
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update user:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete onboarding' },
        { status: 500 }
      );
    }

    // Create initial user_progress record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_progress')
      .upsert({
        user_id: user.id,
        total_calls: 0,
        total_duration_seconds: 0,
        current_streak: 0,
        longest_streak: 0,
      }, { onConflict: 'user_id' });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        industry: user.industry,
        onboarding_completed: true,
      },
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
