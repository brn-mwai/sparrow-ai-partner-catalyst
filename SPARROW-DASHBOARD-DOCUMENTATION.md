# Sparrow AI Dashboard - Feature Documentation

> Complete documentation of the Sparrow AI dashboard interface based on the HTML prototype (`sparrow-dashboard-v2.html`).

---

## Table of Contents

1. [Overview](#overview)
2. [Navigation Structure](#navigation-structure)
3. [Dashboard Page](#dashboard-page)
4. [Practice Page](#practice-page)
5. [Call Interface](#call-interface)
6. [Debrief Page](#debrief-page)
7. [Call History Page](#call-history-page)
8. [Progress Page](#progress-page)
9. [AI Prospects Page](#ai-prospects-page)
10. [Integrations Page](#integrations-page)
11. [Settings Page](#settings-page)
12. [Coach Sparrow Chat](#coach-sparrow-chat)
13. [Data Models](#data-models)
14. [Integrations](#integrations)

---

## Overview

Sparrow AI is a voice-powered sales training platform that enables sales professionals to practice cold calls, discovery conversations, and objection handling with realistic AI prospects.

### Key Value Proposition
- **24/7 Availability**: Practice anytime without scheduling with managers
- **Realistic AI Prospects**: Configurable personas with unique personalities and objections
- **Real-time Feedback**: Live scoring during calls powered by Groq
- **Deep Analysis**: Comprehensive post-call analysis powered by Gemini 2.0
- **Voice AI**: Natural voice conversations powered by ElevenLabs

---

## Navigation Structure

### Sidebar Navigation
- **Dashboard** - Home with stats and quick actions
- **Practice** - Start new practice sessions
- **Call History** - Review past calls
- **Progress** - Track improvement over time
- **AI Prospects** - Manage practice personas
- **Integrations** - View connected services
- **Settings** - User preferences

### User Menu
- User avatar with initials
- User name display
- Settings access

---

## Dashboard Page

### Stats Cards (4 cards in row)
| Card | Metric | Example |
|------|--------|---------|
| Total Calls | Count of completed calls | 23 |
| Average Score | Mean overall score (0-100) | 74 |
| Practice Time | Total duration formatted | 2.4h |
| Current Streak | Consecutive practice days | 4 days |

### Quick Start Section
Three action buttons for immediate practice:
1. **Cold Call** - Practice cold calling prospects
2. **Discovery** - Practice discovery conversations
3. **Objection Gauntlet** - Handle rapid-fire objections

### Recent Calls List
Displays 3 most recent calls with:
- Prospect avatar (initials with colored background)
- Prospect name and title
- Call mode badge (Cold Call, Discovery, Objection)
- Duration (e.g., "4:23")
- Score (0-100)
- Relative timestamp ("Today, 2:34 PM")

### Focus Area Card
AI-generated improvement suggestion:
- Skill category needing attention
- Specific observation from recent calls
- CTA button to practice that skill

### Skills Overview
5 skill categories with progress bars:
| Skill | Description |
|-------|-------------|
| Opening | First impression, earning attention |
| Discovery | Asking questions, uncovering pain |
| Objection Handling | Responding to pushback |
| Communication | Clarity, active listening |
| Closing | Asking for next steps |

---

## Practice Page

### Mode Selection
Three radio button options:
1. **Cold Call Simulator** - Book meetings through cold outreach
2. **Discovery Call** - Uncover pain and qualify prospects
3. **Objection Gauntlet** - Handle rapid-fire pushback

### Persona Selection
Grid of available AI prospects with:
- Avatar (initials with colored background)
- Name and title
- Company info (name, industry, size)
- Difficulty badge (Easy/Medium/Hard)
- Personality trait badge
- Background description
- User stats (calls count, average score)
- "Practice" CTA button

### Default Personas

| Name | Title | Company | Difficulty | Personality |
|------|-------|---------|------------|-------------|
| Sarah Chen | VP of Operations | LogiFlow (Logistics, 200 emp) | Medium | Skeptical |
| Mike Torres | CTO | DataSync (SaaS, 85 emp) | Hard | Technical |
| Rachel Johnson | Dir. of Procurement | MedTech Corp (Healthcare, 500 emp) | Easy | Friendly |

---

## Call Interface

### Layout (3 Panels)

#### Left Panel - Context
- **Prospect Info**: Avatar, name, title, company
- **Call Goal**: What you're trying to achieve
- **Key Tips**: 3 actionable suggestions for the call

#### Center Panel - Audio
- Large circular audio visualization (voice waveform)
- Call timer (MM:SS format)
- Control buttons:
  - Mute/Unmute microphone
  - End Call

#### Right Panel - Live Transcript
- Real-time transcript with speaker labels
- Color-coded backgrounds:
  - User messages: Right-aligned, primary color
  - Prospect messages: Left-aligned, gray background
- **Coach Sparrow Real-time Scoring**:
  - Score chips (75, 82, etc.) next to segments
  - Expandable insights on hover
  - Categories: Opener, Objection, Discovery, etc.
  - Tips for improvement

### Call Flow
1. Connection animation
2. Prospect greeting
3. Back-and-forth conversation
4. Real-time scoring overlay
5. End call -> Transition to debrief

---

## Debrief Page

### Header Section
- Result badge (Meeting Booked, Callback, Rejected, No Decision)
- Call duration
- Back to dashboard link

### Overall Score
- Large score display (0-100)
- Progress bar visualization
- Trend indicator vs previous calls

### Score Breakdown (5 Categories)
| Category | Score | Progress Bar | Description |
|----------|-------|--------------|-------------|
| Opening | 0-100 | Visual bar | First impression |
| Discovery | 0-100 | Visual bar | Uncovering needs |
| Objection Handling | 0-100 | Visual bar | Handling pushback |
| Communication | 0-100 | Visual bar | Clarity and flow |
| Closing | 0-100 | Visual bar | Asking for next step |

### Key Moments
Timestamped highlights from the call:

**Strong Moments** (Green)
- Timestamp (e.g., "0:15")
- Title (e.g., "Strong Opener")
- Description with transcript excerpt

**Weak Moments** (Orange/Yellow)
- Timestamp
- Title (e.g., "Weak Close")
- Description with improvement suggestion

**Missed Opportunities** (Blue)
- Timestamp
- Title
- What could have been done differently

### Strengths Section
Bulleted list of what went well:
- Specific observations with examples
- Positive reinforcement

### Areas to Improve Section
Bulleted list of improvement areas:
- Specific, actionable feedback
- Suggested alternatives

### Coach Sparrow CTA
- Gemini 2.0 powered chat assistant
- "Start Conversation" button
- Opens slide-in chat panel

### Full Transcript Link
- View complete conversation
- Timestamps for each message
- Jump-to-moment functionality

---

## Call History Page

### Filters
- **Mode Filter**: All Modes, Cold Call, Discovery, Objection Gauntlet
- **Time Filter**: Last 7 days, Last 30 days, All time

### History Table
| Column | Description |
|--------|-------------|
| Prospect | Avatar, name, title |
| Mode | Call type badge |
| Duration | MM:SS format |
| Score | Numeric (0-100) |
| Date | Relative/absolute timestamp |
| Action | Arrow to view debrief |

### Row Interaction
- Hover state
- Click to open debrief page

---

## Progress Page

### Progress Stats (4 Cards)
| Stat | Description | Example |
|------|-------------|---------|
| Score Trend | % change vs previous period | +18% |
| Calls Completed | Count this period | 23 this month |
| Best Score | Highest score achieved | 92 (Objection Gauntlet) |
| Practice Time | Total duration this period | 4.2h this month |

### Score Over Time Chart
- Bar chart showing weekly averages
- 4-week view
- Visual progression

### Skills Progress
5 skill categories with:
- Current score (0-100)
- Progress bar
- Change indicator (+/- from previous)
- Color coding for declining skills (orange)

---

## AI Prospects Page

### Tabs
1. **Default Prospects** - Pre-built personas
2. **My Custom Prospects** - User-created personas

### Default Prospects Grid
3 pre-configured personas (see Practice Page)

### Custom Prospects
- Empty state with CTA when none exist
- Grid of user-created prospects
- Delete button on hover

### Create Custom Prospect Modal

#### Basic Information
- First Name (required)
- Last Name (required)

#### Role & Company
- Job Title (required)
- Company Name (required)
- Industry (dropdown, required):
  - Technology, Healthcare, Finance, Retail, Manufacturing, Real Estate, Education, Consulting, Media, Logistics, Energy, Agriculture, Other
- Company Size (dropdown, required):
  - 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+

#### Difficulty & Personality
- Difficulty Level (radio, required):
  - Easy - Friendly & open
  - Medium - Some resistance
  - Hard - Very challenging
- Personality Traits (checkboxes, max 3):
  - Skeptical, Technical, Busy, Friendly, Analytical, Impatient, Budget-conscious, Risk-averse, Decision-maker, Gatekeeper

#### Background & Context
- Background Story (optional textarea)
- Common Objections (optional textarea)

#### Voice Selection (ElevenLabs)
- Selected voice display
- Browse Voices button -> Opens Voice Browser Modal
- Speaking Style dropdown:
  - Conversational, Professional, Casual, Formal
- Speaking Pace dropdown:
  - Normal, Fast (busy exec), Slow (thoughtful)

#### AI Enhancement Notice
- Gemini 2.0 enhances persona with realistic responses

---

## ElevenLabs Voice Browser Modal

### Header
- ElevenLabs branding
- "Choose from 5,000+ AI voices"
- Close button

### Search & Filters
- Search input (name, accent, style)
- Gender filter: All, Female, Male
- Accent filter: All, American, British, Australian, Indian, African, European
- Category filter: All, Professional, Conversational, Narrative, Characters

### Category Tabs
1. Featured - Curated top voices
2. Default Voices - Standard library
3. Community - User-shared voices
4. My Cloned Voices - Personal clones

### Voice Cards
- Avatar (gender-colored)
- Name
- Description
- Labels (traits)
- Preview button (play icon)
- Selected state with checkmark

### Footer
- Info text
- Cancel button
- Select Voice button (disabled until selection)

---

## Integrations Page

### Active Integrations Grid (4 Services)

#### ElevenLabs
- Status: Connected
- Used for:
  - Real-time voice conversations
  - Speech-to-text transcription
  - AI prospect voice generation
- Metrics: Avg latency 42ms, 99.9% uptime

#### Gemini 2.0 Flash (Google AI)
- Status: Connected
- Used for:
  - AI persona generation & backstories
  - Deep call analysis & scoring
  - Coach Sparrow chat responses
- Metrics: Avg latency 2.3s

#### Groq
- Status: Connected
- Used for:
  - Real-time call scoring (~200ms)
  - Quick feedback during calls
  - Fallback for Gemini timeouts
- Metrics: Avg latency 180ms, Model: llama-3.3-70b-versatile

#### Supabase
- Status: Connected
- Used for:
  - User data & call history storage
  - Real-time transcript streaming
  - Row-level security & auth sync
- Metrics: Region us-east-1, Realtime Active

#### Clerk
- Status: Connected
- Used for:
  - User sign-up & sign-in flows
  - Session & JWT management
  - Webhook sync with Supabase
- Metrics: OAuth (Google, GitHub), MFA Available

### Integration Flow Diagram
Visual flow: User -> ElevenLabs -> Supabase -> Groq -> Gemini

---

## Settings Page

### Profile Section
- User avatar (initials)
- Change photo button
- First name input
- Last name input

### Audio Settings
- Microphone dropdown (system devices)
- Speaker dropdown (system devices)

### Notifications
- Practice reminders toggle
- Weekly progress reports toggle

### Save Action
- Save Changes button

---

## Coach Sparrow Chat

### Slide-in Panel
- Fixed right side, full height
- 384px width (w-96)

### Header
- Robot avatar
- "Coach Sparrow" title
- "Ask about your call" subtitle
- Close button

### Powered By Badge
- "Powered by Gemini 2.0 Flash"

### Welcome Message
- Personalized greeting with call context
- Overall score reference
- Prompt for questions

### Suggested Questions
- 3 pre-built question buttons
- Contextual to the call just completed

### Chat Input
- Text input field
- Send button
- Context note ("Based on your transcript with [Prospect]")

### Chat Messages
- User messages: Right-aligned, primary background
- AI messages: Left-aligned, gray background
- Markdown support for formatting

---

## Data Models

### User
```
- id: UUID
- clerk_id: String (unique)
- email: String
- name: String
- role: Enum (sdr, ae, manager, founder)
- industry: String
- preferences: JSON
- plan: Enum (free, starter, pro)
- onboarding_completed: Boolean
- created_at: Timestamp
- updated_at: Timestamp
```

### Prospect
```
- id: UUID
- name: String
- title: String
- company_name: String
- company_size: String
- industry: String
- difficulty: Enum (easy, medium, hard)
- personality_traits: String[]
- background: Text
- objections: Text
- voice_id: String (ElevenLabs)
- speaking_style: Enum
- speaking_pace: Enum
- is_default: Boolean
- created_by: UUID (null for defaults)
- created_at: Timestamp
```

### Call
```
- id: UUID
- user_id: UUID (FK)
- prospect_id: UUID (FK)
- type: Enum (cold_call, discovery, objection_gauntlet)
- status: Enum (ready, active, completed, abandoned)
- duration_seconds: Integer
- goal: String
- recording_url: String
- elevenlabs_conversation_id: String
- started_at: Timestamp
- completed_at: Timestamp
- created_at: Timestamp
```

### Call Transcript
```
- id: UUID
- call_id: UUID (FK)
- messages: JSONB
  - speaker: Enum (user, prospect)
  - content: String
  - timestamp_ms: Integer
- created_at: Timestamp
- updated_at: Timestamp
```

### Call Score
```
- id: UUID
- call_id: UUID (FK, unique)
- overall_score: Integer (0-100)
- opening_score: Integer (0-100)
- discovery_score: Integer (0-100)
- objection_score: Integer (0-100)
- communication_score: Integer (0-100)
- closing_score: Integer (0-100)
- outcome: Enum (meeting_booked, callback, rejected, no_decision)
- created_at: Timestamp
```

### Call Feedback
```
- id: UUID
- call_id: UUID (FK)
- category: Enum (opening, discovery, objection, communication, closing)
- timestamp_ms: Integer
- feedback_type: Enum (positive, negative, missed_opportunity)
- title: String
- content: Text
- suggestion: Text
- transcript_excerpt: Text
- created_at: Timestamp
```

### User Progress
```
- id: UUID
- user_id: UUID (FK, unique)
- total_calls: Integer
- total_duration_seconds: Integer
- current_streak: Integer
- longest_streak: Integer
- last_call_date: Date
- avg_overall_score: Decimal
- skill_scores: JSONB
  - opening: Integer
  - discovery: Integer
  - objection: Integer
  - communication: Integer
  - closing: Integer
- updated_at: Timestamp
```

### User Prospect Stats
```
- id: UUID
- user_id: UUID (FK)
- prospect_id: UUID (FK)
- calls_count: Integer
- avg_score: Decimal
- updated_at: Timestamp
```

---

## Integrations

### ElevenLabs (Voice AI)
- **Purpose**: Real-time voice conversations
- **Features Used**:
  - Conversational AI SDK
  - Speech-to-Text
  - Text-to-Speech
  - Voice Library API
- **Environment Variables**:
  - `ELEVENLABS_API_KEY`
  - `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
  - `ELEVENLABS_VOICE_*` (voice IDs)

### Google Gemini 2.0 Flash
- **Purpose**: Deep analysis and persona generation
- **Features Used**:
  - Persona backstory generation
  - Comprehensive call analysis
  - Coach Sparrow responses
  - Scoring synthesis
- **Environment Variables**:
  - `GOOGLE_GENERATIVE_AI_API_KEY`
  - `GEMINI_MODEL`

### Groq
- **Purpose**: Real-time scoring during calls
- **Features Used**:
  - Ultra-fast inference (~200ms)
  - Real-time segment scoring
  - Quick feedback generation
- **Environment Variables**:
  - `GROQ_API_KEY`
  - `GROQ_MODEL`

### Supabase
- **Purpose**: Database and real-time features
- **Features Used**:
  - PostgreSQL database
  - Row-level security
  - Real-time subscriptions
  - File storage (recordings)
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Clerk
- **Purpose**: Authentication
- **Features Used**:
  - Sign-up / Sign-in flows
  - OAuth (Google, GitHub)
  - Session management
  - Webhooks for user sync
- **Environment Variables**:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`

---

## Design System Notes

### Color Palette
- Primary: Blue (#2563eb, primary-600)
- Success: Green (#16a34a)
- Warning: Orange (#f97316)
- Error: Red (#dc2626)
- Neutral: Gray scale

### Styling Principles
- **No shadows**: Use borders instead
- **Clean borders**: 1px gray-200
- **Rounded corners**: 8px (rounded-lg)
- **Generous spacing**: p-6, gap-6
- **Consistent padding**: 4px, 8px, 12px, 16px, 24px

### Typography
- Font: System font stack
- Headings: Semibold (600)
- Body: Normal (400)
- Small text: text-sm (14px)

### Components
- Cards with borders (no shadows)
- Pills/badges for status
- Progress bars for scores
- Avatar circles with initials
- Icon library: Phosphor Icons

---

*Last Updated: December 2024*
*Based on: sparrow-dashboard-v2.html prototype*
