// ============================================
// SPARROW AI - ElevenLabs Configuration
// Voice AI for Conversational Agents
// ============================================

// Voice IDs from ElevenLabs Dashboard - Your Custom Voices
export const ELEVENLABS_VOICES = {
  // ==================== MALE VOICES ====================
  JAMES: {
    id: 'qxTFXDYbGcR8GaHSjczg',
    name: 'James',
    description: 'Professional male voice',
    personality: 'professional',
    gender: 'male',
  },
  ERIC: {
    id: 'cjVigY5qzO86Huf0OWal',
    name: 'Eric',
    description: 'Smooth, trustworthy male voice',
    personality: 'skeptical',
    gender: 'male',
  },

  // ==================== FEMALE VOICES ====================
  HELEN: {
    id: 'ImnfuV8oxhB7ya99oJfc',
    name: 'Helen',
    description: 'Professional female voice',
    personality: 'professional',
    gender: 'female',
  },
  CINNAMON: {
    id: 'kNie5n4lYl7TrvqBZ4iG',
    name: 'Cinnamon',
    description: 'Warm friendly female voice',
    personality: 'friendly',
    gender: 'female',
  },
  EMMA: {
    id: '56bWURjYFHyYyVf490Dp',
    name: 'Emma',
    description: 'Direct female voice',
    personality: 'busy',
    gender: 'female',
  },
  MS_WALKER: {
    id: 'DLsHlh26Ugcm6ELvS0qi',
    name: 'Ms. Walker',
    description: 'Authoritative female voice',
    personality: 'skeptical',
    gender: 'female',
  },
} as const;

export type VoiceId = keyof typeof ELEVENLABS_VOICES;
export type VoiceConfig = (typeof ELEVENLABS_VOICES)[VoiceId];

// Agent configuration
export const AGENT_CONFIG = {
  conversation: {
    maxDuration: 300,
    silenceTimeout: 10,
    turnEndSilenceMs: 500,
    interruptible: true,
  },
  voice: {
    stability: 0.65,
    similarityBoost: 0.75,
    modelId: 'eleven_turbo_v2_5',
  },
};

// Voice selection based on persona
export function getVoiceForPersona(persona: {
  personality?: string;
  gender?: string;
  name?: string;
}): VoiceConfig {
  const voices = Object.values(ELEVENLABS_VOICES);
  const femaleNames = ['sarah', 'jennifer', 'rachel', 'lisa', 'emily', 'maria', 'jessica', 'amanda', 'nicole', 'michelle', 'linda', 'karen', 'nancy', 'sandra', 'ashley', 'katherine', 'christine', 'stephanie', 'janet', 'catherine', 'frances', 'joyce', 'diane', 'alice', 'julie', 'heather', 'teresa', 'gloria', 'evelyn', 'jean', 'cheryl', 'joan', 'judith', 'rose', 'janice', 'kelly', 'judy', 'christina', 'kathy', 'theresa', 'beverly', 'denise', 'tammy', 'jane', 'lori', 'marilyn', 'andrea', 'kathryn', 'sara', 'anne', 'jacqueline', 'julia', 'paula', 'diana', 'lillian', 'robin', 'peggy', 'rita', 'dawn', 'tracy', 'tiffany', 'carmen', 'rosa', 'cindy', 'grace', 'wendy', 'victoria', 'kim', 'sherry', 'sylvia'];
  
  const firstName = persona.name?.split(' ')[0]?.toLowerCase() || '';
  const gender = persona.gender?.toLowerCase() || (femaleNames.includes(firstName) ? 'female' : 'male');
  
  const personalityMap: Record<string, string> = {
    skeptical: 'skeptical', busy: 'busy', friendly: 'friendly', technical: 'technical',
    professional: 'professional', impatient: 'busy', analytical: 'technical',
    warm: 'friendly', cold: 'skeptical', direct: 'skeptical',
  };
  
  const mappedPersonality = personalityMap[persona.personality?.toLowerCase() || ''] || 'professional';
  
  let matches = voices.filter((v) => v.gender === gender && v.personality === mappedPersonality);
  if (matches.length === 0) matches = voices.filter((v) => v.gender === gender);
  if (matches.length === 0) matches = voices;
  
  return matches[Math.floor(Math.random() * matches.length)];
}

export function getVoiceForPersonality(
  personality: 'skeptical' | 'busy' | 'friendly' | 'technical',
  preferredGender?: 'male' | 'female'
): VoiceConfig {
  return getVoiceForPersona({ personality, gender: preferredGender });
}

export function getVoiceById(voiceId: string): VoiceConfig | undefined {
  return Object.values(ELEVENLABS_VOICES).find((v) => v.id === voiceId);
}

export function getDefaultVoice(): VoiceConfig {
  return ELEVENLABS_VOICES.JAMES;
}
