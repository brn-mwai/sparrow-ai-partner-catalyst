// ============================================
// SPARROW AI - Coach Sparrow Chat API
// POST /api/coach - Chat with AI sales coach
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { chat, GROQ_MODELS } from '@/lib/groq/client';
import type { ChatMessage } from '@/lib/groq/client';

export const runtime = 'nodejs';

// Available models for chat
const CHAT_MODELS = {
  'llama-3.1-8b': {
    id: GROQ_MODELS.LLAMA_3_1_8B_INSTANT,
    name: 'Llama 3.1 8B',
    description: 'Fast responses',
    speed: 'fast',
  },
  'llama-3.3-70b': {
    id: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
    name: 'Llama 3.3 70B',
    description: 'Best quality',
    speed: 'medium',
  },
  'llama-4-scout': {
    id: GROQ_MODELS.LLAMA_4_SCOUT_17B,
    name: 'Llama 4 Scout',
    description: 'Latest model',
    speed: 'fast',
  },
  'qwen-32b': {
    id: GROQ_MODELS.QWEN3_32B,
    name: 'Qwen3 32B',
    description: 'Multilingual',
    speed: 'medium',
  },
  'compound': {
    id: GROQ_MODELS.COMPOUND,
    name: 'Groq Compound',
    description: 'Multi-step reasoning',
    speed: 'medium',
  },
};

const COACH_SYSTEM_PROMPT = `You are Coach Sparrow, an expert AI sales coach helping sales professionals improve their skills. You specialize in:

1. **Cold Calling**: Opening techniques, earning attention, value propositions, handling gatekeepers
2. **Discovery Calls**: SPIN selling, pain point exploration, qualification, active listening
3. **Objection Handling**: Reframing, "Feel-Felt-Found" technique, addressing concerns
4. **Closing**: Asking for next steps, trial closes, commitment patterns
5. **Call Control**: Guiding conversations, handling tangents, time management

Your personality:
- Encouraging but direct - you give honest feedback
- Practical - focus on actionable tips they can use immediately
- You use examples and role-play scenarios when helpful
- Keep responses concise (2-4 paragraphs max) unless asked for more detail
- Reference sales methodologies when relevant (SPIN, Challenger, MEDDIC, etc.)

If asked about topics outside sales training, politely redirect to sales-related topics.

Always end with a practical tip or question to keep the conversation productive.`;

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
    const { messages, model = 'llama-3.3-70b', systemPrompt } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the model ID
    const selectedModel = CHAT_MODELS[model as keyof typeof CHAT_MODELS];
    if (!selectedModel) {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    // Use custom system prompt if provided (for transcript analysis), otherwise use default
    const effectiveSystemPrompt = systemPrompt || COACH_SYSTEM_PROMPT;

    // Build messages array for Groq
    const groqMessages: ChatMessage[] = [
      { role: 'system', content: effectiveSystemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Call Groq API
    const response = await chat(groqMessages, {
      model: selectedModel.id,
      temperature: 0.7,
      maxTokens: 1024,
    });

    return NextResponse.json({
      success: true,
      message: response,
      model: selectedModel.name,
    });
  } catch (error) {
    console.error('Coach chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Coach Sparrow' },
      { status: 500 }
    );
  }
}

// GET endpoint to list available models
export async function GET() {
  return NextResponse.json({
    models: Object.entries(CHAT_MODELS).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      speed: value.speed,
    })),
  });
}
