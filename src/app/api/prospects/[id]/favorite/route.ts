import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// POST /api/prospects/[id]/favorite - Toggle favorite status
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: prospectId } = await params;
    const supabase = createAdminClient();

    // Get user's database ID and preferences
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
      .from('users')
      .select('id, preferences')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current favorites
    const currentPrefs = (user.preferences as any) || {};
    const favorites: string[] = currentPrefs.favorite_prospects || [];

    // Toggle favorite
    let isFavorite: boolean;
    let newFavorites: string[];

    if (favorites.includes(prospectId)) {
      // Remove from favorites
      newFavorites = favorites.filter((id) => id !== prospectId);
      isFavorite = false;
    } else {
      // Add to favorites
      newFavorites = [...favorites, prospectId];
      isFavorite = true;
    }

    // Update user preferences
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('users')
      .update({
        preferences: {
          ...currentPrefs,
          favorite_prospects: newFavorites,
        },
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating favorites:', error);
      return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isFavorite,
    });
  } catch (error) {
    console.error('Favorite toggle error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
