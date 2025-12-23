// ============================================
// SPARROW AI - User Profile API
// GET /api/user/profile - Get user profile
// PATCH /api/user/profile - Update user profile
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { User, UserRole, UserPlan } from '@/types/database';

export const runtime = 'nodejs';

// GET - Fetch user profile
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
    const { data: userData, error } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error || !userData) {
      // Create user if doesn't exist
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newUser, error: createError } = await (supabase as any)
        .from('users')
        .insert({
          clerk_id: userId,
          email: `${userId}@placeholder.com`,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: newUser as User,
      });
    }

    return NextResponse.json({
      success: true,
      user: userData as User,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, role, industry, company, preferences, onboarding_completed } = body;

    const supabase = createAdminClient();

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role as UserRole;
    if (industry !== undefined) updates.industry = industry;
    if (company !== undefined) updates.company = company;
    if (preferences !== undefined) updates.preferences = preferences;
    if (onboarding_completed !== undefined) updates.onboarding_completed = onboarding_completed;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData, error } = await (supabase as any)
      .from('users')
      .update(updates)
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData as User,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
