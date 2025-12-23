# Sparrow AI - API Requirements

> **Complete list of APIs needed for full dashboard integration**

---

## Quick Reference: Required API Keys

| Service | Environment Variable | Get From |
|---------|---------------------|----------|
| **ElevenLabs** | `ELEVENLABS_API_KEY` | [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys) |
| **Google AI (Gemini)** | `GOOGLE_AI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Groq** | `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | [supabase.com/dashboard](https://supabase.com/dashboard) |
| **Clerk** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) |
| **Datadog** | `DD_API_KEY` + `DD_APP_KEY` | [app.datadoghq.com](https://app.datadoghq.com) |

---

## 1. ElevenLabs API

### Required for Voice AI Features

| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/v1/text-to-speech/{voice_id}` | POST | Generate AI prospect voice | Call Interface |
| `/v1/speech-to-text` | POST | Transcribe user speech | Call Interface |
| `/v1/voices` | GET | List available voices | Voice Browser |
| `/v1/voices/{voice_id}` | GET | Get voice details | Prospect Creator |
| `/v1/convai/conversation` | POST | Start conversation session | Call Interface |

### Environment Variables

```bash
ELEVENLABS_API_KEY=sk_xxxxx
ELEVENLABS_AGENT_ID=xxxxx  # For Conversational AI

# Voice IDs for default personas
ELEVENLABS_VOICE_PROFESSIONAL=xxxxx
ELEVENLABS_VOICE_SKEPTICAL=xxxxx
ELEVENLABS_VOICE_FRIENDLY=xxxxx
ELEVENLABS_VOICE_TECHNICAL=xxxxx
```

### Sample Request: Text-to-Speech

```typescript
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: "Hello, I'm Sarah from LogiFlow...",
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  }
);
```

---

## 2. Google Gemini API

### Required for AI Analysis & Coach Sparrow

| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/v1/models/gemini-2.0-flash:generateContent` | POST | Generate personas | Practice Setup |
| `/v1/models/gemini-2.0-flash:generateContent` | POST | Deep call analysis | Debrief |
| `/v1/models/gemini-2.0-flash:generateContent` | POST | Coach Sparrow chat | Debrief Panel |

### Environment Variables

```bash
GOOGLE_AI_API_KEY=xxxxx
# OR for Vertex AI:
GOOGLE_CLOUD_PROJECT_ID=sparrow-ai-xxxxx
GOOGLE_CLOUD_LOCATION=us-central1
```

### Sample Request: Call Analysis

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const result = await model.generateContent({
  contents: [{
    parts: [{
      text: `Analyze this sales call transcript and score it:

      ${transcript}

      Score on: Opening (0-10), Discovery (0-10), Objections (0-10),
      Communication (0-10), Closing (0-10).

      Provide specific feedback with timestamps.`
    }]
  }]
});
```

---

## 3. Groq API

### Required for Real-Time Scoring

| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/openai/v1/chat/completions` | POST | Fast scoring (~200ms) | Live Call Scoring |

### Environment Variables

```bash
GROQ_API_KEY=gsk_xxxxx
```

### Sample Request: Quick Score

```typescript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.1-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'Score this sales exchange quickly. Return JSON with opening, discovery, objection scores 0-10.'
      },
      {
        role: 'user',
        content: lastExchangeText
      }
    ],
    temperature: 0.3,
    max_tokens: 200,
  }),
});
```

---

## 4. Supabase API

### Required for Data Persistence

| Table | Operations | Purpose |
|-------|------------|---------|
| `users` | SELECT, UPDATE | User profiles |
| `calls` | SELECT, INSERT, UPDATE | Call records |
| `call_transcripts` | SELECT, INSERT | Conversation history |
| `call_scores` | SELECT, INSERT | Scoring data |
| `call_feedback` | SELECT, INSERT | Timestamped feedback |
| `user_progress` | SELECT, UPDATE | Stats & streaks |
| `personas` | SELECT, INSERT, DELETE | Custom prospects |

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

