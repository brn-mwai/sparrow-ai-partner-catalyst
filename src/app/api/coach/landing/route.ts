// ============================================
// SPARROW AI - Landing Page Coach API
// POST /api/coach/landing - Chat without auth
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { chat, GROQ_MODELS } from '@/lib/groq/client';
import type { ChatMessage } from '@/lib/groq/client';
import { LANDING_COACH_SYSTEM_PROMPT } from '@/lib/coach/landing-context';

export const runtime = 'nodejs';

// Rate limiting - simple in-memory store (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Limit conversation length for unauthenticated users
    const limitedMessages = messages.slice(-6); // Last 6 messages only

    // Build messages array for Groq
    const groqMessages: ChatMessage[] = [
      { role: 'system', content: LANDING_COACH_SYSTEM_PROMPT },
      ...limitedMessages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Call Groq API with fast model for landing page
    const response = await chat(groqMessages, {
      model: GROQ_MODELS.LLAMA_3_1_8B_INSTANT, // Fast model for landing page
      temperature: 0.7,
      maxTokens: 512, // Shorter responses for landing page
    });

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error('Landing coach error:', error);
    return NextResponse.json(
      { error: 'Failed to get response. Please try again.' },
      { status: 500 }
    );
  }
}
