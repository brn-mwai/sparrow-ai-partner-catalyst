# Sparrow AI

**AI-Powered Sales Training Platform** - Practice sales calls with realistic AI prospects that push back like real buyers.

[![Live Demo](https://img.shields.io/badge/Live-sparrow--ai.vercel.app-blue)](https://sparrow-ai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![ElevenLabs](https://img.shields.io/badge/Voice-ElevenLabs-purple)](https://elevenlabs.io/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.0-orange)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Overview

Sparrow is a voice-first sales training platform that lets users practice cold calls, discovery conversations, and objection handling with AI prospects powered by ElevenLabs Conversational AI and Google Gemini.

> **"Never wing a call again"**

### The Problem

Sales teams lose millions training reps on real prospects:

| Pain Point | Impact |
|------------|--------|
| Average SDR ramp time | 3-6 months |
| Reps missing quota | 67% |
| Manager time on roleplay | 15-20% |
| Where practice happens | On real prospects = lost deals |

### The Solution

An AI sparring partner that:
- Is available 24/7 (managers aren't)
- Never gets tired of roleplaying (managers do)
- Provides consistent, objective feedback (managers are biased)
- Creates a safe space to fail (real calls aren't)
- Adapts difficulty based on skill level

---

## Features

### Three Practice Modes

| Mode | Goal | Skills Practiced |
|------|------|------------------|
| **Cold Call Simulator** | Book a meeting | Openers, gatekeepers, value props |
| **Discovery Call Simulator** | Uncover pain | Open questions, active listening, qualification |
| **Objection Gauntlet** | Handle pushback | Price objections, timing, competitors |

### Realistic AI Prospects

Each AI prospect has:
- **Backstory**: Company, role, tenure, recent challenges
- **Hidden Pain Points**: Only revealed if you ask the right questions
- **Personality Type**: Skeptical, busy, friendly, technical
- **Specific Objections**: Tailored to their role and industry
- **Adaptive Behavior**: Gets harder or easier based on performance

### Real-Time Scoring

- **Live feedback** during calls powered by Groq (~200ms)
- **Deep analysis** after calls powered by Gemini
- **Timestamped moments** highlighting strengths and improvements
- **Progress tracking** across all practice sessions

### Coach Sparrow

AI coaching assistant that:
- Answers questions about your call
- Suggests alternative responses
- Explains scoring rationale
- Provides personalized improvement tips

---

## Tech Stack

### Core Framework

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |

### AI & Voice

| Provider | Model/Product | Purpose |
|----------|---------------|---------|
| **ElevenLabs** | Conversational AI | Real-time voice conversations |
| **Google AI** | Gemini 2.0 Flash | Persona generation, deep analysis |
| **Groq** | Llama 3.3 70B | Real-time scoring (~200ms) |

### Backend Services

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database, Realtime |
| **Clerk** | Authentication |
| **Vercel** | Hosting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│                         Next.js 15 + React 19                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│                    Next.js API Routes (Serverless)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│      SUPABASE        │  │     AI SERVICES      │  │    VOICE SERVICE     │
│                      │  │                      │  │                      │
│  • PostgreSQL        │  │  • Gemini 2.0 Flash  │  │  • ElevenLabs        │
│  • Realtime          │  │  • Groq (Fast)       │  │  • Conversational AI │
│  • Storage           │  │                      │  │  • Text-to-Speech    │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

### Data Flow

```
User speaks → ElevenLabs STT → AI Persona responds → ElevenLabs TTS → User hears
                                      │
                                      ▼
                    Groq scores in real-time (~200ms)
                                      │
                                      ▼
              After call: Gemini provides deep analysis
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- API keys for required services

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sparrow-ai.git
cd sparrow-ai

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in your API keys in .env.local

# Run development server
pnpm dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | Yes | ElevenLabs Conversational AI agent |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google AI (Gemini) API key |
| `GROQ_API_KEY` | Yes | Groq API key |

### Database Setup

Run the schema in your Supabase SQL editor:

```sql
-- See supabase/schema.sql for full schema
```

---

## Project Structure

```
sparrow-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (marketing)/       # Landing pages
│   │   ├── dashboard/         # Protected dashboard
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── landing/          # Marketing components
│   │   └── dashboard/        # Dashboard components
│   ├── lib/                   # Utilities
│   │   ├── ai/               # AI client (Gemini + Groq)
│   │   ├── supabase/         # Database client
│   │   └── utils/            # Helper functions
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── supabase/                  # Database schema
└── extension/                 # Chrome extension (bonus)
```

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/calls/start` | Initialize new practice call |
| `POST` | `/api/calls/[id]/end` | End call and trigger scoring |
| `GET` | `/api/calls/[id]/score` | Get call scorecard |
| `GET` | `/api/calls/[id]/feedback` | Get detailed feedback |
| `POST` | `/api/personas/generate` | Generate AI persona |
| `GET` | `/api/user/progress` | Get user progress stats |

---

## Hackathon

**Competition:** AI Partner Catalyst: Accelerate Innovation
**Prize Pool:** $75,000
**Primary Track:** ElevenLabs Challenge - Voice-driven conversational AI ($12,500)

### Why Sparrow Wins

1. **Voice is the Product** - Not a bolt-on feature, voice IS the core experience
2. **Real Problem** - $15B sales training market, 67% of reps miss quota
3. **Deep Integration** - Full ElevenLabs Conversational AI with Gemini personas
4. **Production Ready** - Real auth, real database, real deployment

---

## Screenshots

### Dashboard
*Command center with stats, quick start, and recent calls*

### Practice Call
*Voice conversation with AI prospect, live transcript, real-time scoring*

### Debrief
*Detailed scorecard with timestamped feedback and Coach Sparrow*

---

## Roadmap

- [x] Core voice conversation with ElevenLabs
- [x] Real-time scoring with Groq
- [x] Deep analysis with Gemini
- [x] User authentication with Clerk
- [x] Progress tracking
- [ ] Custom persona creator
- [ ] Team management
- [ ] Calendar integration
- [ ] Mobile app

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run tests
pnpm test
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [ElevenLabs](https://elevenlabs.io) - Voice AI
- [Google AI](https://ai.google.dev) - Gemini
- [Groq](https://groq.com) - Fast inference
- [Supabase](https://supabase.com) - Database
- [Clerk](https://clerk.com) - Authentication
- [Vercel](https://vercel.com) - Hosting

---

## Contact

**Author:** Brian Mwai

- Website: [brianmwai.com](https://brianmwai.com)
- Email: support@brianmwai.com

---

*Never wing a call again.*