### Database Schema Required

```sql
-- Users (synced from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT,
  industry TEXT,
  preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'cold_call', 'discovery', 'objection'
  persona_config JSONB NOT NULL,
  status TEXT DEFAULT 'ready',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Call Scores
CREATE TABLE call_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id),
  overall_score DECIMAL(3,1),
  opening_score DECIMAL(3,1),
  discovery_score DECIMAL(3,1),
  objection_score DECIMAL(3,1),
  communication_score DECIMAL(3,1),
  closing_score DECIMAL(3,1),
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id),
  total_calls INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  avg_overall_score DECIMAL(3,1),
  skill_scores JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Clerk API

### Required for Authentication

| Feature | Purpose |
|---------|---------|
| Sign Up/Sign In | User authentication |
| User Profiles | Name, avatar |
| Webhooks | Sync with Supabase |

### Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxxxx
CLERK_SECRET_KEY=sk_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 6. Datadog API

### Required for Observability

| Feature | Purpose |
|---------|---------|
| APM Tracing | Request performance |
| LLM Observability | Token usage, latency |
| Custom Metrics | Call stats |
| Monitors | Alert rules |

### Environment Variables

```bash
DD_API_KEY=xxxxx
DD_APP_KEY=xxxxx
DD_SITE=datadoghq.com
DD_SERVICE=sparrow-ai
DD_ENV=production

# LLM Observability
DD_LLMOBS_ENABLED=true
DD_LLMOBS_ML_APP=sparrow
DD_LLMOBS_AGENTLESS_ENABLED=true
```

---

## Internal API Routes (Next.js)

These are the API routes to implement in `/src/app/api/`:

### User & Stats

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/profile` | GET, PATCH | Get/update user profile |
| `/api/user/progress` | GET | Get user stats & progress |
| `/api/user/onboarding` | POST | Complete onboarding |

### Calls

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/calls` | GET | List user's calls |
| `/api/calls/start` | POST | Initialize new call |
| `/api/calls/[id]` | GET | Get call details |
| `/api/calls/[id]/end` | POST | End call, trigger scoring |
| `/api/calls/[id]/transcript` | GET | Get full transcript |
| `/api/calls/[id]/score` | GET | Get scorecard |
| `/api/calls/[id]/feedback` | GET | Get detailed feedback |

### AI Features

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/personas/generate` | POST | Generate AI persona |
| `/api/personas` | GET, POST, DELETE | CRUD custom personas |
| `/api/coach/chat` | POST | Coach Sparrow conversation |
| `/api/scoring/analyze` | POST | Trigger deep analysis |

### Voice

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/voice/tts` | POST | Text-to-speech |
| `/api/voice/stt` | POST | Speech-to-text |
| `/api/voice/voices` | GET | List ElevenLabs voices |

### Webhooks

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/webhooks/clerk` | POST | Clerk user events |
| `/api/webhooks/elevenlabs` | POST | Conversation events |

---

## Complete .env.local Template

```bash
# ============================================
# SPARROW AI - Environment Variables
# ============================================

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sparrow

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ElevenLabs (Voice AI)
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=

# Google AI (Gemini)
GOOGLE_AI_API_KEY=

# Groq (Fast Inference)
GROQ_API_KEY=

# Datadog (Observability)
DD_API_KEY=
DD_APP_KEY=
DD_SITE=datadoghq.com
DD_SERVICE=sparrow-ai
DD_ENV=development
DD_LLMOBS_ENABLED=true
DD_LLMOBS_ML_APP=sparrow
DD_LLMOBS_AGENTLESS_ENABLED=true
```

---

## Priority Order for Implementation

1. **Clerk** - Auth must work first
2. **Supabase** - Data layer needed for everything
3. **ElevenLabs** - Core voice functionality
4. **Groq** - Real-time scoring
5. **Gemini** - Deep analysis & Coach Sparrow
6. **Datadog** - Observability layer

---

*Provide these API keys to enable full dashboard functionality.*
