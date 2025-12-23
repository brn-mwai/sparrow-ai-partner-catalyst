# Sparrow AI Dashboard Documentation

> **Voice-Powered Sales Training Platform**  
> AI Partner Catalyst Hackathon Submission - Targeting ElevenLabs ($12.5K) + Datadog ($12.5K) Tracks

---

## Table of Contents

1. [Overview](#overview)
2. [Hackathon Tracks & Requirements](#hackathon-tracks--requirements)
3. [Technology Stack & Integrations](#technology-stack--integrations)
4. [Sidebar Navigation](#sidebar-navigation)
5. [Pages Deep Dive](#pages-deep-dive)
   - [Dashboard (Home)](#1-dashboard-home)
   - [Practice](#2-practice)
   - [Call Interface](#3-call-interface)
   - [Debrief](#4-debrief)
   - [Call History](#5-call-history)
   - [Progress](#6-progress)
   - [AI Prospects](#7-ai-prospects)
   - [Integrations](#8-integrations)
   - [Settings](#9-settings)
6. [Special Features](#special-features)
   - [Coach Sparrow Chatbot](#coach-sparrow-chatbot)
   - [Custom Prospect Creator](#custom-prospect-creator)
   - [ElevenLabs Voice Browser](#elevenlabs-voice-browser)
7. [User Flow](#user-flow)
8. [Design System](#design-system)

---

## Overview

Sparrow AI is a voice-based sales training platform that allows sales professionals to practice conversations with realistic AI prospects. The platform provides real-time feedback, detailed scoring, and personalized coaching to help users improve their sales skills.

### Core Value Proposition

| Problem | Solution |
|---------|----------|
| Sales reps lack realistic practice opportunities | AI-powered voice conversations with dynamic personas |
| Feedback is delayed and subjective | Real-time scoring and instant AI coaching |
| Training doesn't scale | Unlimited practice sessions available 24/7 |
| No visibility into skill gaps | Detailed analytics and progress tracking |

### Target Users

- **Sales Development Representatives (SDRs)** - Practicing cold calls and outreach
- **Account Executives** - Refining discovery and closing skills
- **Sales Managers** - Training and benchmarking team performance
- **New Hires** - Accelerating onboarding with safe practice environment

---

## Hackathon Tracks & Requirements

Sparrow AI is built to compete in **two prize tracks** of the AI Partner Catalyst hackathon:

### 🎯 ElevenLabs Track ($12,500)

> *"Use ElevenLabs and Google Cloud AI to make your app conversational, intelligent, and voice-driven."*

#### Track Requirements & How We Deliver

| Requirement | Sparrow AI Implementation |
|-------------|---------------------------|
| Combine ElevenLabs with Vertex AI/Gemini | ✅ ElevenLabs voices + Gemini 2.0 Flash for persona intelligence |
| Natural, human voice and personality | ✅ 5,000+ voice library with accent/gender/style selection |
| Users interact entirely through speech | ✅ Full voice conversations during practice calls |
| React SDK or server-side integration | ✅ Next.js with server-side ElevenLabs API calls |

#### ElevenLabs Features Used

| Feature | Purpose in Sparrow |
|---------|-------------------|
| **Text-to-Speech API** | Generate AI prospect voice responses |
| **Speech-to-Text API** | Transcribe user speech in real-time |
| **Voice Library API** | Browse 5,000+ voices for prospect customization |
| **Conversational AI** | Natural turn-taking in sales dialogues |
| **Voice Design** | Match voice personality to prospect traits |

#### Official Resources

| Resource | Link |
|----------|------|
| 📚 ElevenLabs Docs | [elevenlabs.io/docs](https://elevenlabs.io/docs) |
| 🎙️ Conversational AI Quickstart | [Conversational AI Guide](https://elevenlabs.io/docs/conversational-ai) |
| 🎨 Voice Design Best Practices | [Voice Design Docs](https://elevenlabs.io/docs/voice-design) |
| ✍️ Prompting Guide | [Prompting Documentation](https://elevenlabs.io/docs/prompting) |
| 💬 Discord Support | [ElevenLabs Discord](https://discord.gg/elevenlabs) |

> 💡 **Judge Tip from Thor (ElevenLabs):** *"Explore our Conversational AI and Voice Design Best Practices sections in the docs to create lifelike, engaging voice experiences."*

---

### 🎯 Datadog Track ($12,500)

> *"Implement an innovative end-to-end observability monitoring strategy for an LLM application powered by Vertex AI or Gemini."*

#### Hard Requirements & How We Deliver

| Hard Requirement | Sparrow AI Implementation |
|------------------|---------------------------|
| Leverage Vertex AI or Gemini as model host | ✅ Gemini 2.0 Flash for analysis + Groq for real-time scoring |
| Report telemetry to Datadog | ✅ APM, LLM Observability, custom metrics, logs |
| Define at least 3 detection rules | ✅ Latency monitors, error rate SLOs, cost alerts |
| Create actionable records (Incidents/Cases) | ✅ Auto-create incidents with runbook context |
| In-Datadog view showing app health | ✅ Custom dashboard with latency/errors/tokens/cost |

#### Datadog Features Used

| Feature | Purpose in Sparrow |
|---------|-------------------|
| **APM (Application Performance Monitoring)** | Track API response times across all services |
| **LLM Observability** | Monitor Gemini/Groq token usage, latency, costs |
| **Distributed Tracing** | Follow requests: ElevenLabs → Supabase → LLMs |
| **Custom Metrics** | Call duration, scores, user engagement, voice latency |
| **Monitors & SLOs** | Detection rules for latency spikes, error rates |
| **Incident Management** | Auto-create actionable items with context |
| **Dashboards** | Unified view of system health and AI performance |

#### Detection Rules We Define

| Rule | Trigger Condition | Action |
|------|-------------------|--------|
| **ElevenLabs Latency Spike** | Voice API p95 > 150ms for 5 min | Create incident + alert |
| **Gemini Error Rate** | Analysis failures > 5% in 10 min | Create case + notify |
| **Token Cost Anomaly** | Daily token spend > 150% of baseline | Alert + cost dashboard |
| **Call Abandonment Rate** | Users ending calls < 30s > 20% | Create case for UX review |
| **Groq Timeout** | Real-time scoring > 500ms | Fallback alert + trace |

#### Submission Deliverables

| Deliverable | Status |
|-------------|--------|
| Hosted application URL | 🔜 Vercel deployment |
| Public repo with OSI license | 🔜 GitHub (MIT) |
| README with deployment instructions | 🔜 Included |
| JSON export of Datadog configs | 🔜 Monitors, SLOs, dashboards |
| Traffic generator script | 🔜 Simulate practice calls |
| 3-minute video walkthrough | 🔜 Loom recording |
| Dashboard screenshots | 🔜 Included |

#### Official Resources

| Resource | Link |
|----------|------|
| 📚 Datadog Documentation | [docs.datadoghq.com](https://docs.datadoghq.com) |
| 🎓 Learning Center | [learn.datadoghq.com](https://learn.datadoghq.com) |
| 🤖 LLM Observability | [LLM Monitoring Docs](https://docs.datadoghq.com/llm_observability/) |
| 📊 APM Setup | [APM Documentation](https://docs.datadoghq.com/tracing/) |
| 🆘 Support | [Datadog Support](https://www.datadoghq.com/support/) |

---

### 📊 Combined Track Strategy

By targeting both tracks, Sparrow AI demonstrates:

```
┌─────────────────────────────────────────────────────────────────┐
│                      SPARROW AI ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   USER VOICE ──► ELEVENLABS ──► GEMINI ──► RESPONSE             │
│        │              │            │           │                 │
│        └──────────────┴────────────┴───────────┘                 │
│                         │                                        │
│                    DATADOG                                       │
│              (Observing Everything)                              │
│                                                                  │
│   • Voice latency metrics (ElevenLabs)                          │
│   • LLM token tracking (Gemini/Groq)                            │
│   • End-to-end trace correlation                                │
│   • Real-time alerting on degradation                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why This Wins Both Tracks:**

1. **ElevenLabs Track** - Voice is core to the experience, not bolted on
2. **Datadog Track** - Observability is production-grade, not demo-level
3. **Integration Depth** - Both services work together (Datadog monitors ElevenLabs performance)
4. **Real Problem** - Sales training is a genuine market with paying customers

---

## Technology Stack & Integrations

Sparrow AI leverages six key integrations, each serving a specific purpose in the platform:

### 1. ElevenLabs (Voice AI)

**Purpose:** Powers all voice interactions in the platform

| Feature | How It's Used |
|---------|---------------|
| **Text-to-Speech (TTS)** | Generates realistic AI prospect voices during calls |
| **Speech-to-Text (STT)** | Transcribes user speech in real-time |
| **Voice Library** | 5,000+ voices for prospect customization |
| **Voice Cloning** | (Future) Clone customer voices for ultra-realistic practice |

**Where You'll See It:**
- Call interface (voice generation)
- Live transcript panel
- Voice browser in prospect creator
- Sidebar status indicator

**Why ElevenLabs:** Industry-leading voice quality with <75ms latency, essential for natural conversation flow. The extensive voice library enables diverse prospect personas matching real-world demographics.

---

### 2. Datadog (Observability)

**Purpose:** Monitors all platform services and tracks performance metrics

| Feature | How It's Used |
|---------|---------------|
| **APM (Application Performance Monitoring)** | Tracks API response times |
| **Distributed Tracing** | Follows requests across ElevenLabs → Supabase → LLMs |
| **Custom Metrics** | Tracks call duration, scores, user engagement |
| **Alerts** | Notifies team of latency spikes or errors |
| **Dashboards** | Visualizes system health and user analytics |

**Where You'll See It:**
- Dashboard banner ("Monitored by Datadog")
- Call interface (tracing indicator)
- Progress page (analytics powered by Datadog)
- Integrations page (detailed status)
- Sidebar (monitoring status)

**Why Datadog:** Critical for hackathon judging criteria. Demonstrates production-ready observability, enables performance optimization, and provides audit trail for AI interactions.

---

### 3. Gemini 2.0 Flash (Google AI)

**Purpose:** Handles complex analysis and content generation

| Feature | How It's Used |
|---------|---------------|
| **Persona Generation** | Creates detailed AI prospect backstories and behaviors |
| **Deep Call Analysis** | Comprehensive scoring with specific feedback |
| **Coach Sparrow Responses** | Powers the post-call chatbot conversations |
| **Objection Generation** | Creates realistic, contextual objections |

**Where You'll See It:**
- Debrief page (scoring breakdown)
- Coach Sparrow chat panel
- AI Prospects page (persona indicator)
- Practice page (powered by section)

**Why Gemini 2.0:** Superior reasoning capabilities for nuanced sales feedback. Flash variant provides good balance of quality and speed (~2.3s for deep analysis).

---

### 4. Groq (Ultra-Fast Inference)

**Purpose:** Real-time scoring during live calls

| Feature | How It's Used |
|---------|---------------|
| **Live Scoring** | Updates skill scores during conversation (~200ms) |
| **Quick Feedback** | Instant tips during the call |
| **Fallback** | Backup if Gemini experiences latency |

**Where You'll See It:**
- Call interface (Coach Sparrow panel with live scores)
- Debrief page (quick score indicator)
- Practice page (powered by section)

**Why Groq:** 10x faster than traditional LLM inference. Essential for real-time feedback without interrupting conversation flow.

---

### 5. Supabase (Database & Realtime)

**Purpose:** Data persistence and real-time updates

| Feature | How It's Used |
|---------|---------------|
| **PostgreSQL Database** | Stores users, calls, transcripts, scores |
| **Realtime Subscriptions** | Pushes live transcript updates |
| **Row-Level Security** | Ensures users only access their own data |
| **Edge Functions** | Serverless compute for API routes |

**Where You'll See It:**
- Call interface (realtime transcript indicator)
- Integrations page (connection status)

**Why Supabase:** Seamless Next.js integration, built-in realtime capabilities eliminate need for separate WebSocket infrastructure.

---

### 6. Clerk (Authentication)

**Purpose:** User authentication and session management

| Feature | How It's Used |
|---------|---------------|
| **Sign Up/Sign In** | Email, Google, GitHub OAuth |
| **Session Management** | JWT tokens for API authentication |
| **User Profiles** | Stores name, avatar, preferences |
| **Webhooks** | Syncs user data with Supabase |

**Where You'll See It:**
- Sidebar (user profile section)
- Settings page (profile management)
- Integrations page (auth status)

**Why Clerk:** Drop-in auth solution that handles security best practices. Reduces development time while ensuring enterprise-grade authentication.

---

## Sidebar Navigation

The sidebar provides persistent navigation across all dashboard pages.

### Structure

```
┌─────────────────────────┐
│  🐦 Sparrow AI          │  ← Logo/Brand
├─────────────────────────┤
│  ▣ Dashboard            │  ← Primary nav
│  📞 Practice            │
│  🕐 Call History        │
│  📈 Progress            │
│  👥 AI Prospects        │
├─────────────────────────┤
│  🔌 Integrations        │  ← Secondary nav
│  ⚙️ Settings            │
├─────────────────────────┤
│  Services Status        │  ← Integration health
│  • ElevenLabs   Active  │
│  • Datadog   Monitoring │
├─────────────────────────┤
│  👤 Brian Mwai          │  ← User profile
│     brian@hausorlabs.com│
│                    [↗]  │  ← Sign out
└─────────────────────────┘
```

### Navigation Items

| Item | Purpose | Icon |
|------|---------|------|
| **Dashboard** | Home view with stats and quick actions | `ph-squares-four` |
| **Practice** | Start a new practice call | `ph-phone-call` |
| **Call History** | View past practice sessions | `ph-clock-counter-clockwise` |
| **Progress** | Analytics and skill tracking | `ph-chart-line-up` |
| **AI Prospects** | Manage practice personas | `ph-users-three` |
| **Integrations** | View connected services | `ph-plugs-connected` |
| **Settings** | Profile and preferences | `ph-gear` |

### Services Status Section

**Why It's Here:** Provides at-a-glance system health without leaving the current page. The pulsing indicator on Datadog emphasizes active monitoring.

### User Profile Section

**Why It's Here:** Quick access to user identity and sign-out. Positioned at bottom following common dashboard patterns (Slack, Discord, etc.).

---

## Pages Deep Dive

### 1. Dashboard (Home)

**URL:** `/dashboard`  
**Purpose:** Command center for the user's training journey

#### What It Contains

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Header** | Welcome message, "Start Practice Call" CTA | Personalization + primary action always visible |
| **Integration Banner** | System health status with Datadog indicator | Reassures user platform is operational |
| **Stats Cards** | Total Calls, Average Score, Practice Time, Streak | Gamification + progress awareness |
| **Quick Start** | 3 practice mode cards (Cold Call, Discovery, Objection) | Reduce friction to starting practice |
| **Recent Calls** | Last 3 calls with prospect, mode, score, time | Continue momentum, review recent work |
| **Focus Area** | AI-identified weakness with actionable advice | Targeted improvement guidance |
| **Skills Overview** | Progress bars for 4 skill categories | Visual snapshot of strengths/weaknesses |

#### Key Design Decisions

- **Stats cards use +/- indicators** to show trend direction (positive reinforcement)
- **Streak counter** gamifies consistency (behavioral motivation)
- **Focus Area uses orange** to draw attention to improvement opportunities
- **Closing skill bar is orange** when below threshold, highlighting weakness

---

### 2. Practice

**URL:** `/practice`  
**Purpose:** Configure and launch a practice session

#### What It Contains

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Mode Selection** | 3 radio card options with feature lists | Clear differentiation between practice types |
| **Persona Selection** | 6 AI prospect cards with difficulty/traits | Match practice to skill level and scenario |
| **Powered By Section** | ElevenLabs, Gemini, Groq logos | Transparency about AI stack |
| **Start Call Button** | Primary CTA | Clear next step |

#### Practice Modes Explained

| Mode | Skills Practiced | Typical Duration |
|------|-----------------|------------------|
| **Cold Call** | Opening hooks, gatekeeper handling, value props | 2-5 minutes |
| **Discovery Call** | Open questions, active listening, pain quantification | 5-10 minutes |
| **Objection Gauntlet** | Price objections, timing concerns, competitor handling | 3-5 minutes |

#### Persona Card Information

Each card displays:
- **Name & Title** - Professional identity
- **Company & Industry** - Context for conversation
- **Difficulty Badge** - Easy (green), Medium (yellow), Hard (red)
- **Personality Trait** - Behavioral hint (Skeptical, Technical, Friendly, etc.)
- **Description** - Brief behavioral preview

**Why 6 Personas:** Covers range of difficulties and personality types without overwhelming choice. More available via AI Prospects page.

---

### 3. Call Interface

**URL:** `/call`  
**Purpose:** The live practice call experience

#### Layout: Three-Panel Design

```
┌──────────────┬────────────────────────┬──────────────────┐
│              │                        │                  │
│   Context    │      Call Center       │   Transcript     │
│   Panel      │                        │   & Scoring      │
│              │                        │                  │
└──────────────┴────────────────────────┴──────────────────┘
     272px            flexible                  384px
```

#### Left Panel - Context

| Content | Why |
|---------|-----|
| Practice Mode | Reminds user what they're practicing |
| AI Prospect Info | Name, title, company for reference |
| Call Tips | 3 contextual suggestions |
| Active Services | ElevenLabs latency, Datadog tracing status |
| End Call Button | Emergency exit |

#### Center Panel - Call Interface

| Content | Why |
|---------|-----|
| Call Status | Green pulse indicates live connection |
| Timer | Duration awareness |
| Datadog Indicator | Shows monitoring is active |
| Audio Visualization | Animated waveform provides visual feedback |
| Mic Controls | Mute/unmute, volume, end call |

#### Right Panel - Live Transcript

| Content | Why |
|---------|-----|
| Chat Bubbles | Real-time conversation record |
| Speaker Labels | Distinguish user from AI prospect |
| Typing Indicator | Shows when AI is generating response |
| Coach Sparrow Scores | Live updating skill scores |
| Service Indicator | Shows Supabase realtime is active |

#### Real-Time Scoring (Coach Sparrow Panel)

Displays live scores for:
- **Opening** - Hook quality, attention capture
- **Discovery** - Question quality, listening signals
- **Objections** - Handling technique, reframe success

**Why Real-Time Scoring:** Immediate feedback accelerates learning. Users can course-correct mid-call rather than waiting for post-call review.

---

### 4. Debrief

**URL:** `/debrief`  
**Purpose:** Post-call analysis and learning

#### What It Contains

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Scoring Banner** | Groq (180ms) + Gemini (2.3s) timing | Transparency about AI analysis |
| **Overall Score** | Circular progress with number | Clear headline metric |
| **Performance Summary** | Good/needs work text + comparison | Context for the score |
| **Score Breakdown** | 5 category cards with individual scores | Granular feedback |
| **Key Moments** | Timeline of specific call events | Actionable, timestamped feedback |
| **Strengths List** | What went well (green checkmarks) | Positive reinforcement |
| **Improvements List** | What to work on (orange arrows) | Clear next steps |
| **Coach Sparrow CTA** | Button to open chat panel | Path to deeper learning |
| **Transcript Link** | Access full conversation | Reference for self-review |

#### Score Categories

| Category | What It Measures | Weight |
|----------|------------------|--------|
| **Opening** | Hook strength, personalization, attention capture | 20% |
| **Discovery** | Question quality, listening, pain identification | 25% |
| **Objections** | Handling technique, reframes, composure | 20% |
| **Communication** | Clarity, pace, professionalism | 15% |
| **Closing** | Next step ask, commitment, urgency | 20% |

#### Key Moments Types

- **Green (Success)** - Strong hook, good reframe, effective question
- **Orange (Improvement)** - Weak close, missed opportunity, unclear response

**Why Timestamped Feedback:** Allows user to mentally replay the moment. More actionable than generic advice.

---

### 5. Call History

**URL:** `/history`  
**Purpose:** Access and review past practice sessions

#### What It Contains

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Filters** | Mode dropdown, date range selector | Find specific calls quickly |
| **Calls Table** | Prospect, mode, duration, score, date | Scannable overview |
| **Row Actions** | Click to view debrief | Easy access to details |

#### Table Columns

| Column | Purpose |
|--------|---------|
| **Prospect** | Avatar, name, title - identify the conversation |
| **Mode** | Color-coded badge - see practice type at glance |
| **Duration** | Time spent - track commitment |
| **Score** | Numeric result - quick performance check |
| **Date** | Recency - temporal context |
| **Arrow** | Navigate to full debrief |

**Why a Table:** Efficient for scanning many items. Familiar pattern from email/CRM interfaces sales users know.

---

### 6. Progress

**URL:** `/progress`  
**Purpose:** Track improvement over time

#### What It Contains

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Datadog Banner** | "Analytics powered by Datadog" | Hackathon track visibility |
| **Trend Stats** | Score trend, calls completed, best score, time | High-level progress indicators |
| **Score Chart** | Weekly bar chart visualization | Visual trend over time |
| **Skills Progress** | 5 skills with scores and deltas | Per-skill improvement tracking |

#### Stats Cards

| Stat | What It Shows | Why It Matters |
|------|---------------|----------------|
| **Score Trend** | % change vs last period | Are you improving? |
| **Calls Completed** | Total practice sessions | Volume of practice |
| **Best Score** | Highest achieved score + mode | Peak performance reference |
| **Practice Time** | Hours invested | Commitment measurement |

#### Skills Progress Details

Each skill shows:
- **Current Score** - Where you are now
- **Delta** - Change from last period (green +, red -)
- **Progress Bar** - Visual representation

**Why Delta Indicators:** Shows direction of change, not just current state. Motivates continued practice when positive, highlights areas needing attention when negative.

---

### 7. AI Prospects

**URL:** `/personas`  
**Purpose:** Manage AI conversation partners

#### What It Contains

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Tabs** | Default Prospects / My Custom Prospects | Organize built-in vs user-created |
| **Create Button** | "Create Prospect" CTA | Enable customization |
| **Prospect Grid** | Cards for each persona | Visual browsing |
| **Per-Prospect Stats** | Calls count, average score | Track performance by persona |

#### Default Prospect Cards

Each card includes:
- **Avatar** - Color-coded initials
- **Name & Title** - Professional identity
- **Company Info** - Industry and size
- **Difficulty Badge** - Visual skill level indicator
- **Personality Trait** - Behavioral hint
- **Background Story** - 2-3 sentence context
- **User Stats** - Personal performance with this prospect

#### Custom Prospects Tab

When empty, shows:
- **Empty State Illustration** - Visual cue
- **Explanation Text** - Why create custom prospects
- **Create CTA** - Action button

When populated, shows:
- **Custom Prospect Cards** - Same format as default
- **Delete Option** - Hover to reveal trash icon
- **Practice Button** - Quick start call
- **Voice Indicator** - Shows selected ElevenLabs voice

**Why Custom Prospects:** Users may want to practice for specific customers, industries, or challenging scenarios not covered by defaults.

---

### 8. Integrations

**URL:** `/integrations`  
**Purpose:** Transparency about connected services

#### What It Contains

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Service Cards** | 6 integration cards with status | Detailed view of each service |
| **Connection Status** | Green badges with indicators | Confirm services are working |
| **Use Case Lists** | Bullet points per service | Explain what each does |
| **Performance Metrics** | Latency, uptime stats | Technical transparency |
| **Architecture Diagram** | Visual flow of data | System understanding |

#### Service Cards Include

For each integration (ElevenLabs, Datadog, Gemini, Groq, Supabase, Clerk):
- **Logo** - Visual identification
- **Name & Category** - Service identity
- **Status Badge** - Connected/Monitoring indicator
- **Description** - One-sentence purpose
- **Use Cases** - 3-4 bullet points of features used
- **Metrics** - Latency, region, model version

#### Architecture Flow Diagram

```
User → Voice (ElevenLabs) → Database (Supabase) → Fast Score (Groq) → Deep Analysis (Gemini) ↔ Monitor (Datadog)
```

**Why This Page Exists:** 
1. Hackathon judges need to see integration depth
2. Users appreciate transparency about AI stack
3. Troubleshooting reference if issues occur

---

### 9. Settings

**URL:** `/settings`  
**Purpose:** User preferences and configuration

#### What It Contains

| Section | Content | Why It's Here |
|---------|---------|---------------|
| **Profile** | Avatar, name fields | Basic identity management |
| **Audio Settings** | Microphone/speaker selection | Ensure correct devices |
| **Notifications** | Toggle switches | Control communication preferences |
| **Save Button** | Apply changes | Confirm action |

#### Settings Sections

| Setting | Options | Default |
|---------|---------|---------|
| **First Name** | Text input | From Clerk profile |
| **Last Name** | Text input | From Clerk profile |
| **Microphone** | Device dropdown | System default |
| **Speaker** | Device dropdown | System default |
| **Practice Reminders** | Toggle on/off | On |
| **Weekly Reports** | Toggle on/off | On |

**Why Minimal Settings:** Focus on essential configuration. Avoid overwhelming users with options. Can expand as platform matures.

---

## Special Features

### Coach Sparrow Chatbot

**Location:** Slide-out panel on Debrief page  
**Trigger:** "Ask Coach Sparrow" button

#### What It Does

- Answers questions about the specific call just completed
- Provides personalized advice based on transcript
- Suggests alternative responses for weak moments
- Explains scoring rationale

#### Interface Elements

| Element | Purpose |
|---------|---------|
| **Header** | Coach Sparrow identity + Gemini badge |
| **Welcome Message** | Context-aware greeting with score mention |
| **Suggested Questions** | 3 clickable prompts to start conversation |
| **Chat History** | Scrollable message thread |
| **Input Field** | Free-form question entry |
| **Send Button** | Submit question |

#### Sample Questions Handled

- "Why did I score low on closing?"
- "How could I have handled the objection better?"
- "What should I say next time to close?"
- "Was my opening strong enough?"
- "How do I improve my discovery questions?"

**Why a Chatbot:** More engaging than static feedback. Allows users to explore specific concerns. Mimics having a sales coach available 24/7.

---

### Custom Prospect Creator

**Location:** Modal triggered from AI Prospects page  
**Trigger:** "Create Prospect" button

#### Form Sections

| Section | Fields | Purpose |
|---------|--------|---------|
| **Basic Info** | First name, Last name | Identity |
| **Role & Company** | Title, Company, Industry, Size | Professional context |
| **Difficulty** | Easy/Medium/Hard radio | Skill matching |
| **Personality** | 10 trait checkboxes (max 3) | Behavioral definition |
| **Background** | Backstory textarea | Conversation context |
| **Objections** | Common objections textarea | Challenge preparation |
| **Voice** | ElevenLabs voice browser | Audio identity |
| **Settings** | Speaking style, pace | Voice tuning |

#### Personality Traits Available

| Trait | Behavior Impact |
|-------|-----------------|
| **Skeptical** | Questions claims, needs proof |
| **Technical** | Asks detailed implementation questions |
| **Busy** | Interrupts, wants brevity |
| **Friendly** | Warm, encouraging |
| **Analytical** | Data-driven, ROI focused |
| **Impatient** | Short responses, time pressure |
| **Budget-conscious** | Price objections |
| **Risk-averse** | Needs case studies, references |
| **Decision-maker** | Can commit, asks about terms |
| **Gatekeeper** | Protective, filters access |

**Why Custom Prospects:** 
- Practice for specific upcoming calls
- Simulate difficult customers
- Industry-specific scenarios
- Personal skill development targets

---

### ElevenLabs Voice Browser

**Location:** Modal triggered from Custom Prospect Creator  
**Trigger:** "Browse Voices" button

#### Features

| Feature | Description |
|---------|-------------|
| **Search** | Find voices by name, accent, keyword |
| **Gender Filter** | Male / Female / All |
| **Accent Filter** | American, British, Australian, Indian, African, European |
| **Category Filter** | Professional, Conversational, Narrative, Characters |
| **Category Tabs** | Featured, Default, Community, Cloned |
| **Voice Cards** | Preview and select voices |
| **Audio Preview** | Play sample of each voice |

#### Voice Card Information

- **Name** - Voice identifier
- **Gender Icon** - Pink (female) / Blue (male)
- **Description** - Character and tone description
- **Labels** - Accent, personality tags
- **Play Button** - Preview audio
- **Selection Indicator** - Checkmark when chosen

#### Voice Categories

| Category | Description | Example Voices |
|----------|-------------|----------------|
| **Featured** | Curated high-quality voices | Rachel, Drew, Emily, Josh |
| **Default** | ElevenLabs premade voices | Aria, Roger, Sarah, Charlie |
| **Community** | 5,000+ shared voices | Priya, Kwame, Sofia, Marcus |
| **Cloned** | User's own cloned voices | (User-created) |

**Why Voice Selection Matters:** Voice significantly impacts practice realism. A skeptical executive sounds different than a friendly startup founder. Matching voice to persona increases immersion.

---

## User Flow

### Primary User Journey

```
┌─────────────┐
│  Sign Up    │
│  (Clerk)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │ ◄─────────────────────────────────┐
│  (Home)     │                                   │
└──────┬──────┘                                   │
       │                                          │
       ▼                                          │
┌─────────────┐                                   │
│  Practice   │                                   │
│  Setup      │                                   │
└──────┬──────┘                                   │
       │ Select mode + prospect                   │
       ▼                                          │
┌─────────────┐                                   │
│    Call     │                                   │
│  Interface  │                                   │
└──────┬──────┘                                   │
       │ End call                                 │
       ▼                                          │
┌─────────────┐     ┌─────────────┐              │
│   Debrief   │────►│  Coach Sparrow   │              │
│             │     │    Chat     │              │
└──────┬──────┘     └─────────────┘              │
       │                                          │
       ├──────────► Practice Again ───────────────┘
       │
       ▼
┌─────────────┐
│   History   │
│  Progress   │
└─────────────┘
```

### Secondary Flows

**Create Custom Prospect:**
```
AI Prospects → Create Prospect → Fill Form → Browse Voices → Select Voice → Create → Custom Prospects Tab
```

**Review Past Performance:**
```
Dashboard → Call History → Select Call → Debrief → Coach Sparrow
```

**Track Progress:**
```
Dashboard → Progress → View Trends → Identify Weak Areas → Practice (targeting weakness)
```

---

## Design System

### Typography

| Element | Size | Weight |
|---------|------|--------|
| **Page Title** | 24px (text-2xl) | Semibold |
| **Section Header** | 18px (text-lg) | Semibold |
| **Body** | 14px (text-sm) | Normal |
| **Caption** | 12px (text-xs) | Normal/Medium |

### Component Patterns

| Pattern | Usage |
|---------|-------|
| **Cards with Borders** | All containers use `border border-gray-200` |
| **No Shadows** | Clean, flat design throughout |
| **Progress Bars** | 6px height, rounded, gray background |
| **Badges** | Rounded, color-coded by type |
| **Avatars** | Initials in colored circles |

### Icon Library

**Phosphor Icons** - Used throughout for consistent style

Common icons:
- `ph-phone-call` - Practice/calls
- `ph-chart-line-up` - Progress
- `ph-robot` - Coach Sparrow
- `ph-brain` - Gemini AI
- `ph-lightning` - Groq (speed)
- `ph-activity` - Datadog monitoring

---

## Summary

Sparrow AI's dashboard is designed to create a complete sales training loop:

1. **Motivate** - Dashboard gamification (streaks, scores, progress)
2. **Practice** - Realistic voice conversations with AI
3. **Analyze** - Detailed, timestamped feedback
4. **Learn** - Coach Sparrow for deeper understanding
5. **Track** - Progress visualization over time
6. **Customize** - Prospect creator for specific needs

Every integration serves the core mission:
- **ElevenLabs** makes conversations realistic
- **Datadog** ensures reliability and observability
- **Gemini** provides intelligent analysis
- **Groq** enables real-time feedback
- **Supabase** stores and streams data
- **Clerk** secures user access

The result is a production-ready platform that demonstrates both technical excellence (for hackathon judging) and genuine user value (for real-world adoption).

---

*Documentation version 1.0 - December 2024*  
*Sparrow AI - AI Partner Catalyst Hackathon Submission*
