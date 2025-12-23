// ============================================
// SPARROW AI - Gemini Client
// Using Google Generative AI (Gemini 2.0 Flash)
// ============================================

import { GoogleGenerativeAI, GenerativeModel, Content } from '@google/generative-ai';
import {
  GEMINI_MODELS,
  DEFAULT_GEMINI_MODEL,
  SAFETY_SETTINGS,
  GENERATION_CONFIGS,
  type GeminiModel,
} from './config';
import {
  PERSONA_GENERATION_SYSTEM,
  PERSONA_GENERATION_USER,
  SCORING_SYSTEM_PROMPT,
  QUICK_SCORE_USER,
  DEEP_ANALYSIS_USER,
  PROGRESS_ANALYSIS_SYSTEM,
  PROGRESS_ANALYSIS_USER,
} from './prompts';

// -------------------- Types --------------------

export class GeminiError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface PersonaConfig {
  name: string;
  title: string;
  company: string;
  company_size: string;
  industry: string;
  tenure_months: number;
  background: string;
  current_challenges: string[];
  personality: 'skeptical' | 'busy' | 'friendly' | 'technical';
  communication_style: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'brutal';
  hidden_pain_points: string[];
  objections: string[];
  buying_signals: string[];
  triggers: {
    positive: string[];
    negative: string[];
  };
  decision_criteria: string[];
  competitors_mentioned: string[];
  budget_situation: string;
  timeline_urgency: 'low' | 'medium' | 'high';
  goal_for_rep: string;
  opening_mood: string;
  first_response: string;
  voice_description: string;
}

export interface ScoreResult {
  overall: number;
  categories: {
    opening: number;
    discovery: number;
    objection_handling: number;
    call_control: number;
    closing: number;
  };
  outcome: 'meeting_booked' | 'callback' | 'rejected' | 'no_decision';
  confidence: number;
}

export interface DeepAnalysisResult {
  scores: ScoreResult;
  feedback: Array<{
    category: 'opening' | 'discovery' | 'objection_handling' | 'call_control' | 'closing';
    timestamp_estimate: string;
    type: 'positive' | 'negative' | 'missed_opportunity';
    content: string;
    suggestion?: string;
    excerpt?: string;
  }>;
  summary: string;
  key_strengths: string[];
  areas_for_improvement: string[];
  recommended_practice?: string;
  similar_situation_tip?: string;
}

export interface ProgressAnalysis {
  overall_trend: 'improving' | 'declining' | 'plateau';
  trend_description: string;
  strongest_skill: {
    skill: string;
    evidence: string;
  };
  weakest_skill: {
    skill: string;
    evidence: string;
    improvement_plan: string;
  };
  patterns_identified: string[];
  recommended_focus: string;
  predicted_improvement: string;
}

// -------------------- Client Initialization --------------------

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      throw new GeminiError('Google AI API key not configured', 'CONFIG_ERROR');
    }

    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

function getModel(
  modelId: GeminiModel = DEFAULT_GEMINI_MODEL,
  config: keyof typeof GENERATION_CONFIGS = 'conversational'
): GenerativeModel {
  const client = getClient();

  return client.getGenerativeModel({
    model: modelId,
    generationConfig: GENERATION_CONFIGS[config],
    safetySettings: SAFETY_SETTINGS as any,
  });
}

// -------------------- Core Functions --------------------

/**
 * Generate content with Gemini
 */
export async function generate(
  prompt: string,
  options: {
    model?: GeminiModel;
    config?: keyof typeof GENERATION_CONFIGS;
    systemInstruction?: string;
  } = {}
): Promise<string> {
  const { model: modelId, config = 'conversational', systemInstruction } = options;

  try {
    const model = getModel(modelId, config);

    const contents: Content[] = [];

    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: systemInstruction }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const result = await model.generateContent({ contents });
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new GeminiError('Empty response from Gemini', 'EMPTY_RESPONSE');
    }

    return text;
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GeminiError(`Gemini request failed: ${message}`, 'REQUEST_ERROR');
  }
}

/**
 * Generate content with streaming
 */
export async function* generateStream(
  prompt: string,
  options: {
    model?: GeminiModel;
    config?: keyof typeof GENERATION_CONFIGS;
    systemInstruction?: string;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const { model: modelId, config = 'conversational', systemInstruction } = options;

  try {
    const model = getModel(modelId, config);

    const contents: Content[] = [];

    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: systemInstruction }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const result = await model.generateContentStream({ contents });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GeminiError(`Gemini stream failed: ${message}`, 'STREAM_ERROR');
  }
}

