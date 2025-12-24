# Sparrow AI - Project Story

## What Inspired This

I watched a sales rep bomb a call with a prospect they'd been chasing for months. The prospect said "we're not looking right now," and the rep froze. No reframe, no follow-up question, just silence. The deal died.

The frustrating part? This was a fixable problem. The rep knew the theory. They'd read the books, watched the videos, sat through the trainings. But when it mattered, they couldn't execute.

That's when it clicked: you can't get good at sales by reading about it. You get good by doing it. But every "practice" opportunity is a real deal on the line.

Sales managers don't have time to roleplay. When they do, it's awkward and inconsistent. Reps end up practicing on actual prospects, which means lost revenue and burned leads.

I wanted to build something that lets salespeople practice as much as they want, with realistic pushback, and get honest feedback, without risking a single deal.

## How I Built It

The core idea is simple: create AI prospects that act like real buyers.

**Voice is everything.** Text-based roleplay doesn't cut it. Sales is a verbal skill. You need to hear tone, manage pace, and think on your feet. That's why ElevenLabs Conversational AI is the backbone of Sparrow. It handles real-time speech-to-speech, so users actually talk to the AI prospect like they would on a real call.

**The AI needs personality.** A generic chatbot won't push back like a skeptical VP or a busy CFO. I use Gemini to generate detailed personas with backstories, hidden pain points, specific objections, and triggers that make them warm up or shut down. Each prospect feels different.

**Feedback has to be specific.** "Good job" doesn't help anyone improve. After each call, Groq analyzes the transcript and scores the rep on opening, discovery, objection handling, call control, and closing. It flags specific moments: "At 1:12, she mentioned delivery delays but you didn't dig in. Try asking about the cost impact."

**The tech stack:**
- Next.js 15 with React 19 for the frontend
- ElevenLabs Conversational AI for real-time voice
- Gemini 2.0 Flash for persona generation and deep analysis
- Groq for fast scoring (responses in under 2 seconds)
- Supabase for database and real-time transcript streaming
- Clerk for authentication
- Deployed on Vercel

## Challenges I Faced

**Getting the voice right.** Early versions used a single voice for all prospects. It felt robotic. A friendly marketing director shouldn't sound like a skeptical CTO. I implemented dynamic voice selection based on persona gender and personality. Female friendly prospects get a warm voice. Male technical prospects get a more measured one. Small detail, big difference.

**Latency matters more than I expected.** In a real conversation, pauses feel natural. With AI, even a 500ms delay breaks immersion. The user starts wondering if something's broken. I spent a lot of time optimizing the pipeline: Groq for quick scoring, streaming responses where possible, and keeping the ElevenLabs connection warm.

**Persona consistency.** The AI prospect needs to stay in character for the entire call. If you're talking to a skeptical VP, they shouldn't suddenly become agreeable just because the user said something nice. I built detailed system prompts with personality anchors and objection patterns that keep the AI on track.

**Transcript accuracy.** The scoring is only as good as the transcript. Background noise, crosstalk, and mumbling all cause issues. I added logic to clean up transcripts and strip metadata tags before analysis.

**Rate limits.** During development, I hit Gemini's free tier limits constantly. I built a fallback system: try Gemini first, fall back to Groq if it fails. The app stays functional even when one provider is unavailable.

## What I Learned

**Voice AI changes how people interact.** Users engage differently when they're speaking versus typing. They're more natural, more honest, and more likely to make the same mistakes they'd make on a real call. That's exactly what you want for training.

**Feedback timing matters.** Showing scores immediately after a call keeps users engaged. If they have to wait, they lose interest. The quick score from Groq (overall rating in 2 seconds) holds attention while the deeper analysis runs.

**Simplicity wins.** Early designs had too many options. Users got overwhelmed before they even started a call. I stripped it down: pick a mode, configure a prospect, practice. Three steps.

**Sales reps are competitive.** The streak counter and score history weren't in the original plan. Users asked for them. They want to see improvement over time and beat their previous scores.

## What's Next

The core flow works. Users can practice cold calls, discovery, and objection handling with realistic AI prospects and get actionable feedback.

Next priorities:
- Team features so managers can assign practice scenarios
- Custom objection libraries based on what reps actually hear
- Integration with CRM to practice on upcoming real prospects
- Mobile app for practice during commutes

The goal hasn't changed: make it so no salesperson ever has to wing a call again.
