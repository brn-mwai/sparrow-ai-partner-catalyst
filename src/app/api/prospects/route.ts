import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET /api/prospects - Fetch all prospects with user stats
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Fetch prospects (both defaults and user-created)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prospects, error: prospectsError } = await (supabase as any)
      .from('prospects')
      .select('*')
      .or(`is_default.eq.true,created_by.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (prospectsError) {
      console.error('Error fetching prospects:', prospectsError);
      return NextResponse.json({ error: 'Failed to fetch prospects' }, { status: 500 });
    }

    // Fetch user's stats for each prospect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: stats } = await (supabase as any)
      .from('user_prospect_stats')
      .select('*')
      .eq('user_id', user.id);

    // Fetch user's favorite prospects (stored in user preferences)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userPrefs } = await (supabase as any)
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const favorites = (userPrefs?.preferences as any)?.favorite_prospects || [];

    // Combine prospects with stats and favorites
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prospectsWithStats = prospects?.map((prospect: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prospectStats = stats?.find((s: any) => s.prospect_id === prospect.id);
      return {
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
        createdBy: prospect.created_by,
        createdAt: prospect.created_at,
        timesUsed: prospectStats?.calls_count || 0,
        avgScore: prospectStats?.avg_score || null,
        bestScore: prospectStats?.best_score || null,
        lastCallAt: prospectStats?.last_call_at || null,
        isFavorite: favorites.includes(prospect.id),
      };
    });

    return NextResponse.json({
      success: true,
      prospects: prospectsWithStats,
    });
  } catch (error) {
    console.error('Prospects fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch prospects' },
      { status: 500 }
    );
  }
}

// POST /api/prospects - Create a new prospect
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const body = await req.json();
    const {
      firstName,
      lastName,
      title,
      companyName,
      companySize,
      industry,
      difficulty,
      personalityTraits,
      background,
      objections,
      voiceId,
      speakingStyle,
      speakingPace,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !title || !companyName || !companySize || !industry) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert prospect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prospect, error } = await (supabase as any)
      .from('prospects')
      .insert({
        first_name: firstName,
        last_name: lastName,
        title,
        company_name: companyName,
        company_size: companySize,
        industry,
        difficulty: difficulty || 'medium',
        personality_traits: personalityTraits || [],
        background,
        objections,
        voice_id: voiceId,
        speaking_style: speakingStyle || 'conversational',
        speaking_pace: speakingPace || 'normal',
        is_default: false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prospect:', error);
      return NextResponse.json({ error: 'Failed to create prospect' }, { status: 500 });
    }

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
        personalityTraits: prospect.personality_traits,
        background: prospect.background,
        objections: prospect.objections,
        isDefault: prospect.is_default,
        createdAt: prospect.created_at,
        timesUsed: 0,
        avgScore: null,
        isFavorite: false,
      },
    });
  } catch (error) {
    console.error('Prospect creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create prospect' },
      { status: 500 }
    );
  }
}