// -------------------- Persona Generation --------------------

/**
 * Generate a realistic AI prospect persona
 */
export async function generatePersona(options: {
  industry: string;
  role: string;
  personality: 'skeptical' | 'busy' | 'friendly' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard' | 'brutal';
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet';
}): Promise<PersonaConfig> {
  const prompt = PERSONA_GENERATION_USER(options);

  const response = await generate(prompt, {
    model: GEMINI_MODELS.FLASH_2_0,
    config: 'creative',
    systemInstruction: PERSONA_GENERATION_SYSTEM,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const persona = JSON.parse(jsonMatch[0]) as PersonaConfig;

    // Validate required fields
    if (!persona.name || !persona.title || !persona.company) {
      throw new Error('Missing required persona fields');
    }

    return persona;
  } catch (error) {
    console.error('Failed to parse persona response:', error);
    throw new GeminiError('Failed to generate persona', 'PARSE_ERROR');
  }
}

// -------------------- Call Scoring --------------------

/**
 * Quick score for real-time feedback
 */
export async function quickScore(
  transcript: string,
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet',
  personaContext: string
): Promise<ScoreResult> {
  const prompt = QUICK_SCORE_USER(transcript, callType, personaContext);

  const response = await generate(prompt, {
    model: GEMINI_MODELS.FLASH_2_0,
    config: 'structured',
    systemInstruction: SCORING_SYSTEM_PROMPT,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]) as ScoreResult;
  } catch (error) {
    console.error('Failed to parse quick score:', error);
    return {
      overall: 5,
      categories: {
        opening: 5,
        discovery: 5,
        objection_handling: 5,
        call_control: 5,
        closing: 5,
      },
      outcome: 'no_decision',
      confidence: 0,
    };
  }
}

/**
 * Deep analysis with detailed feedback
 */
export async function deepAnalysis(
  transcript: string,
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet',
  personaContext: string,
  quickScores?: ScoreResult
): Promise<DeepAnalysisResult> {
  const prompt = DEEP_ANALYSIS_USER(transcript, callType, personaContext, quickScores);

  const response = await generate(prompt, {
    model: GEMINI_MODELS.FLASH_2_0,
    config: 'analytical',
    systemInstruction: SCORING_SYSTEM_PROMPT,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]) as DeepAnalysisResult;
  } catch (error) {
    console.error('Failed to parse deep analysis:', error);
    throw new GeminiError('Failed to analyze call', 'PARSE_ERROR');
  }
}

// -------------------- Progress Analysis --------------------

/**
 * Analyze user's progress over multiple calls
 */
export async function analyzeProgress(
  callHistory: Array<{
    date: string;
    type: string;
    scores: object;
    duration: number;
  }>,
  skillScores: object
): Promise<ProgressAnalysis> {
  const prompt = PROGRESS_ANALYSIS_USER(callHistory, skillScores);

  const response = await generate(prompt, {
    model: GEMINI_MODELS.FLASH_2_0,
    config: 'analytical',
    systemInstruction: PROGRESS_ANALYSIS_SYSTEM,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]) as ProgressAnalysis;
  } catch (error) {
    console.error('Failed to parse progress analysis:', error);
    throw new GeminiError('Failed to analyze progress', 'PARSE_ERROR');
  }
}

// -------------------- Chat --------------------

/**
 * Chat with Gemini (for general queries)
 */
export async function chat(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  options: {
    model?: GeminiModel;
    config?: keyof typeof GENERATION_CONFIGS;
    systemInstruction?: string;
  } = {}
): Promise<string> {
  const { model: modelId, config = 'conversational', systemInstruction } = options;

  try {
    const model = getModel(modelId, config);

    const contents: Content[] = [];

    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: systemInstruction }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood.' }],
      });
    }

    for (const message of messages) {
      contents.push({
        role: message.role,
        parts: [{ text: message.content }],
      });
    }

    const result = await model.generateContent({ contents });
    return result.response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GeminiError(`Chat failed: ${message}`, 'CHAT_ERROR');
  }
}

// -------------------- Exports --------------------

export { GEMINI_MODELS, DEFAULT_GEMINI_MODEL, GENERATION_CONFIGS };
