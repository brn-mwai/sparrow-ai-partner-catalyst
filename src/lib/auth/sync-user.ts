// ============================================
// SPARROW AI - User Sync Helper
// Ensures user exists in Supabase after Clerk auth
// ============================================

import { currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export interface SyncedUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  role: string | null;
  industry: string | null;
  onboarding_completed: boolean;
  plan: string;
  created_at: string;
}

/**
 * Syncs the current Clerk user to Supabase.
 * Creates the user if they don't exist, or returns existing user.
 * This is a fallback in case the webhook didn't fire.
 */
export async function syncUser(): Promise<SyncedUser | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const supabase = createAdminClient();

  // Check if user already exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingUser, error: fetchError } = await (supabase as any)
    .from('users')
    .select('*')
    .eq('clerk_id', clerkUser.id)
    .single();

  if (existingUser && !fetchError) {
    return existingUser as SyncedUser;
  }

  // User doesn't exist, create them
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    console.error('No email found for Clerk user:', clerkUser.id);
    return null;
  }

  const name = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ') || null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newUser, error: insertError } = await (supabase as any)
    .from('users')
    .insert({
      clerk_id: clerkUser.id,
      email,
      name,
      plan: 'free',
      onboarding_completed: false,
    })
    .select()
    .single();

  if (insertError) {
    // If insert fails due to duplicate, try to fetch again
    if (insertError.code === '23505') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: retryUser } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('clerk_id', clerkUser.id)
        .single();
      return retryUser as SyncedUser;
    }
    console.error('Failed to create user in Supabase:', insertError);
    return null;
  }

  return newUser as SyncedUser;
}

/**
 * Check if the current user has completed onboarding
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const user = await syncUser();
  return user?.onboarding_completed ?? false;
}

/**
 * Get the Supabase user ID for the current Clerk user
 */
export async function getSupabaseUserId(): Promise<string | null> {
  const user = await syncUser();
  return user?.id ?? null;
}
