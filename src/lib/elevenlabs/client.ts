// ============================================
// SPARROW AI - ElevenLabs Client
// Conversational AI Voice Agent
// ============================================

import {
  ELEVENLABS_VOICES,
  AGENT_CONFIG,
  getVoiceForPersona,
  type VoiceConfig,
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

function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new ElevenLabsError('ElevenLabs API key not configured', 'CONFIG_ERROR');
  }
  return apiKey;
}

function getAgentId(): string {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  if (!agentId) {
    throw new ElevenLabsError('ElevenLabs Agent ID not configured', 'CONFIG_ERROR');
  }
  return agentId;
}

// -------------------- Conversation Management --------------------

/**
 * Get a signed URL for starting a conversation
 * This is used by the ElevenLabs React SDK
 */
export async function getSignedUrl(
  config: ConversationConfig
): Promise<ConversationSession> {
  const apiKey = getApiKey();
  const agentId = config.agentId || getAgentId();

  // Select voice based on persona name (gender inference) and personality
  let voice: VoiceConfig;
  if (config.voiceId) {
    voice = Object.values(ELEVENLABS_VOICES).find((v) => v.id === config.voiceId) ||
      getVoiceForPersona({
        name: config.persona.name,
        personality: config.persona.personality,
      });
  } else {
    // Use persona name to infer gender for voice selection
    voice = getVoiceForPersona({
      name: config.persona.name,
      personality: config.persona.personality,
    });
  }

  console.log('Voice selection:', {
    personaName: config.persona.name,
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

  try {
    // Get signed URL for the conversation
    // The ElevenLabs React SDK will handle the conversation setup
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
      throw new ElevenLabsError(
        `Failed to get signed URL: ${errorText}`,
        'API_ERROR',
        response.status
      );
    }

    const data = await response.json();

    console.log('ElevenLabs signed URL response:', {
      hasSignedUrl: !!data.signed_url,
      signedUrlPreview: data.signed_url ? data.signed_url.substring(0, 100) + '...' : null,
      conversationId: data.conversation_id,
      agentId,
    });

    if (!data.signed_url) {
      throw new ElevenLabsError('No signed URL in response', 'API_ERROR');
    }

    // Store persona context for the client-side SDK to use
    // The React SDK's useConversation will handle the actual conversation
    return {
      conversationId: data.conversation_id || `conv_${Date.now()}`,
      signedUrl: data.signed_url,
      agentId,
      voiceId: voice.id,
      persona: config.persona,
      callType: config.callType,
    };
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      throw error;
    }

    throw new ElevenLabsError(
      `Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'REQUEST_ERROR'
    );
  }
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
};
