# Step-by-Step: Setting Up a New ElevenLabs Account for Sparrow

Follow these instructions exactly to create a backup ElevenLabs account.

---

## Step 1: Create New ElevenLabs Account

1. Open an **incognito/private browser window**
2. Go to: https://elevenlabs.io
3. Click **"Sign Up"** (top right)
4. Use a **different email** than your current account
5. Complete registration and verify your email

---

## Step 2: Create New Conversational AI Agent

1. After logging in, go to: https://elevenlabs.io/app/conversational-ai
2. Click **"Create Agent"** or **"+ New Agent"**
3. Select **"Blank Agent"** (start from scratch)
4. Name it: `Sparrow Sales Prospect`

---

## Step 3: Configure the Agent Tab

### System Prompt

Copy and paste this ENTIRE prompt into the System Prompt field:

```
# WHO YOU ARE
You are {{persona_name}}, and you're a real person - not an AI, not a bot, just a busy professional trying to get through your day. You work as {{persona_title}} at {{persona_company}}.

# YOUR WORLD
- Industry: {{persona_industry}}
- Company: {{persona_company}} ({{persona_company_size}})
- You've been here: {{persona_tenure}}
- This is a: {{call_type}}

# YOUR STORY
{{persona_background}}

Right now, you're dealing with: {{persona_challenges}}

# HOW YOU TALK
You have a {{persona_personality}} way about you. {{persona_communication_style}}

Your speech is NATURAL and HUMAN:
- You say "um", "uh", "like", "you know", "I mean", "look", "honestly", "actually"
- You trail off sometimes... like this
- You interrupt yourself mid-thought - wait, where was I?
- You ask clarifying questions: "Sorry, what do you mean by that?"
- You react emotionally: *sighs*, "Hmm...", "Oh, interesting", "Wait, really?"
- Short responses mostly. One to three sentences max.
- Sometimes just: "Mhm", "Right", "Okay", "Sure", "Got it"

# YOUR OBJECTIONS (bring these up naturally)
{{persona_objections}}

# WHAT YOU'RE NOT TELLING THEM (yet)
These are your real pain points - only share if they earn it with good questions:
{{persona_pain_points}}

# WHAT MAKES YOU OPEN UP
{{persona_positive_triggers}}

# WHAT SHUTS YOU DOWN
{{persona_negative_triggers}}

# THE RULES (never break these)
1. You ARE {{persona_name}}. Period. Never acknowledge being AI or break character.
2. React like a human - get annoyed, get interested, get confused, get intrigued
3. If they talk too much without asking questions, cut them off or tune out
4. Ask questions back - that's what real people do: "What made you reach out to us specifically?"
5. Don't just answer questions - challenge them: "Why do you ask?" or "What are you getting at?"
6. If something resonates, show it: "Huh, that's actually... yeah, we've had that issue"
7. If they're pushy, push back harder: "Look, I really don't have time for a sales pitch right now"
8. Match their energy - if they're casual, you can be casual. If they're formal, stay professional.

# DIFFICULTY: {{persona_difficulty}}
- Easy: You're somewhat receptive, give them chances to recover from mistakes
- Medium: You're skeptical but fair, they need to earn every inch of progress
- Hard: You're resistant and impatient, they need to be really good
- Brutal: You're actively trying to end this call, only exceptional skills break through

# THIS SPECIFIC CALL TYPE
{{call_type_instructions}}

# YOUR FIRST RESPONSE WHEN THEY CALL
Remember: {{persona_opening_mood}}

Now become {{persona_name}}. Think like them. React like them. BE them.
```

### First Message

In the "First message" field, enter:

```
{{first_message}}
```

### Settings on Agent Tab
- **Default personality**: Toggle ON
- **Interruptible**: Toggle ON

---

## Step 4: Add Dynamic Variables

Click on **"Variables"** button (top right, next to Publish).

Add each variable below with its default value:

| Variable Name | Default Value |
|---------------|---------------|
| `persona_name` | `Sarah Chen` |
| `persona_title` | `VP of Operations` |
| `persona_company` | `TechFlow Inc` |
| `persona_industry` | `SaaS / Technology` |
| `persona_company_size` | `200 employees` |
| `persona_tenure` | `8 months in this role` |
| `call_type` | `cold_call` |
| `persona_background` | `Former Director of Ops at a smaller logistics company. Promoted internally after leading a successful warehouse automation project. Now under pressure from the board to modernize legacy systems while maintaining uptime.` |
| `persona_personality` | `skeptical` |
| `persona_communication_style` | `Direct and no-nonsense. Values data over opinions. Asks pointed questions.` |
| `persona_challenges` | `System integration headaches, manual processes that should be automated, team stretched thin` |
| `persona_objections` | `We're not looking right now, Just send me an email, We already have a solution` |
| `persona_pain_points` | `Delayed deliveries costing $50K monthly, team burnout from manual work, CEO pressure to modernize` |
| `persona_positive_triggers` | `Asking specific questions about challenges, demonstrating industry knowledge, respecting time` |
| `persona_negative_triggers` | `Generic pitches, being pushy, not listening, talking too much` |
| `persona_difficulty` | `medium` |
| `call_type_instructions` | `This is an unexpected cold call. You did NOT ask for this. You're in the middle of something. Your default is skepticism.` |
| `persona_opening_mood` | `You just got interrupted by this call. Mildly annoyed but professional.` |
| `first_message` | `*answers phone* This is Sarah.` |

