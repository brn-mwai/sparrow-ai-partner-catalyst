import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generatePersona as generateGeminiPersona } from '@/lib/gemini/client';
import { generatePersona as generateGroqPersona } from '@/lib/groq/client';
import type { CallType, PersonalityType, DifficultyLevel } from '@/types/database';

export const runtime = 'nodejs';

interface GeneratePersonaRequest {
  industry: string;
  role: string;
  personality: PersonalityType;
  difficulty: DifficultyLevel;
  callType: CallType;
  saveToProspects?: boolean; // Optional flag to skip saving (default: true)
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: GeneratePersonaRequest = await req.json();
    const { industry, role, personality, difficulty, callType, saveToProspects = true } = body;

    // Validate required fields
    if (!industry || !role || !personality || !difficulty || !callType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if API keys are configured
    const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const hasGroqKey = !!process.env.GROQ_API_KEY;

    if (!hasGeminiKey && !hasGroqKey) {
      return NextResponse.json(
        { error: 'No AI API keys configured. Please set GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY.' },
        { status: 500 }
      );
    }

    // Generate persona using Gemini (primary) with Groq fallback
    let persona;
    let provider = 'gemini';
    let lastError: Error | null = null;

    if (hasGeminiKey) {
      try {
        persona = await generateGeminiPersona({
          industry,
          role,
          personality,
          difficulty,
          callType,
        });
      } catch (geminiError) {
        console.error('Gemini persona generation failed:', geminiError);
        lastError = geminiError instanceof Error ? geminiError : new Error('Gemini generation failed');
      }
    }

    if (!persona && hasGroqKey) {
      provider = 'groq';
      try {
        persona = await generateGroqPersona({
          industry,
          role,
          personality,
          difficulty,
          callType,
        });
      } catch (groqError) {
        console.error('Groq persona generation failed:', groqError);
        lastError = groqError instanceof Error ? groqError : new Error('Groq generation failed');
      }
    }

    if (!persona) {
      const errorMessage = lastError?.message || 'Failed to generate persona with available providers';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Save the generated persona to the prospects table
    let prospectId: string | null = null;
    if (saveToProspects) {
      try {
        const supabase = createAdminClient();

        // Get user's database ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: user } = await (supabase as any)
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (user) {
          // Parse name into first and last name
          const nameParts = (persona.name || 'AI Prospect').split(' ');
          const firstName = nameParts[0] || 'AI';
          const lastName = nameParts.slice(1).join(' ') || 'Prospect';

          // Insert prospect into database
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: prospect, error: insertError } = await (supabase as any)
            .from('prospects')
            .insert({
              first_name: firstName,
              last_name: lastName,
              title: persona.title || role,
              company_name: persona.company || 'Generated Company',
              company_size: persona.company_size || '51-200',
              industry: persona.industry || industry,
              difficulty: difficulty,
              personality_traits: [personality],
              background: persona.background || null,
              objections: persona.objections?.join('. ') || null,
              voice_id: null, // Will be assigned when call starts
              speaking_style: 'conversational',
              speaking_pace: 'normal',
              is_default: false,
              created_by: user.id,
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('Failed to save prospect:', insertError);
          } else if (prospect) {
            prospectId = prospect.id;
            console.log('Saved generated persona as prospect:', prospectId);
          }
        }
      } catch (saveError) {
        // Don't fail the request if saving fails - just log it
        console.error('Error saving prospect:', saveError);
      }
    }

    return NextResponse.json({
      success: true,
      persona,
      provider,
      prospectId, // Return the prospect ID if saved
    });
  } catch (error) {
    console.error('Persona generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate persona' },
      { status: 500 }
    );
  }
}
