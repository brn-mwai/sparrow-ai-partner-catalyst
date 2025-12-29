// ============================================
// SPARROW AI - ElevenLabs Configuration
// Voice AI for Conversational Agents
// Multi-Account Failover Support
// ============================================

// -------------------- Multi-Account Configuration --------------------

export interface ElevenLabsAccount {
  name: string;
  apiKey: string;
  agentId: string;
  priority: number;
  isActive: boolean;
  lastError?: string;
  lastErrorTime?: number;
  errorCount: number;
}

// Account status tracking (in-memory for this session)
const accountStatus: Map<string, { errorCount: number; lastErrorTime: number }> = new Map();

// Error cooldown period (5 minutes)
const ERROR_COOLDOWN_MS = 5 * 60 * 1000;
// Max errors before account is temporarily disabled
const MAX_ERROR_COUNT = 3;

/**
 * Get all configured ElevenLabs accounts
 * Supports multiple accounts for failover when credits run out
 *
 * NOTE: Backup account is now PRIMARY (priority 1) to use new credits
 */
export function getElevenLabsAccounts(): ElevenLabsAccount[] {
  const accounts: ElevenLabsAccount[] = [];

  // NEW ACCOUNT (was backup, now primary) - USE THIS FIRST
  if (process.env.ELEVENLABS_API_KEY_BACKUP && process.env.ELEVENLABS_AGENT_ID_BACKUP) {
    accounts.push({
      name: 'backup',
      apiKey: process.env.ELEVENLABS_API_KEY_BACKUP,
      agentId: process.env.ELEVENLABS_AGENT_ID_BACKUP,
      priority: 1, // Now priority 1 (primary)
      isActive: true,
      errorCount: accountStatus.get('backup')?.errorCount || 0,
    });
  }

  // OLD ACCOUNT (was primary, now fallback) - only if new runs out
  if (process.env.ELEVENLABS_API_KEY && process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
    accounts.push({
      name: 'primary',
      apiKey: process.env.ELEVENLABS_API_KEY,
      agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
      priority: 2, // Now priority 2 (fallback)
      isActive: false, // Disabled - old account has no credits
      errorCount: accountStatus.get('primary')?.errorCount || 0,
    });
  }

  // Tertiary account (optional)
  if (process.env.ELEVENLABS_API_KEY_TERTIARY && process.env.ELEVENLABS_AGENT_ID_TERTIARY) {
    accounts.push({
      name: 'tertiary',
      apiKey: process.env.ELEVENLABS_API_KEY_TERTIARY,
      agentId: process.env.ELEVENLABS_AGENT_ID_TERTIARY,
      priority: 3,
      isActive: true,
      errorCount: accountStatus.get('tertiary')?.errorCount || 0,
    });
  }

  return accounts;
}

/**
 * Get the best available account based on priority and error status
 */
export function getActiveAccount(): ElevenLabsAccount | null {
  const accounts = getElevenLabsAccounts();
  const now = Date.now();

  // Filter to accounts that are active and not in cooldown
  const availableAccounts = accounts.filter((acc) => {
    if (!acc.isActive || !acc.apiKey || !acc.agentId) return false;

    const status = accountStatus.get(acc.name);
    if (status) {
      // Reset error count if cooldown has passed
      if (now - status.lastErrorTime > ERROR_COOLDOWN_MS) {
        accountStatus.set(acc.name, { errorCount: 0, lastErrorTime: 0 });
        return true;
      }
      // Skip if too many errors
      if (status.errorCount >= MAX_ERROR_COUNT) {
        console.log(`Account ${acc.name} in cooldown (${status.errorCount} errors)`);
        return false;
      }
    }
    return true;
  });

  // Sort by priority
  availableAccounts.sort((a, b) => a.priority - b.priority);

  if (availableAccounts.length === 0) {
    console.error('No available ElevenLabs accounts!');
    return null;
  }

  return availableAccounts[0];
}

/**
 * Mark an account as having an error (for credit exhaustion, rate limits, etc.)
 */
export function markAccountError(accountName: string, error: string): void {
  const current = accountStatus.get(accountName) || { errorCount: 0, lastErrorTime: 0 };
  accountStatus.set(accountName, {
    errorCount: current.errorCount + 1,
    lastErrorTime: Date.now(),
  });
  console.warn(`ElevenLabs account ${accountName} error (${current.errorCount + 1}): ${error}`);
}

/**
 * Reset error status for an account (call on successful request)
 */
export function resetAccountStatus(accountName: string): void {
  accountStatus.set(accountName, { errorCount: 0, lastErrorTime: 0 });
}

/**
 * Get account status summary
 */
export function getAccountStatusSummary(): Record<string, { available: boolean; errorCount: number }> {
  const accounts = getElevenLabsAccounts();
  const summary: Record<string, { available: boolean; errorCount: number }> = {};

  for (const acc of accounts) {
    const status = accountStatus.get(acc.name);
    const now = Date.now();
    let available = true;

    if (status) {
      if (now - status.lastErrorTime > ERROR_COOLDOWN_MS) {
        available = true;
      } else if (status.errorCount >= MAX_ERROR_COUNT) {
        available = false;
      }
    }

    summary[acc.name] = {
      available,
      errorCount: status?.errorCount || 0,
    };
  }

  return summary;
}

// -------------------- Voice Configuration --------------------

// Voice IDs from NEW ElevenLabs Account (backup account)
export const ELEVENLABS_VOICES = {
  // ==================== MALE VOICES ====================
  ERIC: {
    id: 'cjVigY5qzO86Huf0OWal', // ElevenLabs library voice (universal)
    name: 'Eric',
    description: 'Smooth, trustworthy male voice',
    personality: 'skeptical',
    gender: 'male',
  },
  STOKES: {
    id: 'kHhWB9Fw3aF6ly7JvltC',
    name: 'Stokes',
    description: 'Professional male voice',
    personality: 'professional',
    gender: 'male',
  },

  // ==================== FEMALE VOICES ====================
  JESSICA: {
    id: 'g6xIsTj2HwM6VR4iXFCw',
    name: 'Jessica',
    description: 'Professional female voice',
    personality: 'professional',
    gender: 'female',
  },
  HOPE: {
    id: 'OYTbf65OHHFELVut7v2H',
    name: 'Hope',
    description: 'Warm friendly female voice',
    personality: 'friendly',
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
  return ELEVENLABS_VOICES.ERIC;
}