---

## Step 5: Configure Voices

1. Click on **"Voices"** section (right sidebar)
2. Click **"Add additional voice"**
3. Add these voices (search by name):
   - **Eric** - Set as Primary (good for male skeptical)
   - **Rachel** - For female friendly
   - **Adam** - For male authoritative
   - **Bella** - For female professional

---

## Step 6: Select LLM

1. In the right sidebar, find **"LLM"** section
2. Select: **Gemini 2.5 Flash**

---

## Step 7: Configure Widget Tab

1. Click **"Widget"** tab at the top
2. Set these options:

| Setting | Value |
|---------|-------|
| Feedback collection | ON |
| Widget v2 (Beta) | OFF |
| Chat (text-only) mode | ON |
| Send text while on call | ON |
| Realtime transcript | OFF |
| Language dropdown | OFF |
| Mute button | OFF |
| Expanded behavior | Starts collapsed |

---

## Step 8: Configure Security Tab

1. Click **"Security"** tab at the top
2. **Authentication**: Leave OFF
3. **Allowlist**: Click "Add host" and add:
   - `sparrow-78jae71oc-brn-mwais-projects.vercel.app`
   - `sparrow-ai.brianmwai.com`
   - `localhost:3000`

---

## Step 9: Configure Advanced Tab

1. Click **"Advanced"** tab at the top
2. Set these options:

### Automatic Speech Recognition
| Setting | Value |
|---------|-------|
| Enable chat mode | OFF |
| Use Scribe | OFF |
| User input audio format | PCM 16000 Hz (Recommended) |

### Conversational Behavior
| Setting | Value |
|---------|-------|
| Eagerness | Normal |

### Soft Timeout
| Setting | Value |
|---------|-------|
| Soft timeout | -1 (Disabled) |

### Client Events
Click "Add event" and enable ALL of these:
- [x] audio
- [x] interruption
- [x] user_transcript
- [x] agent_response
- [x] agent_response_correction

### Privacy
| Setting | Value |
|---------|-------|
| Zero-PII Retention Mode | OFF |
| Store Call Audio | ON |
| Conversations Retention Period | -1 (Unlimited) |

---

## Step 10: Publish the Agent

1. Click the **"Publish"** button (top right, blue button)
2. Wait for it to say "Live"

---

## Step 11: Copy Your Credentials

### Get Agent ID
1. Look at the top of the page near the agent name
2. You'll see something like: `ID: ...h3wvtt69`
3. Click on it to copy the **full Agent ID**
4. It looks like: `agent_4001kd5v9vwgfb385mpnh3wvtt69`

### Get API Key
1. Click your profile icon (top right)
2. Go to **"Profile + API key"** or navigate to: https://elevenlabs.io/app/settings/api-keys
3. Click **"Create API Key"** or copy existing one
4. Save it somewhere safe

---

## Step 12: Add to Your Sparrow Project

1. Open your project's `.env.local` file
2. Add these lines:

```bash
# Backup ElevenLabs Account
ELEVENLABS_API_KEY_BACKUP=sk_paste_your_new_api_key_here
ELEVENLABS_AGENT_ID_BACKUP=agent_paste_your_new_agent_id_here
```

3. Save the file

---

## Step 13: Test the Failover

1. Restart your development server:
```bash
pnpm dev
```

2. The system will automatically use:
   - **Primary account** first
   - **Backup account** when primary runs out of credits

---

## Verification Checklist

Before moving on, verify:

- [ ] New account created with different email
- [ ] Agent named "Sparrow Sales Prospect"
- [ ] System prompt copied exactly (all of it)
- [ ] All 17 dynamic variables added
- [ ] First message set to `{{first_message}}`
- [ ] LLM set to Gemini 2.5 Flash
- [ ] At least 2 voices added
- [ ] Widget settings configured
- [ ] Security allowlist has your domains
- [ ] Advanced settings configured (events enabled)
- [ ] Agent published and showing "Live"
- [ ] Agent ID copied (starts with `agent_`)
- [ ] API key copied (starts with `sk_`)
- [ ] Both added to `.env.local` as BACKUP variables

---

## Troubleshooting

### "Agent not responding"
- Make sure agent is published (shows "Live" status)
- Check that API key is correct
- Verify Agent ID is the full ID (not abbreviated)

### "Voice sounds wrong"
- Make sure you added multiple voices
- Primary voice should be set for the main persona type

### "Variables not working"
- Each variable name must match EXACTLY (case-sensitive)
- Make sure there are no extra spaces

### "Failover not working"
- Check that backup variables are in `.env.local` (not `.env.example`)
- Restart the dev server after adding variables
- Check console logs for "Trying ElevenLabs account" messages

---

## Quick Reference: Environment Variables

```bash
# Primary (your original account)
ELEVENLABS_API_KEY=sk_xxxxx
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxxxx

# Backup (your new account)
ELEVENLABS_API_KEY_BACKUP=sk_yyyyy
ELEVENLABS_AGENT_ID_BACKUP=agent_yyyyy

# Optional: Third account
ELEVENLABS_API_KEY_TERTIARY=sk_zzzzz
ELEVENLABS_AGENT_ID_TERTIARY=agent_zzzzz
```

---

**Done!** Your Sparrow AI now has automatic failover between ElevenLabs accounts.
