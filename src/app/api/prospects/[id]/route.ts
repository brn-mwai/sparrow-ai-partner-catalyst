import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// DELETE /api/prospects/[id] - Delete a prospect
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Get user's database ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if prospect exists and is deletable (not default, belongs to user)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prospect } = await (supabase as any)
      .from('prospects')
      .select('id, is_default, created_by')
      .eq('id', id)
      .single();

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    if (prospect.is_default) {
      return NextResponse.json({ error: 'Cannot delete default prospects' }, { status: 403 });
    }

    if (prospect.created_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this prospect' }, { status: 403 });
    }

    // Delete the prospect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('prospects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting prospect:', error);
      return NextResponse.json({ error: 'Failed to delete prospect' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prospect deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete prospect' },
      { status: 500 }
    );
  }
}

// GET /api/prospects/[id] - Get a specific prospect
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Get user's database ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
      .from('users')
      .select('id, preferences')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the prospect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prospect, error } = await (supabase as any)
      .from('prospects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Get user stats for this prospect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: stats } = await (supabase as any)
      .from('user_prospect_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('prospect_id', id)
      .single();

    const favorites = (user.preferences as any)?.favorite_prospects || [];

    return NextResponse.json({
      success: true,
      prospect: {
        id: prospect.id,
        name: `${prospect.first_name} ${prospect.last_name}`,
        firstName: prospect.first_name,
        lastName: prospect.last_name,
        title: prospect.title,
        company: prospect.company_name,
        companySize: prospect.company_size,
        industry: prospect.industry,
        difficulty: prospect.difficulty,
        personalityTraits: prospect.personality_traits || [],
        background: prospect.background,
        objections: prospect.objections,
        voiceId: prospect.voice_id,
        speakingStyle: prospect.speaking_style,
        speakingPace: prospect.speaking_pace,
        isDefault: prospect.is_default,
        createdAt: prospect.created_at,
        timesUsed: stats?.calls_count || 0,
        avgScore: stats?.avg_score || null,
        bestScore: stats?.best_score || null,
        isFavorite: favorites.includes(prospect.id),
      },
    });
  } catch (error) {
    console.error('Prospect fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch prospect' },
      { status: 500 }
    );
  }
}
