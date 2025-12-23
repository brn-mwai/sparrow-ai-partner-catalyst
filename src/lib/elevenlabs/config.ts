// ============================================
// SPARROW AI - ElevenLabs Configuration
// Voice AI for Conversational Agents
// ============================================

// Voice IDs for different persona personalities
export const ELEVENLABS_VOICES = {
  // Professional voices
  SARAH_CHEN: {
    id: process.env.ELEVENLABS_VOICE_SARAH_CHEN || '21m00Tcm4TlvDq8ikWAM',
    name: 'Sarah Chen',
    description: 'Professional female voice, clear and authoritative',
    personality: 'professional',
    gender: 'female',
  },
  MARCUS_JOHNSON: {
    id: process.env.ELEVENLABS_VOICE_MARCUS_JOHNSON || 'ErXwobaYiN019PkySvjV',
    name: 'Marcus Johnson',
    description: 'Deep male voice, confident and measured',
    personality: 'skeptical',
    gender: 'male',
  },
  JENNIFER_WALSH: {
    id: process.env.ELEVENLABS_VOICE_JENNIFER_WALSH || 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Jennifer Walsh',
    description: 'Warm female voice, friendly but professional',
    personality: 'friendly',
    gender: 'female',
  },
  DAVID_PARK: {
    id: process.env.ELEVENLABS_VOICE_DAVID_PARK || 'TxGEqnHWrfWFTfGW9XjX',
    name: 'David Park',
    description: 'Technical male voice, precise and analytical',
    personality: 'technical',
    gender: 'male',
  },
  RACHEL_TORRES: {
    id: process.env.ELEVENLABS_VOICE_RACHEL_TORRES || 'pNInz6obpgDQGcFmaJgB',
    name: 'Rachel Torres',
    description: 'Busy executive female voice, brisk and impatient',
    personality: 'busy',
    gender: 'female',
  },
  CHRIS_MARTINEZ: {
    id: process.env.ELEVENLABS_VOICE_CHRIS_MARTINEZ || 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Chris Martinez',
    description: 'Skeptical male voice, challenging and direct',
    personality: 'skeptical',
    gender: 'male',
  },
} as const;

export type VoiceId = keyof typeof ELEVENLABS_VOICES;
export type VoiceConfig = typeof ELEVENLABS_VOICES[VoiceId];

// Agent configuration defaults
export const AGENT_CONFIG = {
  // Conversation settings
  conversation: {
    // Maximum conversation duration in seconds (5 minutes)
    maxDuration: 300,
    // Silence threshold before ending (seconds)
    silenceTimeout: 10,
    // Time to wait before agent responds (ms)
    turnEndSilenceMs: 800,
    // Allow user to interrupt agent
    interruptible: true,
    // Interruption sensitivity (0-1)
    interruptionThreshold: 0.5,
  },
  // Voice settings
  voice: {
    // Voice stability (0-1, higher = more consistent)
    stability: 0.7,
    // Similarity boost (0-1, higher = more similar to original)
    similarityBoost: 0.8,
    // Speaking rate (0.5-2.0)
    speakingRate: 1.0,
  },
  // Transcription settings
  transcription: {
    // Language for speech recognition
    language: 'en',
    // Whether to enable profanity filter
    profanityFilter: false,
  },
};

// Voice selection based on personality
export function getVoiceForPersonality(
  personality: 'skeptical' | 'busy' | 'friendly' | 'technical',
  preferredGender?: 'male' | 'female'
): VoiceConfig {
  const voices = Object.values(ELEVENLABS_VOICES);

  // Find matching personality and gender
  const matches = voices.filter((v) => {
    const personalityMatch = v.personality === personality;
    const genderMatch = !preferredGender || v.gender === preferredGender;
    return personalityMatch && genderMatch;
  });

  if (matches.length > 0) {
    // Return random match for variety
    return matches[Math.floor(Math.random() * matches.length)];
  }

  // Fallback: match personality only
  const personalityMatch = voices.find((v) => v.personality === personality);
  if (personalityMatch) {
    return personalityMatch;
  }

  // Default fallback
  return ELEVENLABS_VOICES.SARAH_CHEN;
}

// Get voice by ID
export function getVoiceById(voiceId: string): VoiceConfig | undefined {
  return Object.values(ELEVENLABS_VOICES).find((v) => v.id === voiceId);
}
