import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
    const { industry, role, personality, difficulty, callType } = body;

    // Validate required fields
    if (!industry || !role || !personality || !difficulty || !callType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate persona using Gemini (primary) with Groq fallback
    let persona;
    let provider = 'gemini';

    try {
      persona = await generateGeminiPersona({
        industry,
        role,
        personality,
        difficulty,
        callType,
      });
    } catch (geminiError) {
      console.error('Gemini persona generation failed, falling back to Groq:', geminiError);
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
        console.error('Groq persona generation also failed:', groqError);
        throw new Error('Failed to generate persona with both providers');
      }
    }

    return NextResponse.json({
      success: true,
      persona,
      provider,
    });
  } catch (error) {
    console.error('Persona generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate persona' },
      { status: 500 }
    );
  }
}
