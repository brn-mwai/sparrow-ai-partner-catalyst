// Groq API Configuration
// All available models from Groq Cloud

export const GROQ_MODELS = {
  // Alibaba Cloud
  QWEN3_32B: 'qwen/qwen3-32b',

  // Canopy Labs - Voice/TTS models
  ORPHEUS_ARABIC_SAUDI: 'canopylabs/orpheus-arabic-saudi',
  ORPHEUS_V1_ENGLISH: 'canopylabs/orpheus-v1-english',

  // Groq Native - Compound models (multi-step reasoning)
  COMPOUND: 'groq/compound',
  COMPOUND_MINI: 'groq/compound-mini',

  // Meta Llama Models
  LLAMA_3_1_8B_INSTANT: 'llama-3.1-8b-instant',
  LLAMA_3_3_70B_VERSATILE: 'llama-3.3-70b-versatile',
  LLAMA_4_MAVERICK_17B: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  LLAMA_4_SCOUT_17B: 'meta-llama/llama-4-scout-17b-16e-instruct',
  LLAMA_GUARD_4_12B: 'meta-llama/llama-guard-4-12b',
  LLAMA_PROMPT_GUARD_2_22M: 'meta-llama/llama-prompt-guard-2-22m',
  LLAMA_PROMPT_GUARD_2_86M: 'meta-llama/llama-prompt-guard-2-86m',

  // Moonshot AI
  KIMI_K2_INSTRUCT: 'moonshotai/kimi-k2-instruct-0905',

  // OpenAI Compatible
  GPT_OSS_120B: 'openai/gpt-oss-120b',
  GPT_OSS_20B: 'openai/gpt-oss-20b',
  GPT_OSS_SAFEGUARD_20B: 'openai/gpt-oss-safeguard-20b',

  // Whisper - Speech Recognition
  WHISPER_LARGE_V3: 'whisper-large-v3',
  WHISPER_LARGE_V3_TURBO: 'whisper-large-v3-turbo',
} as const;

export type GroqModel = typeof GROQ_MODELS[keyof typeof GROQ_MODELS];

// Model categories for different use cases
export const GROQ_MODEL_CATEGORIES = {
  // Fast scoring during calls (~200ms)
  REALTIME_SCORING: [
    GROQ_MODELS.LLAMA_3_1_8B_INSTANT,
    GROQ_MODELS.COMPOUND_MINI,
  ],

  // Deep analysis after calls
  DEEP_ANALYSIS: [
    GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
    GROQ_MODELS.GPT_OSS_120B,
    GROQ_MODELS.KIMI_K2_INSTRUCT,
    GROQ_MODELS.COMPOUND,
  ],

  // Persona generation
  PERSONA_GENERATION: [
    GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
    GROQ_MODELS.GPT_OSS_120B,
    GROQ_MODELS.QWEN3_32B,
  ],

  // Content safety
  SAFETY: [
    GROQ_MODELS.LLAMA_GUARD_4_12B,
    GROQ_MODELS.GPT_OSS_SAFEGUARD_20B,
    GROQ_MODELS.LLAMA_PROMPT_GUARD_2_86M,
  ],

  // Speech recognition
  SPEECH_TO_TEXT: [
    GROQ_MODELS.WHISPER_LARGE_V3_TURBO,
    GROQ_MODELS.WHISPER_LARGE_V3,
  ],
};

// Default model selection
export const DEFAULT_MODELS = {
  SCORING: GROQ_MODELS.LLAMA_3_1_8B_INSTANT,
  ANALYSIS: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
  PERSONA: GROQ_MODELS.GPT_OSS_120B,
  SAFETY: GROQ_MODELS.LLAMA_GUARD_4_12B,
  STT: GROQ_MODELS.WHISPER_LARGE_V3_TURBO,
};

