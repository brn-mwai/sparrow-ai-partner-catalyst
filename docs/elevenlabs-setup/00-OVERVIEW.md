# ElevenLabs Agent Setup - Overview

Complete guide to setting up a new ElevenLabs account for Sparrow AI.

---

## Files in This Folder

| File | Description |
|------|-------------|
| `01-SYSTEM-PROMPT.md` | The AI persona system prompt |
| `02-DYNAMIC-VARIABLES.md` | All 19 dynamic variables to add |
| `03-FIRST-MESSAGE.md` | First message configuration |
| `04-VOICE-SETTINGS.md` | Voice and LLM settings |
| `05-WIDGET-SETTINGS.md` | Widget interface options |
| `06-SECURITY-SETTINGS.md` | Security and allowlist |
| `07-ADVANCED-SETTINGS.md` | Advanced options and events |
| `08-PUBLISH-AND-COPY.md` | Publish agent and get credentials |
| `09-ADD-TO-PROJECT.md` | Add credentials to Sparrow |

---

## Quick Start Steps

### Part 1: Create Account
1. Go to https://elevenlabs.io in incognito browser
2. Sign up with a new email
3. Verify your email

### Part 2: Create Agent
4. Go to https://elevenlabs.io/app/conversational-ai
5. Click "Create Agent" → "Blank Agent"
6. Name it: `Sparrow Sales Prospect`

### Part 3: Configure Agent (follow files in order)
7. → `01-SYSTEM-PROMPT.md` - Copy the system prompt
8. → `02-DYNAMIC-VARIABLES.md` - Add all 19 variables
9. → `03-FIRST-MESSAGE.md` - Set first message
10. → `04-VOICE-SETTINGS.md` - Configure voices & LLM
11. → `05-WIDGET-SETTINGS.md` - Widget options
12. → `06-SECURITY-SETTINGS.md` - Allowlist domains
13. → `07-ADVANCED-SETTINGS.md` - Events & privacy

### Part 4: Finish
14. → `08-PUBLISH-AND-COPY.md` - Publish and get credentials
15. → `09-ADD-TO-PROJECT.md` - Add to your project

---

## Time Estimate

| Part | Time |
|------|------|
| Create Account | 2 min |
| System Prompt | 2 min |
| Variables | 5 min |
| Other Settings | 5 min |
| Publish & Add | 2 min |
| **Total** | **~15 min** |

---

## What You'll Need

- [ ] New email address (different from current ElevenLabs account)
- [ ] Access to your Sparrow project `.env.local` file
- [ ] Terminal to restart dev server

---

## After Completion

Your Sparrow AI will automatically:
1. Try primary account first
2. Switch to backup if primary runs out of credits
3. Continue working without interruption

---

Start with: **`01-SYSTEM-PROMPT.md`**
