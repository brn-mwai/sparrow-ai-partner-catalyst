# Sparrow - Complete Project Specification

> **Purpose**: This document is the single source of truth for building Sparrow. Read this before writing any code.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem & Solution](#2-problem--solution)
3. [User Personas & Stories](#3-user-personas--stories)
4. [Feature Specifications](#4-feature-specifications)
5. [Technical Architecture](#5-technical-architecture)
6. [Database Design](#6-database-design)
7. [API Contracts](#7-api-contracts)
8. [UI/UX Specifications](#8-uiux-specifications)
9. [Integration Details](#9-integration-details)
10. [State Management](#10-state-management)
11. [Error Handling](#11-error-handling)
12. [Security Model](#12-security-model)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment Plan](#14-deployment-plan)
15. [Development Phases](#15-development-phases)
16. [Success Metrics](#16-success-metrics)

---

## 1. Executive Summary

### What is Sparrow?

Sparrow is an AI-powered sales training platform that lets sales representatives practice calls with realistic AI prospects. Instead of role-playing with colleagues or practicing on real leads, reps can have unlimited practice conversations with AI personas that push back, raise objections, and behave like real buyers.

### Core Value Proposition

> "Practice on AI, close on humans."

- **For SDRs/BDRs**: Safe space to practice cold calls and discovery before hitting the phones
- **For AEs**: Sharpen objection handling without risking real deals
- **For Sales Managers**: Scalable training that doesn't require 1:1 coaching time

### Hackathon Scope (MVP)

| Feature | Included | Reason |
|---------|----------|--------|
| Voice-based practice calls | ✅ | Core differentiator |
| 3 practice modes | ✅ | Variety for different skill levels |
| 6 pre-built personas | ✅ | Immediate value, no setup |
| Real-time transcription | ✅ | Users need to see what's happening |
| AI-powered scoring | ✅ | Actionable feedback loop |
| Call history | ✅ | Track improvement over time |
| User authentication | ✅ | Personal experience |
| Custom personas | ❌ | Post-hackathon |
| Team features | ❌ | Post-hackathon |
| CRM integration | ❌ | Post-hackathon |

### Tech Stack Decision Rationale

| Technology | Purpose | Why This Choice |
|------------|---------|-----------------|
| Next.js 15 | Framework | App Router, Server Components, API routes, Vercel deployment |
| ElevenLabs | Voice AI | Best-in-class conversational AI, low latency, natural voices |
| Gemini 2.0 Flash | LLM | Fast, capable, good for persona simulation |
| Groq | Scoring LLM | Ultra-fast inference for real-time scoring |
| Supabase | Database + Realtime | Postgres + realtime subscriptions + auth (backup) |
| Clerk | Authentication | Best Next.js auth DX, handles edge cases |
| Vercel | Hosting | Zero-config Next.js deployment |
| TypeScript | Language | Type safety, better DX, fewer bugs |
| Tailwind + shadcn/ui | Styling | Rapid UI development, consistent design |

---

## 2. Problem & Solution

### The Problem

Sales training is broken:

1. **Role-playing with colleagues is awkward** - They know you, don't push back realistically
2. **Practicing on real prospects is risky** - Mistakes cost deals and damage reputation
3. **Coaching is expensive** - Managers can only do so many 1:1 sessions
4. **Generic training doesn't stick** - Watching videos doesn't build muscle memory

**The result**: New reps take 3-6 months to ramp, experienced reps plateau, and companies lose winnable deals.

### The Solution

Sparrow provides unlimited, realistic practice with AI prospects that:

- **Push back like real buyers** - Skepticism, objections, time pressure
- **Adapt to what you say** - No scripts, genuine conversation
- **Give immediate feedback** - Know what to improve right after each call
- **Track progress over time** - See yourself getting better

### Why Voice?

- Sales is a verbal sport - typing practice doesn't transfer
- Tone, pacing, and confidence matter as much as words
- Real calls are voice, practice should be too

---

## 3. User Personas & Stories

### Primary User Persona

**Name**: Alex, SDR at a B2B SaaS company  
**Age**: 24  
**Experience**: 8 months in sales  
**Pain Points**:
- Nervous before cold calls
- Struggles with objections like "just send me an email"
- Wants to improve but doesn't get enough coaching
- Hates practicing with colleagues (feels judged)

**Goals**:
- Build confidence before dialing
- Have ready responses to common objections
- Improve discovery question quality
- Track improvement over time

### User Stories

#### Authentication & Onboarding

```
US-001: As a new user, I want to sign up with my email or Google account
        so that I can start practicing quickly.
        
        Acceptance Criteria:
        - Can sign up with email/password
        - Can sign up with Google OAuth
        - Redirected to dashboard after signup
        - First-time users see welcome modal

US-002: As a returning user, I want to sign in and see my dashboard
        so that I can continue where I left off.
        
        Acceptance Criteria:
        - Can sign in with email/password or Google
        - Dashboard shows recent calls and stats
        - Session persists across browser closes
```

#### Practice Modes

```
US-003: As a user, I want to select a practice mode
        so that I can focus on the skill I want to improve.
        
        Acceptance Criteria:
        - See all 3 modes on dashboard: Cold Call, Discovery, Objection Gauntlet
        - Each mode has clear description of what it practices
        - Can start any mode with one click

US-004: As a user, I want to choose a persona before starting
        so that I can practice with different buyer types.
        
        Acceptance Criteria:
        - See 6 persona cards with name, role, company, difficulty
        - Each persona has distinct personality traits
        - Can select any persona regardless of mode
```

#### Call Experience

```
US-005: As a user, I want to have a voice conversation with the AI
        so that I can practice speaking, not typing.
        
        Acceptance Criteria:
        - Click "Start Call" to begin
        - Speak naturally, AI responds in voice
        - Conversation feels natural, not scripted
        - Can end call anytime with "End Call" button

US-006: As a user, I want to see the conversation transcript in real-time
        so that I can follow along and review what was said.
        
        Acceptance Criteria:
        - Transcript appears as conversation happens
        - My messages vs AI messages clearly distinguished
        - Scrolls automatically to show latest
        - Includes timestamps

US-007: As a user, I want a visual indicator when the AI is "thinking"
        so that I know to wait for a response.
        
        Acceptance Criteria:
        - Show "thinking" animation when AI is processing
        - Clear when AI is speaking vs when I can speak
```

#### Scoring & Feedback

```
US-008: As a user, I want to receive a score after each call
        so that I know how well I did.
        
        Acceptance Criteria:
        - Overall score 0-100 displayed prominently
        - Score appears within 5 seconds of call ending
        - Score feels fair and matches call quality

US-009: As a user, I want detailed feedback in multiple categories
        so that I know specifically what to improve.
        
        Acceptance Criteria:
        - 5 category scores: Opening, Discovery, Objection Handling, 
          Communication, Closing
        - Each category has specific feedback text
        - Highlights both strengths and areas to improve

US-010: As a user, I want specific actionable suggestions
        so that I can improve on my next call.
        
        Acceptance Criteria:
        - 2-3 specific things I did well
        - 2-3 specific things to improve
        - Suggestions reference actual moments from the call
```

#### History & Progress

```
US-011: As a user, I want to see my call history
        so that I can review past performance.
        
        Acceptance Criteria:
        - List of all past calls with date, mode, persona, score
        - Can click any call to see full details
        - Most recent calls shown first

US-012: As a user, I want to see my progress over time
        so that I can see myself improving.
        
        Acceptance Criteria:
        - Chart showing scores over time
        - Can filter by practice mode
        - Shows trend (improving, stable, declining)
```

---

## 4. Feature Specifications

### 4.1 Practice Modes

#### Cold Call Mode

**Objective**: Practice opening a call with a prospect who wasn't expecting it.

**Scenario Flow**:
1. User initiates call
2. AI answers with generic greeting ("Hello?", "This is Sarah", etc.)
3. User must identify themselves and reason for calling
4. AI responds with typical cold call resistance
5. User practices handling initial resistance and booking a meeting

**AI Behavior**:
- Initially confused/busy ("Who is this?", "I'm actually in a meeting")
- Skeptical of value proposition
- Time-constrained ("I only have a minute")
- May ask to call back or send email
- Warms up if user handles well

**Success Criteria**:
- Book a meeting or next step
- Get permission to continue the conversation
- Leave a good impression even if rejected

**Duration**: 2-5 minutes typical

#### Discovery Mode

**Objective**: Practice asking questions to uncover needs, pain points, and decision process.

**Scenario Flow**:
1. Call starts with AI already engaged (post-cold-call or inbound)
2. AI has a "situation" with hidden pain points
3. User asks questions to uncover the full picture
4. AI reveals information based on question quality
5. Call ends when user has full understanding or runs out of questions

**AI Behavior**:
- Cooperative but doesn't volunteer information
- Answers surface-level unless probed deeper
- Has hidden priorities and concerns
- Responds well to good questions, vaguely to bad ones
- Has internal politics/stakeholders to reveal

**Success Criteria**:
- Uncover the main pain point
- Identify the decision-making process
- Understand timeline and budget
- Build rapport while gathering information

**Duration**: 5-10 minutes typical

#### Objection Gauntlet Mode

**Objective**: Rapid-fire objection handling practice.

**Scenario Flow**:
1. User starts call
2. AI immediately raises an objection
3. User responds
4. AI either accepts handling or pushes back
5. If handled, AI raises new objection
6. Continues until 5 objections handled or user ends call

**AI Behavior**:
- Rapid objection delivery
- Common objections: price, timing, competitor, need to think, send email
- Pushes back if handling is weak
- Acknowledges when handling is good before raising next objection
- Varies difficulty based on user performance

**Objection Bank**:
1. "We're already using [competitor]"
2. "This isn't in our budget right now"
3. "Can you just send me an email?"
4. "I need to think about it"
5. "We're not looking at this until next quarter"
6. "I'd need to run this by my team"
7. "What makes you different from everyone else?"
8. "We tried something like this before and it didn't work"
9. "I don't have time for this right now"
10. "We handle this internally"

**Success Criteria**:
- Handle each objection without dismissing the concern
- Move past the objection without being pushy
- Get 5 objections handled in one session

**Duration**: 3-7 minutes typical

### 4.2 AI Personas

Each persona has distinct characteristics that affect how they behave across all modes.

#### Persona 1: Sarah Chen - The Skeptical VP

```yaml
name: Sarah Chen
title: VP of Operations
company: TechFlow Solutions (500 employees, Series B)
industry: B2B SaaS

personality:
  disposition: Skeptical, direct, time-conscious
  communication_style: Short sentences, interrupts, asks tough questions
  patience_level: Low - gets to the point quickly
  
hidden_context:
  pain_points:
    - Team is drowning in manual processes
    - Just lost two senior people to burnout
    - CEO is pushing for efficiency gains
  objections_likely:
    - "We've tried tools like this before"
    - "My team doesn't have bandwidth to learn something new"
  decision_style: Needs data and peer references
  
difficulty: Hard
voice_id: [ElevenLabs voice ID - professional female]
```

#### Persona 2: Marcus Johnson - The Friendly Evaluator

```yaml
name: Marcus Johnson
title: Director of Sales
company: GrowthMetrics (150 employees, Series A)
industry: Marketing Technology

personality:
  disposition: Friendly, curious, collaborative
  communication_style: Conversational, asks follow-up questions
  patience_level: High - willing to explore
  
hidden_context:
  pain_points:
    - Sales team ramping too slowly
    - Losing deals to better-trained competitors
    - No standardized training process
  objections_likely:
    - "Sounds interesting, let me think about it"
    - "What's the ROI look like?"
  decision_style: Consensus builder, involves team
  
difficulty: Medium
voice_id: [ElevenLabs voice ID - warm male]
```

#### Persona 3: Jennifer Walsh - The Busy Executive

```yaml
name: Jennifer Walsh
title: CRO
company: ScaleUp Inc (1000 employees, Series C)
industry: Enterprise Software

personality:
  disposition: Extremely busy, delegates, strategic thinker
  communication_style: Brief, executive-level, hates details
  patience_level: Very Low - wants the bottom line
  
hidden_context:
  pain_points:
    - Board pressure on sales efficiency
    - High turnover in SDR team
    - Competitors gaining market share
  objections_likely:
    - "Can you send a one-pager to my team?"
    - "What does [competitor] offer that you don't?"
  decision_style: Quick decisions if value is clear
  
difficulty: Hard
voice_id: [ElevenLabs voice ID - authoritative female]
```

#### Persona 4: David Park - The Technical Buyer

```yaml
name: David Park
title: Engineering Manager
company: DataStream Analytics (80 employees, Seed)
industry: Data Infrastructure

personality:
  disposition: Analytical, detail-oriented, cautious
  communication_style: Asks technical questions, wants specifics
  patience_level: Medium - patient if you're knowledgeable
  
hidden_context:
  pain_points:
    - Team stretched thin across projects
    - Last vendor integration was a nightmare
    - Security concerns from recent breach
  objections_likely:
    - "How does this integrate with our stack?"
    - "What about security and compliance?"
  decision_style: Needs technical validation
  
difficulty: Medium
voice_id: [ElevenLabs voice ID - thoughtful male]
```

#### Persona 5: Rachel Torres - The Gatekeeping Admin

```yaml
name: Rachel Torres
title: Executive Assistant to CEO
company: Vertex Partners (30 employees, boutique firm)
industry: Financial Services

personality:
  disposition: Protective, efficient, polite but firm
  communication_style: Professional, deflects to email, guards calendar
  patience_level: Low for cold calls, higher if qualified
  
hidden_context:
  pain_points:
    - CEO's calendar is packed
    - Too many vendors calling
    - Needs to filter effectively
  objections_likely:
    - "Can you send me an email and I'll forward it?"
    - "What is this regarding?"
  decision_style: Passes to CEO if genuinely relevant
  
difficulty: Medium
voice_id: [ElevenLabs voice ID - professional female]
```

#### Persona 6: Chris Martinez - The Price-Sensitive Buyer

```yaml
name: Chris Martinez  
title: Head of Operations
company: LocalBiz Solutions (25 employees, bootstrapped)
industry: Small Business Services

personality:
  disposition: Friendly but budget-conscious, practical
  communication_style: Casual, focuses on cost/value
  patience_level: High - likes to chat
  
hidden_context:
  pain_points:
    - Every dollar counts
    - Small team wears many hats
    - Needs simple, not complex
  objections_likely:
    - "That's way out of our budget"
    - "We're a small team, this seems like overkill"
  decision_style: Needs clear ROI, quick payback
  
difficulty: Easy
voice_id: [ElevenLabs voice ID - casual male]
```

### 4.3 Scoring System

#### Overall Score Calculation

```
overall_score = weighted_average(
  opening_score * 0.15,
  discovery_score * 0.25,
  objection_score * 0.25,
  communication_score * 0.20,
  closing_score * 0.15
)
```

Note: Weights adjust based on mode:
- Cold Call: Opening 0.30, Closing 0.25
- Discovery: Discovery 0.40
- Objection Gauntlet: Objection 0.50

#### Category Scoring Rubrics

##### Opening Score (0-100)

| Score Range | Criteria |
|-------------|----------|
| 90-100 | Immediately captures attention, clear value prop, personalized |
| 70-89 | Professional opening, states purpose clearly, some personalization |
| 50-69 | Adequate opening, could be more engaging, generic |
| 30-49 | Weak opening, unclear purpose, sounds like script |
| 0-29 | Poor opening, confusing, off-putting |

**Evaluation Points**:
- Did they introduce themselves clearly?
- Did they state why they're calling?
- Did they make it relevant to the prospect?
- Did they ask for permission/time?

##### Discovery Score (0-100)

| Score Range | Criteria |
|-------------|----------|
| 90-100 | Uncovered deep pain points, understood full context, great follow-ups |
| 70-89 | Good questions, uncovered main issues, some depth |
| 50-69 | Surface-level questions, missed opportunities to probe |
| 30-49 | Few questions, mostly talking instead of listening |
| 0-29 | No real discovery, pitched without understanding |

**Evaluation Points**:
- Did they ask open-ended questions?
- Did they follow up on important points?
- Did they uncover pain points?
- Did they understand the decision process?
- Did they listen more than talk?

##### Objection Handling Score (0-100)

| Score Range | Criteria |
|-------------|----------|
| 90-100 | Acknowledged concern, reframed effectively, moved forward smoothly |
| 70-89 | Handled objection adequately, didn't dismiss, found path forward |
| 50-69 | Attempted to handle but weak response, somewhat dismissive |
| 30-49 | Poor handling, argued with prospect, got stuck |
| 0-29 | Ignored objection, became defensive, call derailed |

**Evaluation Points**:
- Did they acknowledge the concern?
- Did they ask clarifying questions?
- Did they provide relevant response?
- Did they check if concern was resolved?
- Did they avoid being pushy?

##### Communication Score (0-100)

| Score Range | Criteria |
|-------------|----------|
| 90-100 | Clear, confident, great pacing, excellent rapport |
| 70-89 | Professional tone, good pacing, builds some rapport |
| 50-69 | Adequate communication, some filler words, okay pacing |
| 30-49 | Unclear at times, too fast/slow, limited rapport |
| 0-29 | Poor communication, hard to follow, no rapport |

**Evaluation Points**:
- Was their speech clear and confident?
- Did they use appropriate pacing?
- Did they avoid filler words ("um", "uh", "like")?
- Did they build rapport?
- Did they actively listen?

##### Closing Score (0-100)

| Score Range | Criteria |
|-------------|----------|
| 90-100 | Clear next step secured, specific date/time, smooth close |
| 70-89 | Next step attempted, got some commitment, professional |
| 50-69 | Weak close, vague next step, missed opportunity |
| 30-49 | Poor closing, awkward ending, no follow-up |
| 0-29 | No attempt to close, call ended poorly |

**Evaluation Points**:
- Did they ask for a next step?
- Did they get a specific commitment?
- Did they confirm the follow-up?
- Was the close natural, not forced?

---

## 5. Technical Architecture

### 5.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client (Browser)                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Next.js   │ │   Clerk     │ │  WebSocket  │ │    ElevenLabs SDK       ││
│  │   App       │ │   Auth      │ │   Client    │ │    (Conversational)     ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Vercel Edge Network                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        Next.js API Routes                                ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      ││
│  │  │  /calls  │ │/personas │ │ /scores  │ │/webhooks │ │  /user   │      ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
┌───────────────────┐    ┌───────────────────────┐    ┌───────────────────┐
│    Supabase       │    │     ElevenLabs        │    │   Google Cloud    │
│  ┌─────────────┐  │    │  ┌─────────────────┐  │    │  ┌─────────────┐  │
│  │  Postgres   │  │    │  │ Conversational  │  │    │  │  Vertex AI  │  │
│  │  Database   │  │    │  │   AI Agent      │  │    │  │   Gemini    │  │
│  ├─────────────┤  │    │  ├─────────────────┤  │    │  └─────────────┘  │
│  │  Realtime   │  │    │  │   Voice TTS     │  │    │                   │
│  │  Channels   │  │    │  ├─────────────────┤  │    │  ┌─────────────┐  │
│  ├─────────────┤  │    │  │   Voice STT     │  │    │  │    Groq     │  │
│  │   Storage   │  │    │  └─────────────────┘  │    │  │  (Scoring)  │  │
│  │  (optional) │  │    │                       │    │  └─────────────┘  │
│  └─────────────┘  │    └───────────────────────┘    └───────────────────┘
└───────────────────┘
```

### 5.2 Request Flow Diagrams

#### Starting a Call

```
User                    Frontend           API Route          ElevenLabs         Supabase
 │                         │                   │                  │                 │
 │  Click "Start Call"     │                   │                  │                 │
 │────────────────────────▶│                   │                  │                 │
 │                         │                   │                  │                 │
 │                         │  POST /api/calls  │                  │                 │
 │                         │──────────────────▶│                  │                 │
 │                         │                   │                  │                 │
 │                         │                   │  Create call record               │
 │                         │                   │─────────────────────────────────▶│
 │                         │                   │                  │                 │
 │                         │                   │◀─────────────────────────────────│
 │                         │                   │     call_id                       │
 │                         │                   │                  │                 │
 │                         │    { call_id,     │                  │                 │
 │                         │      agent_id,    │                  │                 │
 │                         │      persona }    │                  │                 │
 │                         │◀──────────────────│                  │                 │
 │                         │                   │                  │                 │
 │                         │  Initialize ElevenLabs SDK           │                 │
 │                         │─────────────────────────────────────▶│                 │
 │                         │                   │                  │                 │
 │                         │◀─────────────────────────────────────│                 │
 │                         │         WebSocket connection          │                 │
 │                         │                   │                  │                 │
 │  Show "Connected"       │                   │                  │                 │
 │◀────────────────────────│                   │                  │                 │
 │                         │                   │                  │                 │
```

#### During the Call

```
User                    Frontend           ElevenLabs           API Route         Supabase
 │                         │                   │                    │                │
 │  Speak                  │                   │                    │                │
 │────────────────────────▶│                   │                    │                │
 │                         │                   │                    │                │
 │                         │  Audio stream     │                    │                │
 │                         │──────────────────▶│                    │                │
 │                         │                   │                    │                │
 │                         │    Transcript     │                    │                │
 │                         │◀──────────────────│                    │                │
 │                         │                   │                    │                │
 │  See my words appear    │                   │                    │                │
 │◀────────────────────────│                   │                    │                │
 │                         │                   │                    │                │
 │                         │                   │  LLM Processing    │                │
 │                         │                   │  (Gemini via       │                │
 │                         │                   │   ElevenLabs)      │                │
 │                         │                   │                    │                │
 │                         │    AI Response    │                    │                │
 │                         │   (audio + text)  │                    │                │
 │                         │◀──────────────────│                    │                │
 │                         │                   │                    │                │
 │  Hear AI + see text     │                   │                    │                │
 │◀────────────────────────│                   │                    │                │
 │                         │                   │                    │                │
 │                         │  Save transcript chunk                 │                │
 │                         │  (debounced)      │                    │                │
 │                         │─────────────────────────────────────▶│                │
 │                         │                   │                    │                │
 │                         │                   │                    │  Realtime      │
 │                         │                   │                    │  broadcast     │
 │                         │                   │                    │◀───────────────│
 │                         │                   │                    │                │
```

#### Ending the Call & Scoring

```
User              Frontend         API Route         Groq            Supabase
 │                   │                │                │                │
 │  Click "End"      │                │                │                │
 │──────────────────▶│                │                │                │
 │                   │                │                │                │
 │                   │  Close ElevenLabs connection    │                │
 │                   │                │                │                │
 │                   │ PATCH /calls/{id}/end           │                │
 │                   │───────────────▶│                │                │
 │                   │                │                │                │
 │                   │                │  Get full transcript           │
 │                   │                │────────────────────────────────▶│
 │                   │                │                │                │
 │                   │                │◀────────────────────────────────│
 │                   │                │                │                │
 │                   │                │  Score request │                │
 │                   │                │───────────────▶│                │
 │                   │                │                │                │
 │                   │                │    Scores +    │                │
 │                   │                │    Feedback    │                │
 │                   │                │◀───────────────│                │
 │                   │                │                │                │
 │                   │                │  Save scores + feedback         │
 │                   │                │────────────────────────────────▶│
 │                   │                │                │                │
 │                   │  { scores, feedback }           │                │
 │                   │◀───────────────│                │                │
 │                   │                │                │                │
 │  See debrief      │                │                │                │
 │◀──────────────────│                │                │                │
 │                   │                │                │                │
```

### 5.3 Component Architecture

```
app/
├── (auth)/                      # Auth group route
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx            # Clerk sign-in page
│   └── sign-up/[[...sign-up]]/
│       └── page.tsx            # Clerk sign-up page
│
├── (dashboard)/                 # Protected dashboard routes
│   ├── layout.tsx              # Dashboard layout with nav
│   ├── page.tsx                # Dashboard home
│   ├── practice/
│   │   ├── page.tsx            # Mode selection
│   │   └── [mode]/
│   │       ├── page.tsx        # Persona selection for mode
│   │       └── [personaId]/
│   │           └── page.tsx    # Call interface
│   ├── history/
│   │   ├── page.tsx            # Call history list
│   │   └── [callId]/
│   │       └── page.tsx        # Call details/debrief
│   ├── progress/
│   │   └── page.tsx            # Progress charts
│   └── settings/
│       └── page.tsx            # User settings
│
├── api/
│   ├── calls/
│   │   ├── route.ts            # POST: create call, GET: list calls
│   │   └── [callId]/
│   │       ├── route.ts        # GET: call details, PATCH: update
│   │       ├── end/
│   │       │   └── route.ts    # POST: end call, trigger scoring
│   │       └── transcript/
│   │           └── route.ts    # POST: save transcript chunk
│   ├── personas/
│   │   └── route.ts            # GET: list personas
│   ├── user/
│   │   └── route.ts            # GET: user profile + stats
│   └── webhooks/
│       └── clerk/
│           └── route.ts        # Clerk webhook handler
│
└── layout.tsx                   # Root layout with providers

components/
├── ui/                          # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
│
├── call/
│   ├── call-interface.tsx      # Main call UI
│   ├── call-controls.tsx       # Mute, end, timer
│   ├── transcript-view.tsx     # Real-time transcript
│   ├── connection-status.tsx   # Connection indicator
│   └── audio-visualizer.tsx    # Speaking indicator
│
├── practice/
│   ├── mode-selector.tsx       # Practice mode cards
│   ├── persona-card.tsx        # Single persona display
│   └── persona-grid.tsx        # Persona selection grid
│
├── debrief/
│   ├── score-display.tsx       # Overall score
│   ├── category-scores.tsx     # Individual category cards
│   ├── feedback-section.tsx    # Detailed feedback
│   └── transcript-review.tsx   # Full transcript view
│
├── history/
│   ├── call-list.tsx           # List of past calls
│   ├── call-list-item.tsx      # Single call row
│   └── call-filters.tsx        # Filter by mode/date
│
├── progress/
│   ├── score-chart.tsx         # Score over time
│   ├── category-breakdown.tsx  # Per-category trends
│   └── stats-cards.tsx         # Summary statistics
│
├── layout/
│   ├── header.tsx              # Top nav
│   ├── sidebar.tsx             # Side navigation
│   └── footer.tsx              # Footer
│
└── shared/
    ├── loading.tsx             # Loading spinner
    ├── error-boundary.tsx      # Error handling
    └── empty-state.tsx         # Empty state display

lib/
├── supabase/
│   ├── client.ts               # Browser client
│   ├── server.ts               # Server client
│   ├── admin.ts                # Admin client (service role)
│   └── types.ts                # Database types
│
├── elevenlabs/
│   ├── client.ts               # ElevenLabs SDK wrapper
│   ├── config.ts               # Agent configuration
│   └── types.ts                # ElevenLabs types
│
├── ai/
│   ├── gemini.ts               # Gemini client
│   ├── groq.ts                 # Groq client
│   ├── scoring.ts              # Scoring logic
│   └── prompts/
│       ├── persona-system.ts   # Persona system prompts
│       └── scoring-prompt.ts   # Scoring prompt
│
├── utils/
│   ├── cn.ts                   # Tailwind class merge
│   ├── format.ts               # Formatters
│   └── validation.ts           # Zod schemas
│
└── constants/
    ├── personas.ts             # Persona definitions
    ├── modes.ts                # Practice modes
    └── scoring.ts              # Scoring weights

hooks/
├── use-call.ts                 # Call state management
├── use-transcript.ts           # Transcript subscription
├── use-audio-level.ts          # Audio visualization
└── use-user-stats.ts           # User statistics

types/
├── database.ts                 # Supabase generated types
├── call.ts                     # Call-related types
├── persona.ts                  # Persona types
└── score.ts                    # Scoring types

config/
├── site.ts                     # Site metadata
├── navigation.ts               # Nav links
└── features.ts                 # Feature flags
```

---

## 6. Database Design

### 6.1 Complete Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Synced from Clerk via webhook
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Computed fields for convenience
  full_name TEXT GENERATED ALWAYS AS (
    COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
  ) STORED
);

-- Index for Clerk ID lookups (very common)
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- ============================================
-- CALLS TABLE
-- ============================================
-- Each practice call session
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Call configuration
  mode TEXT NOT NULL CHECK (mode IN ('cold_call', 'discovery', 'objection_gauntlet')),
  persona_id TEXT NOT NULL,
  persona_name TEXT NOT NULL,
  
  -- Call state
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'completed', 'failed', 'cancelled')
  ),
  
  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- ElevenLabs reference
  elevenlabs_conversation_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_calls_user_mode ON calls(user_id, mode);

-- ============================================
-- TRANSCRIPTS TABLE
-- ============================================
-- Individual messages in a call
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  
  -- Timing
  timestamp_ms INTEGER NOT NULL, -- Milliseconds from call start
  
  -- Order guarantee
  sequence_number INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX idx_transcripts_call_sequence ON transcripts(call_id, sequence_number);

-- ============================================
-- SCORES TABLE
-- ============================================
-- Scoring results for a call
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  
  -- Overall score
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Category scores
  opening_score INTEGER CHECK (opening_score >= 0 AND opening_score <= 100),
  discovery_score INTEGER CHECK (discovery_score >= 0 AND discovery_score <= 100),
  objection_handling_score INTEGER CHECK (objection_handling_score >= 0 AND objection_handling_score <= 100),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  closing_score INTEGER CHECK (closing_score >= 0 AND closing_score <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_scores_call_id ON scores(call_id);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
-- Detailed feedback for a call
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  
  -- Summary
  summary TEXT NOT NULL,
  
  -- Strengths (JSON array of strings)
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Areas for improvement (JSON array of strings)
  improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Category-specific feedback
  opening_feedback TEXT,
  discovery_feedback TEXT,
  objection_handling_feedback TEXT,
  communication_feedback TEXT,
  closing_feedback TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_feedback_call_id ON feedback(call_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own calls"
  ON calls FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert own calls"
  ON calls FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update own calls"
  ON calls FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Transcripts follow calls access
CREATE POLICY "Users can view own transcripts"
  ON transcripts FOR SELECT
  USING (call_id IN (
    SELECT id FROM calls WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Users can insert own transcripts"
  ON transcripts FOR INSERT
  WITH CHECK (call_id IN (
    SELECT id FROM calls WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

-- Scores and feedback follow calls access
CREATE POLICY "Users can view own scores"
  ON scores FOR SELECT
  USING (call_id IN (
    SELECT id FROM calls WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (call_id IN (
    SELECT id FROM calls WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

-- User statistics view
CREATE VIEW user_stats AS
SELECT 
  u.id as user_id,
  u.clerk_id,
  COUNT(c.id) as total_calls,
  COUNT(c.id) FILTER (WHERE c.mode = 'cold_call') as cold_call_count,
  COUNT(c.id) FILTER (WHERE c.mode = 'discovery') as discovery_count,
  COUNT(c.id) FILTER (WHERE c.mode = 'objection_gauntlet') as objection_count,
  ROUND(AVG(s.overall_score)) as average_score,
  ROUND(AVG(s.overall_score) FILTER (WHERE c.created_at > NOW() - INTERVAL '7 days')) as avg_score_7d,
  MAX(c.created_at) as last_call_at
FROM users u
LEFT JOIN calls c ON c.user_id = u.id AND c.status = 'completed'
LEFT JOIN scores s ON s.call_id = c.id
GROUP BY u.id, u.clerk_id;

-- Call details view (joins all related data)
CREATE VIEW call_details AS
SELECT 
  c.*,
  s.overall_score,
  s.opening_score,
  s.discovery_score,
  s.objection_handling_score,
  s.communication_score,
  s.closing_score,
  f.summary as feedback_summary,
  f.strengths,
  f.improvements,
  f.opening_feedback,
  f.discovery_feedback,
  f.objection_handling_feedback,
  f.communication_feedback,
  f.closing_feedback
FROM calls c
LEFT JOIN scores s ON s.call_id = c.id
LEFT JOIN feedback f ON f.call_id = c.id;
```

### 6.2 TypeScript Types (Generated)

```typescript
// types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          user_id: string
          mode: 'cold_call' | 'discovery' | 'objection_gauntlet'
          persona_id: string
          persona_name: string
          status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled'
          started_at: string | null
          ended_at: string | null
          duration_seconds: number | null
          elevenlabs_conversation_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mode: 'cold_call' | 'discovery' | 'objection_gauntlet'
          persona_id: string
          persona_name: string
          status?: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled'
          started_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          elevenlabs_conversation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mode?: 'cold_call' | 'discovery' | 'objection_gauntlet'
          persona_id?: string
          persona_name?: string
          status?: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled'
          started_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          elevenlabs_conversation_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transcripts: {
        Row: {
          id: string
          call_id: string
          role: 'user' | 'assistant'
          content: string
          timestamp_ms: number
          sequence_number: number
          created_at: string
        }
        Insert: {
          id?: string
          call_id: string
          role: 'user' | 'assistant'
          content: string
          timestamp_ms: number
          sequence_number: number
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          role?: 'user' | 'assistant'
          content?: string
          timestamp_ms?: number
          sequence_number?: number
          created_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          call_id: string
          overall_score: number
          opening_score: number | null
          discovery_score: number | null
          objection_handling_score: number | null
          communication_score: number | null
          closing_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          call_id: string
          overall_score: number
          opening_score?: number | null
          discovery_score?: number | null
          objection_handling_score?: number | null
          communication_score?: number | null
          closing_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          overall_score?: number
          opening_score?: number | null
          discovery_score?: number | null
          objection_handling_score?: number | null
          communication_score?: number | null
          closing_score?: number | null
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          call_id: string
          summary: string
          strengths: Json
          improvements: Json
          opening_feedback: string | null
          discovery_feedback: string | null
          objection_handling_feedback: string | null
          communication_feedback: string | null
          closing_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          call_id: string
          summary: string
          strengths?: Json
          improvements?: Json
          opening_feedback?: string | null
          discovery_feedback?: string | null
          objection_handling_feedback?: string | null
          communication_feedback?: string | null
          closing_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          summary?: string
          strengths?: Json
          improvements?: Json
          opening_feedback?: string | null
          discovery_feedback?: string | null
          objection_handling_feedback?: string | null
          communication_feedback?: string | null
          closing_feedback?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          user_id: string
          clerk_id: string
          total_calls: number
          cold_call_count: number
          discovery_count: number
          objection_count: number
          average_score: number | null
          avg_score_7d: number | null
          last_call_at: string | null
        }
      }
      call_details: {
        Row: {
          id: string
          user_id: string
          mode: string
          persona_id: string
          persona_name: string
          status: string
          started_at: string | null
          ended_at: string | null
          duration_seconds: number | null
          elevenlabs_conversation_id: string | null
          created_at: string
          updated_at: string
          overall_score: number | null
          opening_score: number | null
          discovery_score: number | null
          objection_handling_score: number | null
          communication_score: number | null
          closing_score: number | null
          feedback_summary: string | null
          strengths: Json | null
          improvements: Json | null
          opening_feedback: string | null
          discovery_feedback: string | null
          objection_handling_feedback: string | null
          communication_feedback: string | null
          closing_feedback: string | null
        }
      }
    }
  }
}
```

---

## 7. API Contracts

### 7.1 Calls API

#### Create Call

```typescript
// POST /api/calls

// Request
interface CreateCallRequest {
  mode: 'cold_call' | 'discovery' | 'objection_gauntlet'
  personaId: string
}

// Response 201
interface CreateCallResponse {
  callId: string
  status: 'pending'
  persona: {
    id: string
    name: string
    title: string
    company: string
  }
  agentConfig: {
    agentId: string
    // Dynamic config for ElevenLabs
  }
  createdAt: string
}

// Error Responses
// 400: Invalid mode or persona
// 401: Unauthorized
// 500: Server error
```

#### Get Call Details

```typescript
// GET /api/calls/:callId

// Response 200
interface GetCallResponse {
  id: string
  mode: 'cold_call' | 'discovery' | 'objection_gauntlet'
  persona: {
    id: string
    name: string
    title: string
    company: string
  }
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled'
  startedAt: string | null
  endedAt: string | null
  durationSeconds: number | null
  transcript: TranscriptMessage[]
  scores: Scores | null
  feedback: Feedback | null
  createdAt: string
}

interface TranscriptMessage {
  role: 'user' | 'assistant'
  content: string
  timestampMs: number
}

interface Scores {
  overall: number
  opening: number
  discovery: number
  objectionHandling: number
  communication: number
  closing: number
}

interface Feedback {
  summary: string
  strengths: string[]
  improvements: string[]
  categories: {
    opening: string | null
    discovery: string | null
    objectionHandling: string | null
    communication: string | null
    closing: string | null
  }
}

// Error Responses
// 401: Unauthorized
// 404: Call not found
```

#### List User Calls

```typescript
// GET /api/calls?mode=cold_call&limit=20&offset=0

// Query Parameters
interface ListCallsParams {
  mode?: 'cold_call' | 'discovery' | 'objection_gauntlet'
  status?: 'completed' | 'failed' | 'cancelled'
  limit?: number  // default 20, max 100
  offset?: number // default 0
}

// Response 200
interface ListCallsResponse {
  calls: CallSummary[]
  total: number
  hasMore: boolean
}

interface CallSummary {
  id: string
  mode: string
  personaName: string
  status: string
  overallScore: number | null
  durationSeconds: number | null
  createdAt: string
}
```

#### Update Call Status

```typescript
// PATCH /api/calls/:callId

// Request
interface UpdateCallRequest {
  status?: 'active' | 'cancelled'
  elevenlabsConversationId?: string
  startedAt?: string
}

// Response 200
interface UpdateCallResponse {
  id: string
  status: string
  updatedAt: string
}
```

#### End Call

```typescript
// POST /api/calls/:callId/end

// Request (optional - transcript can come from client)
interface EndCallRequest {
  endedAt?: string
  transcript?: TranscriptMessage[]
}

// Response 200
interface EndCallResponse {
  id: string
  status: 'completed'
  durationSeconds: number
  scores: Scores
  feedback: Feedback
}

// Note: This triggers async scoring. Response may take 2-5 seconds.
```

#### Save Transcript Chunk

```typescript
// POST /api/calls/:callId/transcript

// Request
interface SaveTranscriptRequest {
  messages: TranscriptMessage[]
}

// Response 200
interface SaveTranscriptResponse {
  saved: number
  callId: string
}

// Note: Idempotent - duplicate messages ignored based on timestampMs
```

### 7.2 Personas API

```typescript
// GET /api/personas

// Response 200
interface ListPersonasResponse {
  personas: Persona[]
}

interface Persona {
  id: string
  name: string
  title: string
  company: string
  industry: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  avatarUrl: string
  traits: string[]
}

// GET /api/personas/:personaId

// Response 200 - same as Persona above
```

### 7.3 User API

```typescript
// GET /api/user

// Response 200
interface GetUserResponse {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  stats: UserStats
  createdAt: string
}

interface UserStats {
  totalCalls: number
  callsByMode: {
    coldCall: number
    discovery: number
    objectionGauntlet: number
  }
  averageScore: number | null
  averageScoreLast7Days: number | null
  lastCallAt: string | null
  streak: {
    current: number
    longest: number
  }
}
```

### 7.4 Webhooks

```typescript
// POST /api/webhooks/clerk

// Handles Clerk events:
// - user.created
// - user.updated
// - user.deleted

// Request: Clerk webhook payload
// Response: 200 OK or 400 Bad Request

// Verification: Svix signature validation
```

---

## 8. UI/UX Specifications

### 8.1 Page Layouts

#### Dashboard (/)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard   History   Progress   Settings   [Avatar]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Welcome back, Alex! 👋                                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  YOUR STATS                                               │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │  │
│  │  │ 23      │ │ 72      │ │ 5 🔥    │ │ +8 pts this    │  │  │
│  │  │ Calls   │ │ Avg Score│ │ Streak │ │ week            │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  PRACTICE MODES                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  📞 Cold Call   │ │  🔍 Discovery   │ │  💪 Objection   │   │
│  │                 │ │                 │ │     Gauntlet    │   │
│  │  Practice your  │ │  Improve your   │ │  Rapid-fire     │   │
│  │  opening and    │ │  questioning    │ │  objection      │   │
│  │  getting past   │ │  skills and     │ │  handling       │   │
│  │  gatekeepers    │ │  uncovering     │ │  practice       │   │
│  │                 │ │  needs          │ │                 │   │
│  │  [Start →]      │ │  [Start →]      │ │  [Start →]      │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  RECENT CALLS                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Cold Call • Sarah Chen • 82/100 • 4:32 • Today 2:30 PM    ▶││
│  │ Discovery • Marcus Johnson • 75/100 • 8:15 • Today 10:00 AM▶││
│  │ Objection • Jennifer Walsh • 68/100 • 3:45 • Yesterday     ▶││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Persona Selection (/practice/[mode])

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                Cold Call Practice       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Choose your prospect                                           │
│  Select who you want to practice with                           │
│                                                                 │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │  [Avatar]           │ │  [Avatar]           │                │
│  │  Sarah Chen         │ │  Marcus Johnson     │                │
│  │  VP of Operations   │ │  Director of Sales  │                │
│  │  TechFlow Solutions │ │  GrowthMetrics      │                │
│  │                     │ │                     │                │
│  │  ⭐⭐⭐ Hard        │ │  ⭐⭐ Medium        │                │
│  │                     │ │                     │                │
│  │  Skeptical, direct, │ │  Friendly but needs │                │
│  │  time-conscious     │ │  ROI proof          │                │
│  │                     │ │                     │                │
│  │  [Select]           │ │  [Select]           │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                 │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │  [Avatar]           │ │  [Avatar]           │                │
│  │  Jennifer Walsh     │ │  David Park         │                │
│  │  CRO                │ │  Engineering Mgr    │                │
│  │  ScaleUp Inc        │ │  DataStream         │                │
│  │                     │ │                     │                │
│  │  ⭐⭐⭐ Hard        │ │  ⭐⭐ Medium        │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                 │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │  [Avatar]           │ │  [Avatar]           │                │
│  │  Rachel Torres      │ │  Chris Martinez     │                │
│  │  EA to CEO          │ │  Head of Ops        │                │
│  │  Vertex Partners    │ │  LocalBiz           │                │
│  │                     │ │                     │                │
│  │  ⭐⭐ Medium        │ │  ⭐ Easy            │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Call Interface (/practice/[mode]/[personaId])

```
┌─────────────────────────────────────────────────────────────────┐
│  Cold Call Practice           ⏱ 02:34         [End Call]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  ┌──────────┐                                             │  │
│  │  │[Avatar]  │  Sarah Chen                                 │  │
│  │  │          │  VP of Operations @ TechFlow Solutions      │  │
│  │  │  🔊      │                                             │  │
│  │  └──────────┘                                             │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TRANSCRIPT                                               │  │
│  │                                                           │  │
│  │  🤖 Hello?                                    [0:02]      │  │
│  │                                                           │  │
│  │  👤 Hi Sarah, this is Alex from Sparrow.     [0:05]      │  │
│  │     I'm reaching out because...                           │  │
│  │                                                           │  │
│  │  🤖 Sorry, who is this? I'm in the           [0:12]      │  │
│  │     middle of something.                                  │  │
│  │                                                           │  │
│  │  👤 I apologize for catching you at a        [0:18]      │  │
│  │     busy time. I'll be brief...                           │  │
│  │                                                           │  │
│  │  🤖 ...                                       ●           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      🎤 Speaking...                       │  │
│  │              ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Debrief (/history/[callId])

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to History                          Call Debrief        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Cold Call with Sarah Chen                                      │
│  December 23, 2024 • 4:32 duration                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        YOUR SCORE                         │  │
│  │                                                           │  │
│  │                          82                               │  │
│  │                         ━━━━                              │  │
│  │                        /100                               │  │
│  │                                                           │  │
│  │                    Great job! 🎉                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  CATEGORY BREAKDOWN                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Opening     │ │ Discovery   │ │ Objection   │               │
│  │     85      │ │     78      │ │     80      │               │
│  │ ████████░░  │ │ ███████░░░  │ │ ████████░░  │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│  ┌─────────────┐ ┌─────────────┐                               │
│  │Communication│ │ Closing     │                               │
│  │     88      │ │     76      │                               │
│  │ ████████░░  │ │ ███████░░░  │                               │
│  └─────────────┘ └─────────────┘                               │
│                                                                 │
│  WHAT YOU DID WELL ✓                                           │
│  • Strong opening that immediately stated value proposition     │
│  • Good recovery when Sarah said she was busy                   │
│  • Asked permission before continuing                           │
│                                                                 │
│  AREAS TO IMPROVE ↑                                            │
│  • Could have personalized more to TechFlow's situation         │
│  • Missed opportunity to ask about her specific challenges      │
│  • Closing ask was slightly weak - be more specific             │
│                                                                 │
│  [View Full Transcript]         [Practice Again]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Component Specifications

#### Call Controls Component

**States**:
1. **Not Started**: Show "Start Call" button
2. **Connecting**: Show spinner, "Connecting..."
3. **Active**: Show timer, audio visualizer, "End Call" button
4. **Ending**: Show "Processing...", disable buttons
5. **Error**: Show error message, "Retry" button

**Interactions**:
- Start Call → Request microphone permission → Initialize ElevenLabs → Begin
- End Call → Stop audio → Close connection → Navigate to debrief
- On error → Show message → Offer retry or go back

#### Transcript Component

**Features**:
- Auto-scroll to latest message (with manual scroll override)
- Clear visual distinction between user (right, blue) and AI (left, gray)
- Timestamp for each message
- Typing indicator when AI is processing
- Empty state: "Start speaking to begin the conversation"

**Performance**:
- Virtualize list if more than 50 messages
- Debounce scroll events
- Use `will-change: transform` for smooth scrolling

#### Score Display Component

**Visual Design**:
- Large, prominent overall score (circular progress)
- Color coding: 0-49 red, 50-69 yellow, 70-84 green, 85-100 blue
- Animated number counting on load
- Category scores as horizontal bars
- Tooltips explain each category

### 8.3 Design Tokens

```css
/* Colors */
--color-primary: #2563eb;        /* Blue 600 */
--color-primary-dark: #1d4ed8;   /* Blue 700 */
--color-success: #16a34a;        /* Green 600 */
--color-warning: #ca8a04;        /* Yellow 600 */
--color-error: #dc2626;          /* Red 600 */
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-500: #737373;
--color-neutral-700: #404040;
--color-neutral-900: #171717;

/* Typography */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Spacing */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */

/* Border Radius */
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

---

## 9. Integration Details

### 9.1 ElevenLabs Conversational AI

#### Agent Configuration

```typescript
// lib/elevenlabs/config.ts

export interface AgentConfig {
  // Agent identification
  agent_id: string
  
  // Voice settings
  voice: {
    voice_id: string
    stability: number        // 0-1, lower = more expressive
    similarity_boost: number // 0-1, higher = more like original voice
    style: number           // 0-1, style exaggeration
    use_speaker_boost: boolean
  }
  
  // Conversation settings
  conversation: {
    first_message: string   // What AI says first (or empty for user-first)
    system_prompt: string   // Persona system prompt
    temperature: number     // 0-1, response creativity
    max_tokens: number      // Max response length
  }
  
  // Turn taking
  turn_taking: {
    silence_duration_ms: number  // How long to wait for user to finish
    interrupt_sensitivity: number // How easily AI can be interrupted
  }
  
  // LLM configuration
  llm: {
    provider: 'gemini'
    model: 'gemini-2.0-flash-exp'
  }
}

export function buildAgentConfig(
  persona: Persona,
  mode: PracticeMode
): AgentConfig {
  return {
    agent_id: process.env.ELEVENLABS_AGENT_ID!,
    voice: {
      voice_id: persona.voiceId,
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true
    },
    conversation: {
      first_message: getFirstMessage(mode),
      system_prompt: buildPersonaPrompt(persona, mode),
      temperature: 0.7,
      max_tokens: 150
    },
    turn_taking: {
      silence_duration_ms: 1500,
      interrupt_sensitivity: 0.5
    },
    llm: {
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp'
    }
  }
}
```

#### Client-Side Integration

```typescript
// hooks/use-call.ts

import { useCallback, useRef, useState } from 'react'
import { Conversation } from '@11labs/client'

interface UseCallOptions {
  onTranscriptUpdate: (messages: TranscriptMessage[]) => void
  onStatusChange: (status: CallStatus) => void
  onError: (error: Error) => void
}

export function useCall(options: UseCallOptions) {
  const conversationRef = useRef<Conversation | null>(null)
  const [status, setStatus] = useState<CallStatus>('idle')
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  
  const startCall = useCallback(async (agentConfig: AgentConfig) => {
    setStatus('connecting')
    options.onStatusChange('connecting')
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Initialize conversation
      const conversation = await Conversation.startSession({
        agentId: agentConfig.agent_id,
        overrides: {
          voice: agentConfig.voice,
          conversation: agentConfig.conversation,
          // ... other overrides
        },
        onMessage: (message) => {
          // Handle transcript updates
          options.onTranscriptUpdate([...messages, message])
        },
        onModeChange: (mode) => {
          setIsAgentSpeaking(mode.mode === 'speaking')
        },
        onError: (error) => {
          setStatus('error')
          options.onError(error)
        },
        onDisconnect: () => {
          setStatus('ended')
        }
      })
      
      conversationRef.current = conversation
      setStatus('active')
      options.onStatusChange('active')
      
    } catch (error) {
      setStatus('error')
      options.onError(error as Error)
    }
  }, [options])
  
  const endCall = useCallback(async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession()
      conversationRef.current = null
    }
    setStatus('ended')
    options.onStatusChange('ended')
  }, [options])
  
  return {
    startCall,
    endCall,
    status,
    isAgentSpeaking
  }
}
```

### 9.2 Gemini Integration (via ElevenLabs)

The Gemini LLM is used through ElevenLabs' platform, not directly. We configure it via the ElevenLabs agent setup.

#### Persona System Prompts

```typescript
// lib/ai/prompts/persona-system.ts

export function buildPersonaPrompt(
  persona: Persona,
  mode: PracticeMode
): string {
  const modeInstructions = getModeInstructions(mode)
  
  return `
You are ${persona.name}, ${persona.title} at ${persona.company}.

## Your Background
- Company: ${persona.company} (${persona.companySize} employees, ${persona.fundingStage})
- Industry: ${persona.industry}
- Your role: ${persona.roleDescription}

## Your Personality
${persona.personality.disposition}

Communication style: ${persona.personality.communicationStyle}
Patience level: ${persona.personality.patienceLevel}

## Your Hidden Context (reveal naturally through conversation)
Pain points you're experiencing:
${persona.hiddenContext.painPoints.map(p => `- ${p}`).join('\n')}

Objections you're likely to raise:
${persona.hiddenContext.objectionsLikely.map(o => `- ${o}`).join('\n')}

How you make decisions: ${persona.hiddenContext.decisionStyle}

## Mode-Specific Behavior
${modeInstructions}

## Response Guidelines
1. Stay in character at all times
2. Respond naturally, as this person would in a real conversation
3. Keep responses concise (1-3 sentences typically)
4. Push back when appropriate - you're not an easy sell
5. Reveal information gradually based on how good the questions are
6. If the caller handles things well, become slightly more receptive
7. Never break character to explain you're an AI

## Example Responses
For a cold call opening:
- "Hello?" (neutral)
- "Who is this?" (if they don't identify quickly)
- "I'm actually quite busy right now" (testing their response)

Remember: You are helping them practice. Make it realistic but fair.
`.trim()
}

function getModeInstructions(mode: PracticeMode): string {
  switch (mode) {
    case 'cold_call':
      return `
This is a cold call. You weren't expecting this call.
- Start skeptical/confused - "Hello?", "Who is this?"
- Be time-constrained initially
- Common resistance: "Can you send me an email?", "I'm busy"
- If they hook you, become slightly more engaged
- Goal for them: book a meeting or get permission to continue
      `.trim()
      
    case 'discovery':
      return `
This is a discovery call. You've already agreed to take this call.
- Be cooperative but don't volunteer information
- Answer surface-level unless they probe deeper
- Reward good questions with more detail
- Have internal priorities they need to uncover
- Goal for them: understand your full situation
      `.trim()
      
    case 'objection_gauntlet':
      return `
This is objection handling practice. Fire objections rapidly.
- Start with an objection immediately
- If handled well, acknowledge briefly then raise new objection
- If handled poorly, push back harder on same objection
- Cycle through: price, timing, competition, need to think, send email
- Goal for them: handle 5 objections successfully
      `.trim()
      
    default:
      return ''
  }
}
```

### 9.3 Groq Integration (Scoring)

```typescript
// lib/ai/groq.ts

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function scoreCall(
  transcript: TranscriptMessage[],
  mode: PracticeMode,
  persona: Persona
): Promise<ScoringResult> {
  const prompt = buildScoringPrompt(transcript, mode, persona)
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: SCORING_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000
  })
  
  const result = JSON.parse(response.choices[0].message.content!)
  
  return validateScoringResult(result)
}

const SCORING_SYSTEM_PROMPT = `
You are an expert sales coach analyzing a practice sales call.
Your job is to score the call and provide actionable feedback.

You must respond in valid JSON with this exact structure:
{
  "scores": {
    "overall": <0-100>,
    "opening": <0-100>,
    "discovery": <0-100>,
    "objectionHandling": <0-100>,
    "communication": <0-100>,
    "closing": <0-100>
  },
  "feedback": {
    "summary": "<2-3 sentence overall summary>",
    "strengths": ["<specific strength 1>", "<specific strength 2>", ...],
    "improvements": ["<specific improvement 1>", "<specific improvement 2>", ...],
    "categories": {
      "opening": "<specific feedback or null>",
      "discovery": "<specific feedback or null>",
      "objectionHandling": "<specific feedback or null>",
      "communication": "<specific feedback or null>",
      "closing": "<specific feedback or null>"
    }
  }
}

Scoring guidelines:
- Be fair but not lenient
- Reference specific moments from the call
- Provide actionable, specific feedback
- Consider the difficulty of the persona
- Weight categories based on the practice mode
`.trim()
```

### 9.4 Supabase Integration

```typescript
// lib/supabase/client.ts (Browser)
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts (Server Components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}

// lib/supabase/admin.ts (Service Role - Server Only)
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 9.5 Clerk Integration

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)'
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}

// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }
  
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }
  
  const payload = await req.json()
  const body = JSON.stringify(payload)
  
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent
  
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }
  
  // Handle events
  switch (evt.type) {
    case 'user.created':
    case 'user.updated':
      await upsertUser(evt.data)
      break
    case 'user.deleted':
      await deleteUser(evt.data.id)
      break
  }
  
  return new Response('OK', { status: 200 })
}

async function upsertUser(data: any) {
  await adminClient.from('users').upsert({
    clerk_id: data.id,
    email: data.email_addresses[0]?.email_address,
    first_name: data.first_name,
    last_name: data.last_name,
    avatar_url: data.image_url,
  }, {
    onConflict: 'clerk_id'
  })
}

async function deleteUser(clerkId: string) {
  await adminClient.from('users').delete().eq('clerk_id', clerkId)
}
```

---

## 10. State Management

### 10.1 Global State (React Context)

```typescript
// contexts/user-context.tsx

interface UserState {
  user: User | null
  stats: UserStats | null
  isLoading: boolean
  error: Error | null
}

interface UserContextValue extends UserState {
  refreshStats: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser()
  const [state, setState] = useState<UserState>({
    user: null,
    stats: null,
    isLoading: true,
    error: null
  })
  
  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchUserData()
    }
  }, [isLoaded, clerkUser])
  
  // ... implementation
  
  return (
    <UserContext.Provider value={{ ...state, refreshStats }}>
      {children}
    </UserContext.Provider>
  )
}
```

### 10.2 Call State (Local + Hook)

```typescript
// hooks/use-call-state.ts

type CallState = 
  | { status: 'idle' }
  | { status: 'preparing'; callId: string }
  | { status: 'connecting'; callId: string }
  | { status: 'active'; callId: string; startTime: Date }
  | { status: 'ending'; callId: string }
  | { status: 'completed'; callId: string; result: CallResult }
  | { status: 'error'; callId?: string; error: Error }

type CallAction =
  | { type: 'PREPARE'; callId: string }
  | { type: 'CONNECT' }
  | { type: 'CONNECTED'; startTime: Date }
  | { type: 'END' }
  | { type: 'COMPLETE'; result: CallResult }
  | { type: 'ERROR'; error: Error }
  | { type: 'RESET' }

function callReducer(state: CallState, action: CallAction): CallState {
  switch (action.type) {
    case 'PREPARE':
      return { status: 'preparing', callId: action.callId }
    case 'CONNECT':
      if (state.status !== 'preparing') return state
      return { status: 'connecting', callId: state.callId }
    case 'CONNECTED':
      if (state.status !== 'connecting') return state
      return { status: 'active', callId: state.callId, startTime: action.startTime }
    case 'END':
      if (state.status !== 'active') return state
      return { status: 'ending', callId: state.callId }
    case 'COMPLETE':
      if (state.status !== 'ending') return state
      return { status: 'completed', callId: state.callId, result: action.result }
    case 'ERROR':
      return { status: 'error', callId: 'callId' in state ? state.callId : undefined, error: action.error }
    case 'RESET':
      return { status: 'idle' }
    default:
      return state
  }
}

export function useCallState() {
  return useReducer(callReducer, { status: 'idle' })
}
```

### 10.3 Transcript State (Realtime)

```typescript
// hooks/use-transcript.ts

interface UseTranscriptOptions {
  callId: string
  enabled: boolean
}

export function useTranscript({ callId, enabled }: UseTranscriptOptions) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([])
  const supabase = createClient()
  
  useEffect(() => {
    if (!enabled || !callId) return
    
    // Initial fetch
    async function fetchTranscript() {
      const { data } = await supabase
        .from('transcripts')
        .select('*')
        .eq('call_id', callId)
        .order('sequence_number', { ascending: true })
      
      if (data) {
        setMessages(data.map(toTranscriptMessage))
      }
    }
    
    fetchTranscript()
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`transcript:${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transcripts',
          filter: `call_id=eq.${callId}`
        },
        (payload) => {
          setMessages(prev => [...prev, toTranscriptMessage(payload.new)])
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [callId, enabled, supabase])
  
  const addMessage = useCallback((message: TranscriptMessage) => {
    setMessages(prev => [...prev, message])
  }, [])
  
  return { messages, addMessage }
}
```

---

## 11. Error Handling

### 11.1 Error Categories

| Category | Examples | User Message | Recovery |
|----------|----------|--------------|----------|
| Network | Connection lost, timeout | "Connection lost. Please check your internet." | Retry button |
| Auth | Session expired, unauthorized | "Please sign in again." | Redirect to login |
| Microphone | Permission denied, not found | "Microphone access required. Please allow access." | Instructions + retry |
| API | Rate limit, server error | "Something went wrong. Please try again." | Retry with backoff |
| ElevenLabs | Connection failed, quota | "Voice service unavailable. Try again shortly." | Retry or fallback |
| Validation | Invalid input | Show specific field errors | Fix and retry |

### 11.2 Error Boundary Implementation

```typescript
// components/shared/error-boundary.tsx

interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
    
    // Report to monitoring service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo })
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

### 11.3 API Error Handling

```typescript
// lib/utils/api-error.ts

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
  }
  
  static fromResponse(response: Response, body: any): APIError {
    return new APIError(
      body.error?.message || 'An error occurred',
      response.status,
      body.error?.code || 'UNKNOWN_ERROR',
      body.error?.details
    )
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  const body = await response.json()
  
  if (!response.ok) {
    throw APIError.fromResponse(response, body)
  }
  
  return body as T
}
```

---

## 12. Security Model

### 12.1 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│    Clerk    │────▶│  Next.js    │
│             │◀────│             │◀────│   Server    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                        │
      │         JWT with clerk_id              │
      ├────────────────────────────────────────┤
      │                                        │
      │                                        ▼
      │                                 ┌─────────────┐
      │                                 │  Supabase   │
      │                                 │  (RLS with  │
      │                                 │  clerk_id)  │
      │                                 └─────────────┘
```

### 12.2 Row Level Security

All database access goes through RLS policies:

1. **Users table**: Can only read/update own profile (matching `clerk_id`)
2. **Calls table**: Can only CRUD calls where `user_id` matches own user record
3. **Transcripts/Scores/Feedback**: Access through call relationship

### 12.3 API Security Checklist

- [ ] All non-public routes require authentication (Clerk middleware)
- [ ] API routes validate user ownership before any operation
- [ ] Rate limiting on API routes (Vercel's built-in or custom)
- [ ] Input validation with Zod on all endpoints
- [ ] No sensitive data in client-side code
- [ ] Environment variables properly secured
- [ ] Webhook signatures verified (Clerk, Stripe)
- [ ] CORS configured appropriately
- [ ] CSP headers set

### 12.4 Secrets Management

| Secret | Location | Access |
|--------|----------|--------|
| CLERK_SECRET_KEY | Vercel env | Server only |
| SUPABASE_SERVICE_ROLE_KEY | Vercel env | Server only |
| ELEVENLABS_API_KEY | Vercel env | Server only |
| GROQ_API_KEY | Vercel env | Server only |
| GOOGLE_APPLICATION_CREDENTIALS | Vercel env | Server only |
| NEXT_PUBLIC_* | Vercel env | Client accessible |

---

## 13. Testing Strategy

### 13.1 Test Pyramid

```
                    ┌───────────┐
                    │   E2E     │  ← Few, critical paths only
                    │  Tests    │
                    ├───────────┤
                    │Integration│  ← API routes, DB operations
                    │  Tests    │
               ┌────┴───────────┴────┐
               │    Unit Tests       │  ← Components, hooks, utils
               └─────────────────────┘
```

### 13.2 What to Test

#### Unit Tests (Vitest)

```typescript
// Components
- ScoreDisplay renders correct color for score ranges
- TranscriptView auto-scrolls on new messages
- PersonaCard displays correct difficulty stars

// Hooks
- useCallState transitions correctly
- useTranscript handles realtime updates
- useTimer counts accurately

// Utils
- formatDuration produces correct output
- calculateOverallScore applies weights correctly
- validateScoringResult catches invalid scores
```

#### Integration Tests (Vitest + MSW)

```typescript
// API Routes
- POST /api/calls creates call record
- GET /api/calls/:id returns call with scores
- POST /api/calls/:id/end triggers scoring
- GET /api/personas returns all personas

// Database Operations
- User sync from Clerk webhook
- Call lifecycle (create → active → completed)
- Transcript saving with correct sequence
```

#### E2E Tests (Playwright)

```typescript
// Critical User Paths
- Sign up → Dashboard → Start Call → End Call → See Score
- Sign in → View History → Click Call → See Debrief
- Sign in → Progress → See Charts

// Note: E2E tests will mock ElevenLabs to avoid API costs
```

### 13.3 Testing Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

---

## 14. Deployment Plan

### 14.1 Environment Strategy

| Environment | URL | Purpose | Data |
|-------------|-----|---------|------|
| Development | localhost:3000 | Local dev | Local Supabase |
| Preview | *.vercel.app | PR previews | Staging Supabase |
| Production | sparrow.app | Live users | Production Supabase |

### 14.2 Deployment Checklist

#### Pre-Deploy

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Clerk webhooks configured

#### Deploy Steps

1. Push to `main` branch
2. Vercel auto-deploys
3. Run post-deploy checks
4. Monitor error rates

#### Post-Deploy

- [ ] Verify homepage loads
- [ ] Test authentication flow
- [ ] Make test call
- [ ] Check error monitoring
- [ ] Review performance metrics

### 14.3 Rollback Plan

1. Identify issue in monitoring
2. Navigate to Vercel dashboard
3. Click "Redeploy" on previous good deployment
4. Verify rollback successful
5. Investigate and fix issue in new PR

---

## 15. Development Phases

### Phase 1: Foundation (Days 1-2)

**Goal**: Working authentication and basic navigation

- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind + shadcn/ui
- [ ] Configure Clerk authentication
- [ ] Create Supabase project and apply schema
- [ ] Set up Clerk → Supabase user sync webhook
- [ ] Build basic layout (header, nav, footer)
- [ ] Create dashboard skeleton page
- [ ] Deploy to Vercel

**Deliverable**: User can sign up, sign in, see dashboard

### Phase 2: Practice Setup (Days 3-4)

**Goal**: Mode and persona selection working

- [ ] Create practice mode cards
- [ ] Build persona data/constants
- [ ] Create persona selection page
- [ ] Build API route: GET /api/personas
- [ ] Build API route: POST /api/calls
- [ ] Create call preparation page
- [ ] Style with design tokens

**Deliverable**: User can select mode and persona, call record created

### Phase 3: Call Experience (Days 5-7)

**Goal**: Voice conversation working

- [ ] Integrate ElevenLabs SDK
- [ ] Build call interface UI
- [ ] Implement audio visualization
- [ ] Create transcript display component
- [ ] Build connection status indicator
- [ ] Implement call timer
- [ ] Handle microphone permissions
- [ ] Build API route: PATCH /api/calls/:id
- [ ] Build API route: POST /api/calls/:id/transcript
- [ ] Test end-to-end call flow

**Deliverable**: User can have voice conversation with AI

### Phase 4: Scoring & Feedback (Days 8-9)

**Goal**: Calls scored with feedback

- [ ] Integrate Groq for scoring
- [ ] Build scoring prompts
- [ ] Build API route: POST /api/calls/:id/end
- [ ] Create debrief page
- [ ] Build score display component
- [ ] Build feedback display component
- [ ] Build transcript review component
- [ ] Handle scoring errors gracefully

**Deliverable**: User sees score and feedback after call

### Phase 5: History & Progress (Day 10)

**Goal**: Users can see past calls and progress

- [ ] Build API route: GET /api/calls
- [ ] Build API route: GET /api/user
- [ ] Create history page with list
- [ ] Create progress page with charts
- [ ] Add stats to dashboard
- [ ] Build empty states

**Deliverable**: User can review history and track progress

### Phase 6: Polish & Submit (Days 11-12)

**Goal**: Ready for hackathon submission

- [ ] Fix bugs from testing
- [ ] Improve error messages
- [ ] Add loading states everywhere
- [ ] Performance optimization
- [ ] Mobile responsive fixes
- [ ] Record demo video
- [ ] Write Devpost submission
- [ ] Final testing
- [ ] Submit!

**Deliverable**: Hackathon submission complete

---

## 16. Success Metrics

### 16.1 MVP Success Criteria

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Complete call flow works | 100% | E2E test |
| Scoring returns in < 5s | 100% | API timing |
| Transcript displays real-time | Yes | Manual test |
| All 6 personas functional | 100% | Manual test |
| All 3 modes functional | 100% | Manual test |
| Auth works on all pages | 100% | E2E test |
| Mobile responsive | Yes | Manual test |
| Demo video recorded | Yes | Asset exists |

### 16.2 Hackathon Judging Criteria (ElevenLabs Track)

Based on typical hackathon judging:

| Criterion | Weight | Our Approach |
|-----------|--------|--------------|
| Innovation | 25% | Novel application of voice AI for sales training |
| Technical Implementation | 25% | Clean architecture, proper integrations |
| Use of ElevenLabs | 25% | Conversational AI, custom personas, voice quality |
| User Experience | 15% | Intuitive flow, real-time feedback |
| Presentation | 10% | Clear demo video, good README |

### 16.3 Post-Hackathon Metrics (Future)

| Metric | Why It Matters |
|--------|----------------|
| Calls per user per week | Engagement |
| Score improvement over time | Value delivered |
| Retention (7-day, 30-day) | Product-market fit |
| NPS | User satisfaction |
| Time to first call | Onboarding friction |

---

## Appendix A: Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sparrow

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ElevenLabs
ELEVENLABS_API_KEY=xi_...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=...

# Google Cloud (for Gemini)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Groq
GROQ_API_KEY=gsk_...
```

---

## Appendix B: Command Reference

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript check

# Testing
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run e2e           # Run Playwright tests

# Database
npm run db:generate   # Generate Supabase types
npm run db:migrate    # Apply migrations
npm run db:reset      # Reset database (dev only)

# Deployment
npm run deploy        # Deploy to Vercel (via git push)
```

---

## Appendix C: File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ScoreDisplay.tsx` |
| Hooks | camelCase with 'use' prefix | `useCallState.ts` |
| Utils | camelCase | `formatDuration.ts` |
| Types | PascalCase | `CallTypes.ts` |
| API Routes | kebab-case (folders) | `api/calls/[callId]/route.ts` |
| Pages | kebab-case (folders) | `app/practice/[mode]/page.tsx` |
| CSS | component-name | Tailwind classes inline |
| Tests | same as source + .test | `ScoreDisplay.test.tsx` |

---

## Appendix D: Git Workflow

```bash
# Feature development
git checkout -b feature/call-interface
# ... make changes ...
git add .
git commit -m "feat: add call interface with transcript"
git push origin feature/call-interface
# Create PR, get review, merge

# Commit message format
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructure
# test: adding tests
# chore: maintenance
```

---

*This document is the source of truth for Sparrow development. Update it as decisions are made.*

*Last updated: December 23, 2024*