// Model metadata for UI display
export const MODEL_INFO: Record<GroqModel, {
  name: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'premium';
  contextWindow: number;
}> = {
  [GROQ_MODELS.QWEN3_32B]: {
    name: 'Qwen3 32B',
    description: 'Alibaba Cloud multilingual model',
    speed: 'medium',
    quality: 'high',
    contextWindow: 32768,
  },
  [GROQ_MODELS.ORPHEUS_ARABIC_SAUDI]: {
    name: 'Orpheus Arabic Saudi',
    description: 'Arabic voice synthesis',
    speed: 'fast',
    quality: 'high',
    contextWindow: 4096,
  },
  [GROQ_MODELS.ORPHEUS_V1_ENGLISH]: {
    name: 'Orpheus V1 English',
    description: 'English voice synthesis',
    speed: 'fast',
    quality: 'high',
    contextWindow: 4096,
  },
  [GROQ_MODELS.COMPOUND]: {
    name: 'Groq Compound',
    description: 'Multi-step reasoning with tools',
    speed: 'medium',
    quality: 'premium',
    contextWindow: 128000,
  },
  [GROQ_MODELS.COMPOUND_MINI]: {
    name: 'Groq Compound Mini',
    description: 'Fast multi-step reasoning',
    speed: 'fast',
    quality: 'high',
    contextWindow: 64000,
  },
  [GROQ_MODELS.LLAMA_3_1_8B_INSTANT]: {
    name: 'Llama 3.1 8B Instant',
    description: 'Ultra-fast inference for real-time',
    speed: 'fast',
    quality: 'standard',
    contextWindow: 131072,
  },
  [GROQ_MODELS.LLAMA_3_3_70B_VERSATILE]: {
    name: 'Llama 3.3 70B Versatile',
    description: 'High-quality versatile model',
    speed: 'medium',
    quality: 'premium',
    contextWindow: 131072,
  },
  [GROQ_MODELS.LLAMA_4_MAVERICK_17B]: {
    name: 'Llama 4 Maverick 17B',
    description: 'Latest Llama 4 with 128 experts',
    speed: 'medium',
    quality: 'premium',
    contextWindow: 131072,
  },
  [GROQ_MODELS.LLAMA_4_SCOUT_17B]: {
    name: 'Llama 4 Scout 17B',
    description: 'Efficient Llama 4 variant',
    speed: 'fast',
    quality: 'high',
    contextWindow: 131072,
  },
  [GROQ_MODELS.LLAMA_GUARD_4_12B]: {
    name: 'Llama Guard 4 12B',
    description: 'Content safety classifier',
    speed: 'fast',
    quality: 'high',
    contextWindow: 16384,
  },
  [GROQ_MODELS.LLAMA_PROMPT_GUARD_2_22M]: {
    name: 'Prompt Guard 2 22M',
    description: 'Lightweight prompt injection detector',
    speed: 'fast',
    quality: 'standard',
    contextWindow: 4096,
  },
  [GROQ_MODELS.LLAMA_PROMPT_GUARD_2_86M]: {
    name: 'Prompt Guard 2 86M',
    description: 'Advanced prompt injection detector',
    speed: 'fast',
    quality: 'high',
    contextWindow: 4096,
  },
  [GROQ_MODELS.KIMI_K2_INSTRUCT]: {
    name: 'Kimi K2 Instruct',
    description: 'Moonshot AI instruction-tuned model',
    speed: 'medium',
    quality: 'premium',
    contextWindow: 131072,
  },
  [GROQ_MODELS.GPT_OSS_120B]: {
    name: 'GPT-OSS 120B',
    description: 'Large open-source GPT variant',
    speed: 'slow',
    quality: 'premium',
    contextWindow: 128000,
  },
  [GROQ_MODELS.GPT_OSS_20B]: {
    name: 'GPT-OSS 20B',
    description: 'Efficient open-source GPT variant',
    speed: 'medium',
    quality: 'high',
    contextWindow: 128000,
  },
  [GROQ_MODELS.GPT_OSS_SAFEGUARD_20B]: {
    name: 'GPT-OSS Safeguard 20B',
    description: 'Safety-focused GPT variant',
    speed: 'medium',
    quality: 'high',
    contextWindow: 128000,
  },
  [GROQ_MODELS.WHISPER_LARGE_V3]: {
    name: 'Whisper Large V3',
    description: 'High-accuracy speech recognition',
    speed: 'medium',
    quality: 'premium',
    contextWindow: 0,
  },
  [GROQ_MODELS.WHISPER_LARGE_V3_TURBO]: {
    name: 'Whisper Large V3 Turbo',
    description: 'Fast speech recognition',
    speed: 'fast',
    quality: 'high',
    contextWindow: 0,
  },
};
