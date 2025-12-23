# Sparrow AI - System Architecture

> **Purpose**: Complete technical architecture reference for building Sparrow AI  
> **Version**: 1.0  
> **Last Updated**: December 23, 2024

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [High-Level System Diagram](#2-high-level-system-diagram)
3. [Technology Stack](#3-technology-stack)
4. [Service Architecture](#4-service-architecture)
5. [Data Flow](#5-data-flow)
6. [Database Schema](#6-database-schema)
7. [API Architecture](#7-api-architecture)
8. [Authentication Flow](#8-authentication-flow)
9. [Real-Time Communication](#9-real-time-communication)
10. [Voice Conversation Pipeline](#10-voice-conversation-pipeline)
11. [Scoring Pipeline](#11-scoring-pipeline)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Security Architecture](#13-security-architecture)
14. [Error Handling Strategy](#14-error-handling-strategy)
15. [Performance Considerations](#15-performance-considerations)

---

## 1. Architecture Overview

### Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Voice-First** | ElevenLabs Conversational AI as the primary interaction layer |
| **Real-Time** | Supabase Realtime for instant transcript updates |
| **Serverless** | Vercel Edge Functions for low-latency API routes |
| **Type-Safe** | TypeScript strict mode throughout |
| **Observable** | Comprehensive logging on all LLM operations |

### System Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SPARROW AI SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────────────────────────────────────────┐  │
│   │   CLIENT    │     │                    BACKEND                       │  │
│   │             │     │                                                  │  │
│   │  Next.js    │◄───►│  API Routes    │  Webhooks    │  Background     │  │
│   │  React      │     │  (Vercel)      │  (Clerk/EL)  │  Jobs           │  │
│   │  Browser    │     │                                                  │  │
│   └─────────────┘     └─────────────────────────────────────────────────┘  │
│          │                              │                                   │
│          │                              │                                   │
│          ▼                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         EXTERNAL SERVICES                            │  │
│   │                                                                      │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│  │
│   │  │ElevenLabs│  │  Gemini  │  │   Groq   │  │ Supabase │  │ Clerk  ││  │
│   │  │Voice AI  │  │  2.0     │  │  (Fast)  │  │ Database │  │  Auth  ││  │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘│  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. High-Level System Diagram

### Complete Architecture

```
                                    ┌─────────────────┐
                                    │   CLOUDFLARE    │
                                    │   (DNS + CDN)   │
                                    └────────┬────────┘
                                             │
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                                    VERCEL                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                            NEXT.JS APPLICATION                            │  │
│  │                                                                           │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │  │
│  │  │   PAGES/APP     │  │   API ROUTES    │  │      MIDDLEWARE         │   │  │
│  │  │                 │  │                 │  │                         │   │  │
│  │  │ • Landing       │  │ • /api/calls    │  │ • Auth (Clerk)          │   │  │
│  │  │ • Dashboard     │  │ • /api/personas │  │ • Rate Limiting         │   │  │
│  │  │ • Practice      │  │ • /api/user     │  │ • CORS                  │   │  │
│  │  │ • Call UI       │  │ • /api/webhooks │  │ • Logging               │   │  │
│  │  │ • Debrief       │  │ • /api/health   │  │                         │   │  │
│  │  │ • History       │  │                 │  │                         │   │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘   │  │
│  │           │                    │                      │                   │  │
│  └───────────┼────────────────────┼──────────────────────┼───────────────────┘  │
│              │                    │                      │                      │
└──────────────┼────────────────────┼──────────────────────┼──────────────────────┘
               │                    │                      │
               ▼                    ▼                      ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    EXTERNAL SERVICES                          │
        │                                                               │
        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
        │  │   CLERK     │  │  SUPABASE   │  │    ELEVENLABS       │   │
        │  │             │  │             │  │                     │   │
        │  │ • Auth      │  │ • Postgres  │  │ • Conversational AI │   │
        │  │ • Sessions  │  │ • Realtime  │  │ • Voice Synthesis   │   │
        │  │ • Webhooks  │  │ • Storage   │  │ • Speech-to-Text    │   │
        │  └─────────────┘  └─────────────┘  └─────────────────────┘   │
        │                                                               │
        │  ┌─────────────┐  ┌─────────────┐                             │
        │  │   GEMINI    │  │    GROQ     │                             │
        │  │             │  │             │                             │
        │  │ • Personas  │  │ • Fast      │                             │
        │  │ • Scoring   │  │   Scoring   │                             │
        │  │ • Feedback  │  │ • Fallback  │                             │
        │  └─────────────┘  └─────────────┘                             │
        │                                                               │
        └───────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | Component library |
| Zustand | 4.x | Client state management |
| React Query | 5.x | Server state management |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 15.x | Serverless API |
| Edge Runtime | Latest | Low-latency routes |
| Node.js | 20.x | Server runtime |

### External Services

| Service | Purpose | Tier |
|---------|---------|------|
| Clerk | Authentication | Pro |
| Supabase | Database + Realtime | Pro |
| ElevenLabs | Voice AI | Creator+ |
| Google Gemini | LLM (Personas/Scoring) | Pay-as-you-go |
| Groq | Fast LLM (Quick Scoring) | Free/Pro |
| Vercel | Hosting | Pro |

### Development Tools

| Tool | Purpose |
|------|---------|
| pnpm | Package manager |
| ESLint | Linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| Vitest | Unit testing |
| Playwright | E2E testing |

---

## 4. Service Architecture

### 4.1 Clerk (Authentication)

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLERK AUTH FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Browser                    Clerk                   Supabase    │
│      │                         │                         │       │
│      │──── Sign Up/In ────────►│                         │       │
│      │                         │                         │       │
│      │◄─── Session Token ──────│                         │       │
│      │                         │                         │       │
│      │                         │──── Webhook ───────────►│       │
│      │                         │     (user.created)      │       │
│      │                         │                         │       │
│      │                         │                    Create User  │
│      │                         │                         │       │
│      │──── API Request ───────►│                         │       │
│      │     (with token)        │                         │       │
│      │                         │                         │       │
│      │◄─── Validated ──────────│                         │       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Configuration:**
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health',
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});
```

### 4.2 Supabase (Database + Realtime)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     POSTGRES DATABASE                     │   │
│  │                                                           │   │
│  │  ┌─────────┐  ┌─────────┐  ┌────────────┐  ┌──────────┐  │   │
│  │  │  users  │  │  calls  │  │ transcripts│  │  scores  │  │   │
│  │  └─────────┘  └─────────┘  └────────────┘  └──────────┘  │   │
│  │                                                           │   │
│  │  Row Level Security (RLS) enabled on all tables           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    REALTIME ENGINE                        │   │
│  │                                                           │   │
│  │  • Postgres Changes (INSERT/UPDATE on transcripts)        │   │
│  │  • Broadcast (call status updates)                        │   │
│  │  • Presence (active calls indicator)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 ElevenLabs (Voice AI)

```
┌─────────────────────────────────────────────────────────────────┐
│                  ELEVENLABS INTEGRATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Browser (Client-Side)              ElevenLabs API              │
│          │                                  │                    │
│          │                                  │                    │
│   ┌──────────────┐                  ┌──────────────┐            │
│   │ @11labs/react│                  │Conversational│            │
│   │    SDK       │◄────WebSocket───►│    AI API    │            │
│   └──────────────┘                  └──────────────┘            │
│          │                                  │                    │
│          │                                  │                    │
│          ▼                                  ▼                    │
│   ┌──────────────┐                  ┌──────────────┐            │
│   │ Audio Input  │                  │ Agent Config │            │
│   │ (Microphone) │                  │ • Voice ID   │            │
│   └──────────────┘                  │ • Prompt     │            │
│          │                          │ • First Msg  │            │
│          ▼                          └──────────────┘            │
│   ┌──────────────┐                                              │
│   │ Audio Output │                                              │
│   │ (Speaker)    │                                              │
│   └──────────────┘                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Agent Configuration:**
```typescript
// lib/elevenlabs/agent-config.ts
interface AgentConfig {
  agentId: string;
  overrides: {
    agent: {
      prompt: {
        prompt: string;  // Persona prompt from Gemini
      };
      firstMessage: string;  // Mode-specific opening
      language: string;
    };
    tts: {
      voiceId: string;  // Persona-specific voice
    };
  };
}
```

### 4.4 Gemini (LLM)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GEMINI INTEGRATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Use Cases:                                                     │
│                                                                  │
│   1. PERSONA GENERATION                                          │
│      Input: Industry, Role, Personality, Difficulty              │
│      Output: Full persona with backstory, objections, voice      │
│                                                                  │
│   2. DEEP CALL ANALYSIS                                          │
│      Input: Full transcript, mode, persona                       │
│      Output: Detailed scoring with timestamps                    │
│                                                                  │
│   3. FEEDBACK SYNTHESIS                                          │
│      Input: Scores, transcript highlights                        │
│      Output: Actionable coaching feedback                        │
│                                                                  │
│   Model: gemini-2.0-flash                                        │
│   Temperature: 0.7 (personas), 0.3 (scoring)                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Groq (Fast LLM)

```
┌─────────────────────────────────────────────────────────────────┐
│                      GROQ INTEGRATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Use Case: QUICK SCORING (< 2 seconds)                          │
│                                                                  │
│   Input: Transcript summary                                      │
│   Output: Initial score (0-100) + brief feedback                 │
│                                                                  │
│   Model: llama-3.1-70b-versatile                                 │
│   Temperature: 0.2                                               │
│                                                                  │
│   Why Groq?                                                      │
│   • Ultra-fast inference (~200ms)                                │
│   • Provides immediate feedback while Gemini does deep analysis  │
│   • Fallback if Gemini is slow                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Flow

### 5.1 Complete Call Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPLETE CALL DATA FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: SETUP                                                              │
│  ─────────────────                                                           │
│                                                                              │
│  User selects mode + persona                                                 │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ POST /api/  │────►│   Gemini    │────►│  Supabase   │                    │
│  │ personas/   │     │  Generate   │     │  Store      │                    │
│  │ generate    │     │  Persona    │     │  Persona    │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐     ┌─────────────┐                                        │
│  │ POST /api/  │────►│  Supabase   │                                        │
│  │ calls       │     │  Create     │                                        │
│  │             │     │  Call Row   │                                        │
│  └─────────────┘     └─────────────┘                                        │
│                                                                              │
│  PHASE 2: CONVERSATION                                                       │
│  ─────────────────────                                                       │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │   Browser   │◄───►│ ElevenLabs  │     │  Supabase   │                    │
│  │   Audio     │     │ WebSocket   │────►│  Realtime   │                    │
│  │   Stream    │     │             │     │  Transcript │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│         │                                       │                            │
│         ▼                                       ▼                            │
│  ┌─────────────┐                        ┌─────────────┐                     │
│  │  Live       │◄───────────────────────│  Realtime   │                     │
│  │  Transcript │                        │  Subscription│                    │
│  │  UI         │                        └─────────────┘                     │
│  └─────────────┘                                                            │
│                                                                              │
│  PHASE 3: SCORING                                                            │
│  ────────────────                                                            │
│                                                                              │
│  User ends call                                                              │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐                                                            │
│  │ POST /api/  │                                                            │
│  │ calls/:id/  │                                                            │
│  │ end         │                                                            │
│  └─────────────┘                                                            │
│         │                                                                    │
│         ├──────────────────────┬────────────────────────┐                   │
│         ▼                      ▼                        ▼                   │
│  ┌─────────────┐       ┌─────────────┐         ┌─────────────┐             │
│  │    Groq     │       │   Gemini    │         │  Supabase   │             │
│  │  Quick      │       │  Deep       │         │  Update     │             │
│  │  Score      │       │  Analysis   │         │  Call       │             │
│  │  (~200ms)   │       │  (~2-3s)    │         │  Status     │             │
│  └─────────────┘       └─────────────┘         └─────────────┘             │
│         │                      │                                            │
│         │                      │                                            │
│         ▼                      ▼                                            │
│  ┌─────────────┐       ┌─────────────┐                                     │
│  │  Show       │       │  Show       │                                     │
│  │  Quick      │       │  Detailed   │                                     │
│  │  Score      │       │  Feedback   │                                     │
│  └─────────────┘       └─────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Transcript Streaming Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  REAL-TIME TRANSCRIPT FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ElevenLabs                API                    Browser        │
│      │                      │                        │           │
│      │──── Transcript ─────►│                        │           │
│      │     Chunk            │                        │           │
│      │                      │                        │           │
│      │                      │──── Insert ───────────►│           │
│      │                      │     Supabase           │           │
│      │                      │                        │           │
│      │                      │                   ┌────┴────┐      │
│      │                      │                   │Realtime │      │
│      │                      │                   │Subscribe│      │
│      │                      │                   └────┬────┘      │
│      │                      │                        │           │
│      │                      │◄───── Broadcast ───────│           │
│      │                      │                        │           │
│      │                      │                        ▼           │
│      │                      │                   ┌─────────┐      │
│      │                      │                   │ Update  │      │
│      │                      │                   │ UI      │      │
│      │                      │                   └─────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA (ERD)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐         ┌─────────────────┐                            │
│  │      users      │         │    personas     │                            │
│  ├─────────────────┤         ├─────────────────┤                            │
│  │ id (PK)         │         │ id (PK)         │                            │
│  │ clerk_id (UQ)   │         │ name            │                            │
│  │ email           │         │ role            │                            │
│  │ full_name       │         │ company         │                            │
│  │ avatar_url      │         │ industry        │                            │
│  │ onboarding_done │         │ personality     │                            │
│  │ created_at      │         │ difficulty      │                            │
│  │ updated_at      │         │ backstory       │                            │
│  └────────┬────────┘         │ hidden_pains    │                            │
│           │                  │ objections      │                            │
│           │                  │ voice_id        │                            │
│           │                  │ system_prompt   │                            │
│           │                  │ is_preset       │                            │
│           │                  │ created_at      │                            │
│           │                  └────────┬────────┘                            │
│           │                           │                                      │
│           │         ┌─────────────────┘                                      │
│           │         │                                                        │
│           ▼         ▼                                                        │
│  ┌─────────────────────┐                                                    │
│  │       calls         │                                                    │
│  ├─────────────────────┤                                                    │
│  │ id (PK)             │                                                    │
│  │ user_id (FK)        │────────────────────────────────┐                   │
│  │ persona_id (FK)     │                                │                   │
│  │ mode                │                                │                   │
│  │ status              │                                │                   │
│  │ started_at          │                                │                   │
│  │ ended_at            │                                │                   │
│  │ duration_seconds    │                                │                   │
│  │ elevenlabs_conv_id  │                                │                   │
│  │ created_at          │                                │                   │
│  │ updated_at          │                                │                   │
│  └──────────┬──────────┘                                │                   │
│             │                                           │                   │
│             │                                           │                   │
│     ┌───────┴───────┐                                   │                   │
│     │               │                                   │                   │
│     ▼               ▼                                   │                   │
│  ┌─────────────┐  ┌─────────────────┐                   │                   │
│  │ transcripts │  │     scores      │                   │                   │
│  ├─────────────┤  ├─────────────────┤                   │                   │
│  │ id (PK)     │  │ id (PK)         │                   │                   │
│  │ call_id(FK) │  │ call_id (FK,UQ) │                   │                   │
│  │ role        │  │ overall_score   │                   │                   │
│  │ content     │  │ opening_score   │                   │                   │
│  │ timestamp   │  │ discovery_score │                   │                   │
│  │ created_at  │  │ objection_score │                   │                   │
│  └─────────────┘  │ communication   │                   │                   │
│                   │ closing_score   │                   │                   │
│                   │ strengths       │                   │                   │
│                   │ improvements    │                   │                   │
│                   │ key_moments     │                   │                   │
│                   │ created_at      │                   │                   │
│                   └─────────────────┘                   │                   │
│                                                         │                   │
│                                                         │                   │
│                                           ┌─────────────┴───────┐           │
│                                           │    user_stats       │           │
│                                           ├─────────────────────┤           │
│                                           │ id (PK)             │           │
│                                           │ user_id (FK, UQ)    │           │
│                                           │ total_calls         │           │
│                                           │ total_duration      │           │
│                                           │ avg_score           │           │
│                                           │ best_score          │           │
│                                           │ current_streak      │           │
│                                           │ longest_streak      │           │
│                                           │ last_call_date      │           │
│                                           │ updated_at          │           │
│                                           └─────────────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 SQL Schema

```sql
-- Users table (synced from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personas table
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  industry TEXT NOT NULL,
  personality TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  backstory TEXT NOT NULL,
  hidden_pains JSONB NOT NULL DEFAULT '[]',
  objections JSONB NOT NULL DEFAULT '[]',
  voice_id TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  first_message TEXT,
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls table
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id),
  mode TEXT NOT NULL CHECK (mode IN ('cold_call', 'discovery', 'objection_gauntlet')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  elevenlabs_conversation_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcripts table
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  opening_score INTEGER CHECK (opening_score >= 0 AND opening_score <= 100),
  discovery_score INTEGER CHECK (discovery_score >= 0 AND discovery_score <= 100),
  objection_score INTEGER CHECK (objection_score >= 0 AND objection_score <= 100),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  closing_score INTEGER CHECK (closing_score >= 0 AND closing_score <= 100),
  strengths JSONB NOT NULL DEFAULT '[]',
  improvements JSONB NOT NULL DEFAULT '[]',
  key_moments JSONB NOT NULL DEFAULT '[]',
  raw_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats table (denormalized for performance)
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_calls INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_call_date DATE,
  calls_by_mode JSONB DEFAULT '{"cold_call": 0, "discovery": 0, "objection_gauntlet": 0}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX idx_transcripts_timestamp ON transcripts(timestamp_ms);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_id = current_setting('app.clerk_user_id', true));

CREATE POLICY "Users can view own calls" ON calls
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_user_id', true)
  ));

CREATE POLICY "Users can view own transcripts" ON transcripts
  FOR SELECT USING (call_id IN (
    SELECT id FROM calls WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_user_id', true)
    )
  ));

CREATE POLICY "Users can view own scores" ON scores
  FOR SELECT USING (call_id IN (
    SELECT id FROM calls WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_user_id', true)
    )
  ));

CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_user_id', true)
  ));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transcripts;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
```

---

## 7. API Architecture

### 7.1 Route Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ROUTES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /api                                                                        │
│  │                                                                           │
│  ├── /health                    GET     Health check                         │
│  │                                                                           │
│  ├── /webhooks                                                               │
│  │   ├── /clerk                 POST    Clerk user events                    │
│  │   └── /elevenlabs            POST    ElevenLabs transcript callbacks      │
│  │                                                                           │
│  ├── /user                                                                   │
│  │   ├── /profile               GET     Get user profile                     │
│  │   ├── /profile               PATCH   Update user profile                  │
│  │   ├── /onboarding            POST    Complete onboarding                  │
│  │   └── /progress              GET     Get progress/stats                   │
│  │                                                                           │
│  ├── /personas                                                               │
│  │   ├── /                      GET     List preset personas                 │
│  │   └── /generate              POST    Generate custom persona              │
│  │                                                                           │
│  └── /calls                                                                  │
│      ├── /                      GET     List user's calls                    │
│      ├── /                      POST    Create new call                      │
│      ├── /start                 POST    Get ElevenLabs session config        │
│      └── /[id]                                                               │
│          ├── /                  GET     Get call details                     │
│          ├── /                  PATCH   Update call                          │
│          ├── /end               POST    End call + trigger scoring           │
│          ├── /transcript        POST    Add transcript entry                 │
│          ├── /transcript        GET     Get full transcript                  │
│          └── /score             GET     Get call score                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 API Route Specifications

#### POST /api/calls/start

```typescript
// Request
{
  callId: string;
  mode: 'cold_call' | 'discovery' | 'objection_gauntlet';
  personaId: string;
}

// Response
{
  success: true;
  agentConfig: {
    agentId: string;
    overrides: {
      agent: {
        prompt: { prompt: string };
        firstMessage: string;
        language: string;
      };
      tts: {
        voiceId: string;
      };
    };
  };
  signedUrl: string;  // Signed URL for ElevenLabs connection
}
```

#### POST /api/calls/[id]/end

```typescript
// Request
{
  elevenlabsConversationId: string;
}

// Response (immediate)
{
  success: true;
  callId: string;
  quickScore: {
    overall: number;
    summary: string;
  };
}

// Triggers async:
// 1. Groq quick scoring (returns in ~200ms)
// 2. Gemini deep analysis (returns in ~2-3s)
// 3. Supabase updates via realtime
```

### 7.3 Type Definitions

```typescript
// types/api.ts

// Call Types
export type CallMode = 'cold_call' | 'discovery' | 'objection_gauntlet';
export type CallStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Call {
  id: string;
  userId: string;
  personaId: string;
  mode: CallMode;
  status: CallStatus;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  elevenlabsConversationId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Persona Types
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Personality = 'skeptical' | 'busy' | 'friendly' | 'technical' | 'hostile';

export interface Persona {
  id: string;
  name: string;
  role: string;
  company: string;
  industry: string;
  personality: Personality;
  difficulty: Difficulty;
  backstory: string;
  hiddenPains: string[];
  objections: string[];
  voiceId: string;
  systemPrompt: string;
  firstMessage: string;
  isPreset: boolean;
}

// Score Types
export interface Score {
  id: string;
  callId: string;
  overallScore: number;
  openingScore: number;
  discoveryScore: number;
  objectionScore: number;
  communicationScore: number;
  closingScore: number;
  strengths: string[];
  improvements: string[];
  keyMoments: KeyMoment[];
  createdAt: string;
}

export interface KeyMoment {
  timestamp: number;
  type: 'strength' | 'improvement';
  description: string;
  quote: string;
}

// Transcript Types
export interface TranscriptEntry {
  id: string;
  callId: string;
  role: 'user' | 'assistant';
  content: string;
  timestampMs: number;
  createdAt: string;
}
```

---

## 8. Authentication Flow

### 8.1 Complete Auth Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SIGN UP FLOW                                                                │
│  ─────────────                                                               │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │ Landing │───►│ Clerk   │───►│ OAuth/  │───►│ Clerk   │───►│ Webhook │   │
│  │ Page    │    │ SignUp  │    │ Email   │    │ Session │    │ Fired   │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └────┬────┘   │
│                                                                    │        │
│                                                                    ▼        │
│                                                              ┌─────────┐    │
│                                                              │Supabase │    │
│                                                              │User     │    │
│                                                              │Created  │    │
│                                                              └────┬────┘    │
│                                                                   │         │
│                                                                   ▼         │
│                                                              ┌─────────┐    │
│                                                              │Onboard- │    │
│                                                              │ing Flow │    │
│                                                              └─────────┘    │
│                                                                              │
│  API REQUEST FLOW                                                            │
│  ────────────────                                                            │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │ Client  │───►│ Request │───►│ Middle- │───►│ Clerk   │───►│ API     │   │
│  │ Request │    │ + Token │    │ ware    │    │ Verify  │    │ Handler │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│                                     │                                        │
│                                     │ If invalid                             │
│                                     ▼                                        │
│                               ┌─────────┐                                    │
│                               │ 401     │                                    │
│                               │ Redirect│                                    │
│                               └─────────┘                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Clerk Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  
  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createServiceClient();

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    await supabase.from('users').insert({
      clerk_id: id,
      email: email_addresses[0]?.email_address,
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar_url: image_url,
    });
    
    // Create initial user_stats row
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', id)
      .single();
      
    if (user) {
      await supabase.from('user_stats').insert({
        user_id: user.id,
      });
    }
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    await supabase
      .from('users')
      .update({
        email: email_addresses[0]?.email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim(),
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', id);
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data;
    await supabase.from('users').delete().eq('clerk_id', id);
  }

  return new Response('OK', { status: 200 });
}
```

---

## 9. Real-Time Communication

### 9.1 Supabase Realtime Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REALTIME COMMUNICATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TRANSCRIPT STREAMING                                                        │
│  ────────────────────                                                        │
│                                                                              │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                │
│  │ ElevenLabs  │──────►│ API Route   │──────►│  Supabase   │                │
│  │ Callback    │       │ (INSERT)    │       │  Postgres   │                │
│  └─────────────┘       └─────────────┘       └──────┬──────┘                │
│                                                     │                        │
│                                               ┌─────┴─────┐                  │
│                                               │ Realtime  │                  │
│                                               │ Engine    │                  │
│                                               └─────┬─────┘                  │
│                                                     │                        │
│                              ┌───────────────┬──────┴──────┬───────────┐    │
│                              ▼               ▼             ▼           ▼    │
│                         ┌────────┐     ┌────────┐    ┌────────┐   ┌────────┐│
│                         │Client 1│     │Client 2│    │Client 3│   │Client N││
│                         │(User)  │     │(Admin) │    │(Debug) │   │        ││
│                         └────────┘     └────────┘    └────────┘   └────────┘│
│                                                                              │
│  CALL STATUS UPDATES                                                         │
│  ───────────────────                                                         │
│                                                                              │
│  Channel: calls:{call_id}                                                    │
│  Events:                                                                     │
│    • call:started                                                            │
│    • call:ended                                                              │
│    • score:ready                                                             │
│    • feedback:ready                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 React Hook for Realtime

```typescript
// hooks/use-realtime-transcript.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TranscriptEntry } from '@/types/api';

export function useRealtimeTranscript(callId: string) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const supabase = createClient();
    
    // Initial fetch
    const fetchTranscript = async () => {
      const { data } = await supabase
        .from('transcripts')
        .select('*')
        .eq('call_id', callId)
        .order('timestamp_ms', { ascending: true });
      
      if (data) {
        setTranscript(data);
      }
    };
    
    fetchTranscript();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel(`transcript:${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transcripts',
          filter: `call_id=eq.${callId}`,
        },
        (payload) => {
          setTranscript((prev) => [...prev, payload.new as TranscriptEntry]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId]);
  
  return { transcript, isConnected };
}
```

---

## 10. Voice Conversation Pipeline

### 10.1 ElevenLabs Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     VOICE CONVERSATION PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INITIALIZATION                                                              │
│  ──────────────                                                              │
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ User     │───►│ API:     │───►│ Generate │───►│ Return   │              │
│  │ Clicks   │    │ /start   │    │ Signed   │    │ Config   │              │
│  │ "Start"  │    │          │    │ URL      │    │          │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                                              │
│  CONVERSATION LOOP                                                           │
│  ─────────────────                                                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │    │
│  │  │ User     │───►│ Browser  │───►│ElevenLabs│───►│ LLM      │      │    │
│  │  │ Speaks   │    │ Captures │    │ STT      │    │ Process  │      │    │
│  │  │          │    │ Audio    │    │          │    │          │      │    │
│  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │    │
│  │                                                        │            │    │
│  │                                                        ▼            │    │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │    │
│  │  │ User     │◄───│ Browser  │◄───│ElevenLabs│◄───│ Generate │      │    │
│  │  │ Hears    │    │ Plays    │    │ TTS      │    │ Response │      │    │
│  │  │          │    │ Audio    │    │          │    │          │      │    │
│  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │    │
│  │                                                                      │    │
│  │  ──────────────────────── REPEAT ────────────────────────────────   │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  TRANSCRIPT CAPTURE                                                          │
│  ──────────────────                                                          │
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ElevenLabs│───►│ Webhook  │───►│ Supabase │───►│ Realtime │              │
│  │ Callback │    │ /api/    │    │ INSERT   │    │ Broadcast│              │
│  │          │    │ webhooks │    │          │    │          │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 ElevenLabs React Integration

```typescript
// components/call/CallInterface.tsx
'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState } from 'react';

interface CallInterfaceProps {
  callId: string;
  agentConfig: AgentConfig;
  signedUrl: string;
  onCallEnd: () => void;
}

export function CallInterface({ 
  callId, 
  agentConfig, 
  signedUrl, 
  onCallEnd 
}: CallInterfaceProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  
  const conversation = useConversation({
    onConnect: () => {
      setStatus('connected');
      // Update call status in Supabase
      fetch(`/api/calls/${callId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'in_progress', startedAt: new Date().toISOString() }),
      });
    },
    onDisconnect: () => {
      setStatus('disconnected');
      onCallEnd();
    },
    onMessage: (message) => {
      // Messages are also captured via webhook
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setStatus('disconnected');
    },
  });

  const startCall = useCallback(async () => {
    setStatus('connecting');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        signedUrl,
        ...agentConfig,
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setStatus('idle');
    }
  }, [conversation, signedUrl, agentConfig]);

  const endCall = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="call-interface">
      {/* Call UI implementation */}
      <CallStatus status={status} />
      <AudioVisualizer isSpeaking={conversation.isSpeaking} />
      
      {status === 'idle' && (
        <Button onClick={startCall}>Start Call</Button>
      )}
      
      {status === 'connected' && (
        <Button variant="destructive" onClick={endCall}>End Call</Button>
      )}
    </div>
  );
}
```

---

## 11. Scoring Pipeline

### 11.1 Dual-Track Scoring Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SCORING PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Call Ends                                                                   │
│      │                                                                       │
│      ▼                                                                       │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                    POST /api/calls/{id}/end                         │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│      │                                                                       │
│      ├─────────────────────────────────────────────────────┐                │
│      │                                                      │                │
│      ▼                                                      ▼                │
│  ┌──────────────────────────┐              ┌──────────────────────────┐     │
│  │      GROQ (FAST)         │              │     GEMINI (DEEP)        │     │
│  │      ~200ms              │              │     ~2-3 seconds         │     │
│  ├──────────────────────────┤              ├──────────────────────────┤     │
│  │                          │              │                          │     │
│  │ Input:                   │              │ Input:                   │     │
│  │ • Transcript summary     │              │ • Full transcript        │     │
│  │ • Mode                   │              │ • Persona details        │     │
│  │                          │              │ • Mode context           │     │
│  │ Output:                  │              │ • Scoring rubric         │     │
│  │ • Overall score (0-100)  │              │                          │     │
│  │ • 1-line summary         │              │ Output:                  │     │
│  │                          │              │ • Category scores        │     │
│  └────────────┬─────────────┘              │ • Strengths (3-5)        │     │
│               │                            │ • Improvements (3-5)     │     │
│               │                            │ • Key moments            │     │
│               ▼                            │ • Detailed feedback      │     │
│  ┌──────────────────────────┐              │                          │     │
│  │   IMMEDIATE RESPONSE     │              └────────────┬─────────────┘     │
│  │                          │                           │                    │
│  │   { quickScore: 78,      │                           │                    │
│  │     summary: "Good..." } │                           │                    │
│  └──────────────────────────┘                           │                    │
│                                                         ▼                    │
│                                            ┌──────────────────────────┐     │
│                                            │    SUPABASE UPDATE       │     │
│                                            │    (scores table)        │     │
│                                            └────────────┬─────────────┘     │
│                                                         │                    │
│                                                         ▼                    │
│                                            ┌──────────────────────────┐     │
│                                            │   REALTIME BROADCAST     │     │
│                                            │   (score:ready event)    │     │
│                                            └──────────────────────────┘     │
│                                                         │                    │
│                                                         ▼                    │
│                                            ┌──────────────────────────┐     │
│                                            │   UI UPDATES WITH        │     │
│                                            │   DETAILED SCORES        │     │
│                                            └──────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Scoring Prompts

```typescript
// lib/gemini/scoring.ts

export const SCORING_SYSTEM_PROMPT = `You are an expert sales coach analyzing a practice call.

SCORING CATEGORIES (0-100 each):
1. Opening (20%): Hook, introduction, reason for call
2. Discovery (25%): Quality of questions, active listening
3. Objection Handling (25%): Response to pushback, reframes
4. Communication (15%): Clarity, pace, confidence, tone
5. Closing (15%): Next steps, call to action, commitment

SCORING GUIDELINES:
- 90-100: Exceptional, mentor-level performance
- 80-89: Strong, ready for real calls
- 70-79: Good, minor improvements needed
- 60-69: Adequate, needs practice
- 50-59: Below average, significant gaps
- Below 50: Needs fundamental training

OUTPUT FORMAT (JSON):
{
  "overallScore": number,
  "categoryScores": {
    "opening": number,
    "discovery": number,
    "objectionHandling": number,
    "communication": number,
    "closing": number
  },
  "strengths": [
    { "point": string, "example": string, "timestamp": number }
  ],
  "improvements": [
    { "point": string, "suggestion": string, "timestamp": number }
  ],
  "keyMoments": [
    { "timestamp": number, "type": "strength" | "improvement", "description": string, "quote": string }
  ],
  "summary": string
}`;

export const QUICK_SCORE_PROMPT = `Rate this sales call 0-100 and give a one-sentence summary.
Focus on: Did they handle objections? Did they ask good questions? Did they get a next step?
Return JSON: { "score": number, "summary": string }`;
```

---

## 12. Deployment Architecture

### 12.1 Vercel Deployment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GIT WORKFLOW                                                                │
│  ────────────                                                                │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                   │
│  │  main   │───►│ Vercel  │───►│ Build   │───►│ Deploy  │                   │
│  │ branch  │    │ Webhook │    │ Process │    │ to Prod │                   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘                   │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐                   │
│  │ feature │───►│ Vercel  │───►│ Build   │───►│ Preview │                   │
│  │ branch  │    │ Webhook │    │ Process │    │ Deploy  │                   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘                   │
│                                                                              │
│  VERCEL CONFIGURATION                                                        │
│  ────────────────────                                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  vercel.json                                                         │    │
│  │                                                                      │    │
│  │  {                                                                   │    │
│  │    "framework": "nextjs",                                            │    │
│  │    "regions": ["iad1"],  // US East for low latency                  │    │
│  │    "functions": {                                                    │    │
│  │      "api/calls/start/route.ts": {                                   │    │
│  │        "runtime": "edge",                                            │    │
│  │        "maxDuration": 30                                             │    │
│  │      },                                                              │    │
│  │      "api/calls/*/end/route.ts": {                                   │    │
│  │        "maxDuration": 60                                             │    │
│  │      }                                                               │    │
│  │    }                                                                 │    │
│  │  }                                                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ENVIRONMENT MANAGEMENT                                                      │
│  ──────────────────────                                                      │
│                                                                              │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐        │
│  │    Development    │  │     Preview       │  │    Production     │        │
│  ├───────────────────┤  ├───────────────────┤  ├───────────────────┤        │
│  │ .env.local        │  │ Vercel Env Vars   │  │ Vercel Env Vars   │        │
│  │ (gitignored)      │  │ (Preview scope)   │  │ (Production)      │        │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Infrastructure as Code

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      { hostname: 'img.clerk.com' },
      { hostname: '*.supabase.co' },
    ],
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ],
};

export default config;
```

---

## 13. Security Architecture

### 13.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER 1: EDGE (Vercel/Cloudflare)                                          │
│  ─────────────────────────────────                                           │
│  • DDoS protection                                                           │
│  • Rate limiting                                                             │
│  • SSL/TLS termination                                                       │
│  • Geographic restrictions (if needed)                                       │
│                                                                              │
│  LAYER 2: APPLICATION (Next.js Middleware)                                   │
│  ─────────────────────────────────────────                                   │
│  • Clerk authentication verification                                         │
│  • Session validation                                                        │
│  • CORS enforcement                                                          │
│  • Request sanitization                                                      │
│                                                                              │
│  LAYER 3: API (Route Handlers)                                               │
│  ─────────────────────────────                                               │
│  • Input validation (Zod schemas)                                            │
│  • Authorization checks                                                      │
│  • Rate limiting per user                                                    │
│  • Audit logging                                                             │
│                                                                              │
│  LAYER 4: DATABASE (Supabase RLS)                                            │
│  ────────────────────────────────                                            │
│  • Row Level Security policies                                               │
│  • User isolation                                                            │
│  • Service role for admin ops                                                │
│                                                                              │
│  LAYER 5: EXTERNAL SERVICES                                                  │
│  ─────────────────────────────                                               │
│  • API key rotation                                                          │
│  • Scoped permissions                                                        │
│  • Webhook signature verification                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Environment Variable Security

```bash
# .env.example (committed to git)
# DO NOT put actual values here

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=Sparrow

# Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Supabase (https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# ElevenLabs (https://elevenlabs.io/app/settings)
ELEVENLABS_API_KEY=xi_xxx
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=xxx

# Google Cloud (https://console.cloud.google.com)
GOOGLE_CLOUD_PROJECT=xxx
GOOGLE_CLOUD_LOCATION=us-central1
# Or use service account JSON
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Groq (https://console.groq.com)
GROQ_API_KEY=gsk_xxx
```

---

## 14. Error Handling Strategy

### 14.1 Error Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERROR HANDLING STRATEGY                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ERROR TYPES                                                                 │
│  ───────────                                                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  SparrowError (base class)                                           │    │
│  │  ├── AuthenticationError (401)                                       │    │
│  │  │   └── "Please sign in to continue"                                │    │
│  │  ├── AuthorizationError (403)                                        │    │
│  │  │   └── "You don't have access to this resource"                    │    │
│  │  ├── NotFoundError (404)                                             │    │
│  │  │   └── "Call not found"                                            │    │
│  │  ├── ValidationError (400)                                           │    │
│  │  │   └── "Invalid input: {details}"                                  │    │
│  │  ├── ExternalServiceError (502)                                      │    │
│  │  │   ├── ElevenLabsError                                             │    │
│  │  │   ├── GeminiError                                                 │    │
│  │  │   ├── GroqError                                                   │    │
│  │  │   └── SupabaseError                                               │    │
│  │  └── InternalError (500)                                             │    │
│  │      └── "Something went wrong"                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ERROR RESPONSE FORMAT                                                       │
│  ─────────────────────                                                       │
│                                                                              │
│  {                                                                           │
│    "error": {                                                                │
│      "code": "VALIDATION_ERROR",                                             │
│      "message": "Invalid input",                                             │
│      "details": { "field": "mode", "issue": "must be one of..." },          │
│      "requestId": "req_abc123"                                               │
│    }                                                                         │
│  }                                                                           │
│                                                                              │
│  RETRY STRATEGY                                                              │
│  ──────────────                                                              │
│                                                                              │
│  ┌───────────────────┬─────────────┬──────────────┐                         │
│  │ Service           │ Max Retries │ Backoff      │                         │
│  ├───────────────────┼─────────────┼──────────────┤                         │
│  │ ElevenLabs        │ 2           │ 1s, 2s       │                         │
│  │ Gemini            │ 3           │ 1s, 2s, 4s   │                         │
│  │ Groq              │ 2           │ 500ms, 1s    │                         │
│  │ Supabase          │ 3           │ 100ms, 500ms │                         │
│  └───────────────────┴─────────────┴──────────────┘                         │
│                                                                              │
│  FALLBACK STRATEGY                                                           │
│  ─────────────────                                                           │
│                                                                              │
│  1. Gemini fails → Use Groq for scoring                                      │
│  2. Groq fails → Use Gemini (slower but available)                           │
│  3. ElevenLabs fails → Show error, suggest retry                             │
│  4. Supabase fails → Local state, sync when available                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Performance Considerations

### 15.1 Latency Budget

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LATENCY BUDGET                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  VOICE CONVERSATION (target: < 800ms turn latency)                           │
│  ───────────────────────────────────────────────                             │
│                                                                              │
│  User finishes speaking                                                      │
│  │                                                                           │
│  ├── ElevenLabs STT ────────────── ~100ms                                   │
│  ├── LLM Processing ─────────────── ~400ms                                   │
│  ├── ElevenLabs TTS ────────────── ~200ms                                   │
│  └── Audio streaming ───────────── ~100ms                                   │
│                                    ────────                                  │
│                          TOTAL:     ~800ms                                   │
│                                                                              │
│  SCORING (target: quick < 500ms, full < 5s)                                  │
│  ───────────────────────────────────────────                                 │
│                                                                              │
│  Call ends                                                                   │
│  │                                                                           │
│  ├── Groq quick score ─────────── ~200ms (immediate feedback)               │
│  │                                                                           │
│  └── Gemini deep analysis ──────── ~3000ms (async, via realtime)            │
│                                                                              │
│  PAGE LOADS (target: < 1s FCP)                                               │
│  ─────────────────────────────                                               │
│                                                                              │
│  • Dashboard: < 800ms (server components + streaming)                        │
│  • Call page: < 500ms (minimal JS, defer ElevenLabs)                         │
│  • Debrief: < 600ms (skeleton + realtime subscription)                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 15.2 Optimization Strategies

| Area | Strategy |
|------|----------|
| **API Routes** | Edge runtime for latency-sensitive routes |
| **Database** | Connection pooling, prepared statements |
| **LLM Calls** | Streaming responses, parallel requests |
| **Frontend** | Server components, lazy loading, code splitting |
| **Assets** | Next/Image optimization, CDN caching |
| **State** | Optimistic updates, SWR caching |

---

## Quick Reference

### Service URLs

| Service | Dashboard URL |
|---------|---------------|
| Vercel | https://vercel.com/dashboard |
| Clerk | https://dashboard.clerk.com |
| Supabase | https://supabase.com/dashboard |
| ElevenLabs | https://elevenlabs.io/app |
| Google Cloud | https://console.cloud.google.com |
| Groq | https://console.groq.com |

### Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Clerk auth middleware |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client |
| `lib/elevenlabs/client.ts` | ElevenLabs SDK wrapper |
| `lib/gemini/client.ts` | Vertex AI client |
| `lib/groq/client.ts` | Groq client |

---

*This architecture document is the technical source of truth for Sparrow AI development.*

*Last Updated: December 23, 2024*
