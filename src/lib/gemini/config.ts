// ============================================
// SPARROW AI - Gemini Configuration
// Using Google AI (Gemini 2.0 Flash)
// ============================================

// Available Gemini models
export const GEMINI_MODELS = {
  // Gemini 2.0 Flash - Fast and intelligent
  FLASH_2_0: 'gemini-2.0-flash-exp',

  // Gemini 1.5 Pro - More capable, slower
  PRO_1_5: 'gemini-1.5-pro',

  // Gemini 1.5 Flash - Balanced
  FLASH_1_5: 'gemini-1.5-flash',
} as const;

export type GeminiModel = typeof GEMINI_MODELS[keyof typeof GEMINI_MODELS];

// Default model selection
export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS.FLASH_2_0;

// Model capabilities and use cases
export const GEMINI_MODEL_INFO: Record<GeminiModel, {
  name: string;
  description: string;
  contextWindow: number;
  bestFor: string[];
}> = {
  [GEMINI_MODELS.FLASH_2_0]: {
    name: 'Gemini 2.0 Flash',
    description: 'Latest and fastest Gemini model with multimodal capabilities',
    contextWindow: 1000000,
    bestFor: ['Persona generation', 'Real-time analysis', 'Conversational AI'],
  },
  [GEMINI_MODELS.PRO_1_5]: {
    name: 'Gemini 1.5 Pro',
    description: 'Most capable model for complex reasoning',
    contextWindow: 2000000,
    bestFor: ['Deep analysis', 'Complex scoring', 'Long transcripts'],
  },
  [GEMINI_MODELS.FLASH_1_5]: {
    name: 'Gemini 1.5 Flash',
    description: 'Balanced speed and capability',
    contextWindow: 1000000,
    bestFor: ['General tasks', 'Moderate complexity'],
  },
};

// Safety settings
export const SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

// Generation config presets
export const GENERATION_CONFIGS = {
  // For creative persona generation
  creative: {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4096,
  },
  // For analytical scoring
  analytical: {
    temperature: 0.3,
    topP: 0.85,
    topK: 20,
    maxOutputTokens: 8192,
  },
  // For conversational responses
  conversational: {
    temperature: 0.7,
    topP: 0.9,
    topK: 30,
    maxOutputTokens: 2048,
  },
  // For structured JSON output
  structured: {
    temperature: 0.2,
    topP: 0.8,
    topK: 10,
    maxOutputTokens: 4096,
  },
};
