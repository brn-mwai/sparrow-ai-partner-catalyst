// ============================================
// SPARROW AI - ElevenLabs Client
// Conversational AI Voice Agent
// ============================================

import {
  ELEVENLABS_VOICES,
  AGENT_CONFIG,
  getVoiceForPersona,
  getActiveAccount,
  getElevenLabsAccounts,
  markAccountError,
  resetAccountStatus,
  getAccountStatusSummary,
  type VoiceConfig,
  type ElevenLabsAccount,
} from './config';
import {
  ELEVENLABS_AGENT_SYSTEM,
  getOpeningForCallType,
} from '../gemini/prompts';

// -------------------- Types --------------------

export class ElevenLabsError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'ElevenLabsError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface PersonaForAgent {
  name: string;
  gender?: 'male' | 'female';
  title: string;
  company: string;
  background: string;
  personality: 'skeptical' | 'busy' | 'friendly' | 'technical';
  current_challenges: string[];
  hidden_pain_points: string[];
  objections: string[];
  triggers: {
    positive: string[];
    negative: string[];
  };
  communication_style: string;
  opening_mood: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'brutal';
  first_response?: string;
  voice_description?: string;
}

export interface ConversationConfig {
  agentId?: string;
  persona: PersonaForAgent;
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet';
  voiceId?: string;
  maxDuration?: number;
}

export interface ConversationSession {
  conversationId: string;
  signedUrl: string;
  agentId: string;
  voiceId: string;
  persona: PersonaForAgent;
  callType: string;
}

export interface TranscriptMessage {
  speaker: 'user' | 'agent';
  content: string;
  timestamp: number;
  isFinal: boolean;
}

// -------------------- API Base URL --------------------

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// -------------------- Helper Functions --------------------

/**
 * Get API key with failover support
 * Will automatically try backup accounts if primary fails
 */
function getApiKey(accountName?: string): string {
  if (accountName) {
    const accounts = getElevenLabsAccounts();
    const account = accounts.find((a) => a.name === accountName);
    if (account?.apiKey) return account.apiKey;
  }

  const account = getActiveAccount();
  if (!account) {
    throw new ElevenLabsError(
      'No ElevenLabs accounts available. All accounts may be exhausted or in cooldown.',
      'NO_ACCOUNTS_AVAILABLE'
    );
  }
  return account.apiKey;
}

/**
 * Get Agent ID with failover support
 */
function getAgentId(accountName?: string): string {
  if (accountName) {
    const accounts = getElevenLabsAccounts();
    const account = accounts.find((a) => a.name === accountName);
    if (account?.agentId) return account.agentId;
  }

  const account = getActiveAccount();
  if (!account) {
    throw new ElevenLabsError(
      'No ElevenLabs accounts available. All accounts may be exhausted or in cooldown.',
      'NO_ACCOUNTS_AVAILABLE'
    );
  }
  return account.agentId;
}

/**
 * Get current active account info
 */
export function getCurrentAccount(): ElevenLabsAccount | null {
  return getActiveAccount();
}

/**
 * Get status of all configured accounts
 */
export function getAllAccountsStatus(): Record<string, { available: boolean; errorCount: number }> {
  return getAccountStatusSummary();
}

/**
 * Check if credits/rate limit error and mark account
 */
function handleApiError(error: any, accountName: string): void {
  const errorMessage = error?.message || String(error);
  const statusCode = error?.statusCode;

  // Common credit exhaustion / rate limit error patterns
  const creditExhaustionPatterns = [
    'insufficient_credits',
    'credit',
    'quota',
    'rate_limit',
    'too_many_requests',
    '429',
    '402',
    'payment required',
    'subscription',
  ];

  const isCreditsError = creditExhaustionPatterns.some(
    (pattern) =>
      errorMessage.toLowerCase().includes(pattern) ||
      statusCode === 402 ||
      statusCode === 429
  );

  if (isCreditsError) {
    markAccountError(accountName, errorMessage);
    console.warn(`Account ${accountName} marked for failover: ${errorMessage}`);
  }
}

