// ============================================
// SPARROW AI - Health Check API
// GET /api/health
// ============================================

import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      ai: {
        gemini: {
          configured: !!process.env.GOOGLE_AI_API_KEY,
          role: 'primary',
        },
        groq: {
          configured: !!process.env.GROQ_API_KEY,
          role: 'fast-inference',
        },
      },
      voice: {
        elevenlabs: {
          configured: !!process.env.ELEVENLABS_API_KEY && !!process.env.ELEVENLABS_AGENT_ID,
          role: 'conversational-ai',
        },
      },
      database: {
        supabase: {
          configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      },
      auth: {
        clerk: {
          configured: !!process.env.CLERK_SECRET_KEY,
        },
      },
    },
  };

  // Check if critical services are configured
  const criticalServicesOk =
    (!!process.env.GOOGLE_AI_API_KEY || !!process.env.GROQ_API_KEY) && // At least one AI provider
    !!process.env.ELEVENLABS_API_KEY && // Voice AI
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && // Database
    !!process.env.CLERK_SECRET_KEY; // Auth

  if (!criticalServicesOk) {
    return NextResponse.json(
      { ...health, status: 'degraded' },
      { status: 503 }
    );
  }

  return NextResponse.json(health);
}