// -------------------- Conversation Management --------------------

/**
 * Get a signed URL for starting a conversation
 * This is used by the ElevenLabs React SDK
 * Includes automatic failover to backup accounts on credit exhaustion
 */
export async function getSignedUrl(
  config: ConversationConfig
): Promise<ConversationSession & { accountUsed: string }> {
  // Get all available accounts for failover
  const accounts = getElevenLabsAccounts().filter((a) => a.apiKey && a.agentId);

  if (accounts.length === 0) {
    throw new ElevenLabsError(
      'No ElevenLabs accounts configured',
      'CONFIG_ERROR'
    );
  }

  // Select voice based on persona gender and personality
  let voice: VoiceConfig;
  if (config.voiceId) {
    voice = Object.values(ELEVENLABS_VOICES).find((v) => v.id === config.voiceId) ||
      getVoiceForPersona({
        name: config.persona.name,
        gender: config.persona.gender,
        personality: config.persona.personality,
      });
  } else {
    voice = getVoiceForPersona({
      name: config.persona.name,
      gender: config.persona.gender,
      personality: config.persona.personality,
    });
  }

  console.log('Voice selection:', {
    personaName: config.persona.name,
    personaGender: config.persona.gender,
    personality: config.persona.personality,
    selectedVoice: voice.name,
    voiceGender: voice.gender,
  });

  // Build the system prompt for the agent
  const systemPrompt = ELEVENLABS_AGENT_SYSTEM(config.persona, config.callType);
  const firstMessage = getOpeningForCallType(
    {
      ...config.persona,
      first_response: config.persona.first_response,
    },
    config.callType
  );

  // Try each account until one works (failover logic)
  let lastError: Error | null = null;

  for (const account of accounts) {
    // Skip accounts in cooldown
    const activeAccount = getActiveAccount();
    if (activeAccount && activeAccount.name !== account.name) {
      // Check if this account should be skipped
      const status = getAccountStatusSummary()[account.name];
      if (status && !status.available) {
        console.log(`Skipping account ${account.name} (in cooldown)`);
        continue;
      }
    }

    const apiKey = account.apiKey;
    const agentId = config.agentId || account.agentId;

    console.log(`Trying ElevenLabs account: ${account.name} (priority: ${account.priority})`);

    try {
      const response = await fetch(
        `${ELEVENLABS_API_URL}/convai/conversation/get-signed-url?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        const error = new ElevenLabsError(
          `Failed to get signed URL: ${errorText}`,
          'API_ERROR',
          response.status
        );

        // Handle credit/rate limit errors for failover
        handleApiError(error, account.name);
        lastError = error;

        // If it's a credits error, try next account
        if (response.status === 402 || response.status === 429) {
          console.warn(`Account ${account.name} credits issue, trying next...`);
          continue;
        }

        throw error;
      }

      const data = await response.json();

      if (!data.signed_url) {
        throw new ElevenLabsError('No signed URL in response', 'API_ERROR');
      }

      // Success! Reset error status for this account
      resetAccountStatus(account.name);

      console.log('ElevenLabs signed URL response:', {
        hasSignedUrl: !!data.signed_url,
        signedUrlPreview: data.signed_url.substring(0, 100) + '...',
        conversationId: data.conversation_id,
        agentId,
        accountUsed: account.name,
      });

      return {
        conversationId: data.conversation_id || `conv_${Date.now()}`,
        signedUrl: data.signed_url,
        agentId,
        voiceId: voice.id,
        persona: config.persona,
        callType: config.callType,
        accountUsed: account.name,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Handle the error for potential failover
      if (error instanceof ElevenLabsError) {
        handleApiError(error, account.name);
      }

      console.error(`Account ${account.name} failed:`, lastError.message);
      // Continue to next account
    }
  }

  // All accounts failed
  throw new ElevenLabsError(
    `All ElevenLabs accounts exhausted. Last error: ${lastError?.message || 'Unknown'}`,
    'ALL_ACCOUNTS_EXHAUSTED'
  );
}

/**
 * Get conversation history/transcript
 */
export async function getConversationHistory(
  conversationId: string
): Promise<TranscriptMessage[]> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/convai/conversations/${conversationId}`,
      {
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new ElevenLabsError(
        'Failed to get conversation history',
        'API_ERROR',
        response.status
      );
    }

    const data = await response.json();

    // Transform to our format
    return (data.transcript || []).map((msg: any) => ({
      speaker: msg.role === 'user' ? 'user' : 'agent',
      content: msg.message,
      timestamp: msg.time_in_call_secs * 1000,
      isFinal: true,
    }));
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      throw error;
    }

    throw new ElevenLabsError(
      `Failed to get history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'REQUEST_ERROR'
    );
  }
}

/**
 * End a conversation
 */
export async function endConversation(conversationId: string): Promise<void> {
  const apiKey = getApiKey();

  try {
    await fetch(
      `${ELEVENLABS_API_URL}/convai/conversations/${conversationId}/end`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );
  } catch (error) {
    console.error('Failed to end conversation:', error);
    // Don't throw - ending should be best effort
  }
}

/**
 * Get conversation metadata
 */
export async function getConversationMetadata(
  conversationId: string
): Promise<{
  status: 'active' | 'ended';
  duration_seconds: number;
  start_time: string;
  end_time?: string;
}> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/convai/conversations/${conversationId}`,
      {
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new ElevenLabsError(
        'Failed to get conversation metadata',
        'API_ERROR',
        response.status
      );
    }

    const data = await response.json();

    return {
      status: data.status,
      duration_seconds: data.metadata?.call_duration_secs || 0,
      start_time: data.metadata?.start_time_unix_secs
        ? new Date(data.metadata.start_time_unix_secs * 1000).toISOString()
        : new Date().toISOString(),
      end_time: data.metadata?.end_time_unix_secs
        ? new Date(data.metadata.end_time_unix_secs * 1000).toISOString()
        : undefined,
    };
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      throw error;
    }

    throw new ElevenLabsError(
      `Failed to get metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'REQUEST_ERROR'
    );
  }
}

// -------------------- Voice Preview --------------------

/**
 * Generate a voice preview (text-to-speech)
 */
export async function generateVoicePreview(
  text: string,
  voiceId: string
): Promise<ArrayBuffer> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: AGENT_CONFIG.voice.stability,
            similarity_boost: AGENT_CONFIG.voice.similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new ElevenLabsError(
        'Failed to generate voice preview',
        'API_ERROR',
        response.status
      );
    }

    return await response.arrayBuffer();
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      throw error;
    }

    throw new ElevenLabsError(
      `Voice preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'REQUEST_ERROR'
    );
  }
}

// -------------------- Agent Management --------------------

/**
 * List available voices
 */
export async function listVoices(): Promise<
  Array<{
    voice_id: string;
    name: string;
    category: string;
    description?: string;
  }>
> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new ElevenLabsError('Failed to list voices', 'API_ERROR', response.status);
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      throw error;
    }

    throw new ElevenLabsError(
      `Failed to list voices: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'REQUEST_ERROR'
    );
  }
}

/**
 * Get agent details
 */
export async function getAgentDetails(agentId?: string): Promise<{
  agent_id: string;
  name: string;
  conversation_config: object;
}> {
  const apiKey = getApiKey();
  const id = agentId || getAgentId();

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/convai/agents/${id}`, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new ElevenLabsError('Failed to get agent details', 'API_ERROR', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      throw error;
    }

    throw new ElevenLabsError(
      `Failed to get agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'REQUEST_ERROR'
    );
  }
}

// -------------------- Exports --------------------

export {
  ELEVENLABS_VOICES,
  AGENT_CONFIG,
  getVoiceForPersona,
  // Multi-account failover exports
  getElevenLabsAccounts,
  getActiveAccount,
  markAccountError,
  resetAccountStatus,
  getAccountStatusSummary,
  type ElevenLabsAccount,
};
