// ============================================
// SPARROW AI - Groq API Client
// High-performance inference for real-time scoring and analysis
// Supports: Llama, GPT-OSS, Qwen, Whisper, Compound models
// ============================================

import { GROQ_MODELS, DEFAULT_MODELS, type GroqModel } from './config';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// -------------------- Types --------------------

export class GroqError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'GroqError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: GroqModel;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  useTools?: boolean;
  reasoningEffort?: 'low' | 'medium' | 'high';
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
}

export interface SafetyResult {
  safe: boolean;
  categories: {
    violence: boolean;
    harassment: boolean;
    hate_speech: boolean;
    self_harm: boolean;
    sexual_content: boolean;
  };
  flagged_content?: string;
}

// -------------------- Core API Functions --------------------

/**
 * Makes a request to Groq API
 */
async function groqRequest(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new GroqError('Groq API key not configured', 'CONFIG_ERROR');
  }

  const {
    model = DEFAULT_MODELS.ANALYSIS,
    maxTokens = 8192,
    temperature = 0.7,
    topP = 1,
    stream = false,
    useTools = false,
    reasoningEffort = 'medium',
  } = options;

  // Build request body
  const requestBody: Record<string, unknown> = {
    model,
    messages,
    max_completion_tokens: maxTokens,
    temperature,
    top_p: topP,
    stream,
  };

  // Add reasoning effort for supported models (GPT-OSS, Compound)
  if (model.includes('gpt-oss') || model.includes('compound')) {
    requestBody.reasoning_effort = reasoningEffort;
  }

  // Add tools for supported models
  if (useTools && (model.includes('gpt-oss') || model.includes('compound'))) {
    requestBody.tools = [
      { type: 'browser_search' },
      { type: 'code_interpreter' },
    ];
  }

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 429) {
        throw new GroqError('Rate limit exceeded', 'RATE_LIMIT', 429);
      }

      if (response.status === 401 || response.status === 403) {
        throw new GroqError('Authentication failed', 'AUTH_ERROR', response.status);
      }

      throw new GroqError(`API error: ${errorText}`, 'API_ERROR', response.status);
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new GroqError('Invalid response from Groq', 'RESPONSE_ERROR');
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof GroqError) {
      throw error;
    }

    throw new GroqError(
      `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'REQUEST_ERROR'
    );
  }
}

/**
 * Standard chat completion
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  return groqRequest(messages, options);
}

/**
 * Streaming chat completion
 */
export async function* chatStream(
  messages: ChatMessage[],
  options: ChatOptions = {}
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new GroqError('Groq API key not configured', 'CONFIG_ERROR');
  }

  const {
    model = DEFAULT_MODELS.ANALYSIS,
    maxTokens = 8192,
    temperature = 0.7,
    topP = 1,
  } = options;

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_completion_tokens: maxTokens,
      temperature,
      top_p: topP,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new GroqError('Stream request failed', 'STREAM_ERROR', response.status);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new GroqError('No response body', 'STREAM_ERROR');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

// -------------------- Sales Call Scoring --------------------

/**
 * Quick scoring for real-time feedback (~200ms)
 * Uses fast models for immediate feedback during/after calls
 */
export async function quickScore(
  transcript: string,
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet',
  personaContext: string
): Promise<ScoreResult> {
  const systemPrompt = `You are an expert sales coach analyzing a ${callType.replace(/_/g, ' ')} call.
Evaluate the sales rep's performance and provide scores from 1-10 for each category.
Be objective and fair. Consider the prospect context: ${personaContext}

Respond ONLY with valid JSON in this exact format:
{
  "overall": <number 1-10>,
  "categories": {
    "opening": <number 1-10>,
    "discovery": <number 1-10>,
    "objection_handling": <number 1-10>,
    "call_control": <number 1-10>,
    "closing": <number 1-10>
  },
  "outcome": "<meeting_booked|callback|rejected|no_decision>",
  "confidence": <number 0-1>
}`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this call transcript:\n\n${transcript}` },
    ],
    {
      model: GROQ_MODELS.LLAMA_3_1_8B_INSTANT,
      temperature: 0.3,
      maxTokens: 512,
    }
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as ScoreResult;
  } catch (error) {
    console.error('Failed to parse quick score response:', error);
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
 * Deep analysis using more powerful models (~2-5 seconds)
 * Provides detailed feedback with timestamps and suggestions
 */
export async function deepAnalysis(
  transcript: string,
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet',
  personaContext: string,
  quickScoreResult?: ScoreResult
): Promise<DeepAnalysisResult> {
  const systemPrompt = `You are an expert sales coach providing detailed analysis of a ${callType.replace(/_/g, ' ')} call.
Context about the prospect: ${personaContext}
${quickScoreResult ? `Initial quick scores: ${JSON.stringify(quickScoreResult)}` : ''}

Provide comprehensive feedback with specific timestamps and actionable suggestions.
Respond ONLY with valid JSON in this exact format:
{
  "scores": {
    "overall": <number 1-10>,
    "categories": {
      "opening": <number 1-10>,
      "discovery": <number 1-10>,
      "objection_handling": <number 1-10>,
      "call_control": <number 1-10>,
      "closing": <number 1-10>
    },
    "outcome": "<meeting_booked|callback|rejected|no_decision>",
    "confidence": <number 0-1>
  },
  "feedback": [
    {
      "category": "<opening|discovery|objection_handling|call_control|closing>",
      "timestamp_estimate": "<e.g., 0:30>",
      "type": "<positive|negative|missed_opportunity>",
      "content": "<what happened>",
      "suggestion": "<what to do better>",
      "excerpt": "<relevant quote from transcript>"
    }
  ],
  "summary": "<2-3 sentence overall summary>",
  "key_strengths": ["<strength 1>", "<strength 2>"],
  "areas_for_improvement": ["<area 1>", "<area 2>"]
}`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this call transcript in detail:\n\n${transcript}` },
    ],
    {
      model: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
      temperature: 0.4,
      maxTokens: 4096,
    }
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as DeepAnalysisResult;
  } catch (error) {
    console.error('Failed to parse deep analysis response:', error);
    throw new GroqError('Failed to analyze transcript', 'PARSE_ERROR');
  }
}

// -------------------- Content Safety --------------------

/**
 * Content safety check using Llama Guard
 */
export async function checkSafety(content: string): Promise<SafetyResult> {
  const systemPrompt = `You are a content safety classifier. Analyze the following content for safety issues.
Respond ONLY with valid JSON:
{
  "safe": <boolean>,
  "categories": {
    "violence": <boolean - true if detected>,
    "harassment": <boolean - true if detected>,
    "hate_speech": <boolean - true if detected>,
    "self_harm": <boolean - true if detected>,
    "sexual_content": <boolean - true if detected>
  },
  "flagged_content": "<brief description if unsafe, null if safe>"
}`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Check this content for safety:\n\n${content}` },
    ],
    {
      model: GROQ_MODELS.LLAMA_GUARD_4_12B,
      temperature: 0.1,
      maxTokens: 256,
    }
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as SafetyResult;
  } catch (error) {
    console.error('Failed to parse safety response:', error);
    return {
      safe: true,
      categories: {
        violence: false,
        harassment: false,
        hate_speech: false,
        self_harm: false,
        sexual_content: false,
      },
    };
  }
}

// -------------------- Speech-to-Text --------------------

/**
 * Transcribe audio using Whisper models
 */
export async function transcribeAudio(
  audioFile: File | Blob,
  options: {
    language?: string;
    model?: typeof GROQ_MODELS.WHISPER_LARGE_V3 | typeof GROQ_MODELS.WHISPER_LARGE_V3_TURBO;
  } = {}
): Promise<{ text: string; segments?: Array<{ start: number; end: number; text: string }> }> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new GroqError('Groq API key not configured', 'CONFIG_ERROR');
  }

  const { model = GROQ_MODELS.WHISPER_LARGE_V3_TURBO, language = 'en' } = options;

  const formData = new FormData();
  formData.append('file', audioFile, 'audio.wav');
  formData.append('model', model);
  formData.append('language', language);
  formData.append('response_format', 'verbose_json');

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new GroqError(`Transcription failed: ${errorText}`, 'TRANSCRIPTION_ERROR', response.status);
  }

  const data = await response.json();

  return {
    text: data.text,
    segments: data.segments?.map((seg: { start: number; end: number; text: string }) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text,
    })),
  };
}

// -------------------- Compound Reasoning --------------------

/**
 * Multi-step reasoning using Compound models
 * Supports tools like browser_search and code_interpreter
 */
export async function compoundReasoning(
  query: string,
  context: string,
  options: {
    useTools?: boolean;
    reasoningEffort?: 'low' | 'medium' | 'high';
  } = {}
): Promise<string> {
  const { useTools = true, reasoningEffort = 'medium' } = options;

  return chat(
    [
      {
        role: 'system',
        content: `You are an intelligent assistant with access to tools for complex reasoning.
Context: ${context}

Think step-by-step and use available tools when needed to provide accurate answers.`,
      },
      { role: 'user', content: query },
    ],
    {
      model: GROQ_MODELS.COMPOUND,
      useTools,
      reasoningEffort,
      maxTokens: 8192,
    }
  );
}

// -------------------- Persona Generation (Fallback) --------------------

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

/**
 * Generate a prospect persona (fallback if Gemini unavailable)
 */
export async function generatePersona(options: {
  industry: string;
  role: string;
  personality: string;
  difficulty: string;
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet';
}): Promise<PersonaConfig> {
  const systemPrompt = `You are an expert at creating realistic sales prospect personas for training.
Generate a detailed, believable prospect persona based on the given parameters.

Respond ONLY with valid JSON matching this EXACT structure:
{
  "name": "<realistic full name>",
  "title": "<job title>",
  "company": "<company name>",
  "company_size": "<e.g., 50-200 employees>",
  "industry": "<industry>",
  "tenure_months": <number 3-60>,
  "background": "<2-3 sentences about their career and current situation>",
  "current_challenges": ["<challenge 1>", "<challenge 2>"],
  "personality": "<skeptical|busy|friendly|technical>",
  "communication_style": "<e.g., Direct and analytical, prefers data>",
  "difficulty": "<easy|medium|hard|brutal>",
  "hidden_pain_points": ["<pain point 1>", "<pain point 2>", "<pain point 3>"],
  "objections": ["<objection 1>", "<objection 2>", "<objection 3>"],
  "buying_signals": ["<signal 1>", "<signal 2>"],
  "triggers": {
    "positive": ["<what makes them warm up>", "<another trigger>"],
    "negative": ["<what turns them off>", "<another trigger>"]
  },
  "decision_criteria": ["<criterion 1>", "<criterion 2>"],
  "competitors_mentioned": ["<competitor 1>"],
  "budget_situation": "<e.g., Budget allocated for Q1>",
  "timeline_urgency": "<low|medium|high>",
  "goal_for_rep": "<what the sales rep needs to achieve in this call>",
  "opening_mood": "<e.g., distracted|neutral|curious|skeptical>",
  "first_response": "<the prospect's opening line when answering the call>",
  "voice_description": "<description for voice synthesis, e.g., professional female, slight skepticism>"
}`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate a ${options.difficulty} difficulty ${options.personality} prospect persona.
Industry: ${options.industry}
Role: ${options.role}
Call Type: ${options.callType.replace(/_/g, ' ')}

Make them realistic and challenging. Include specific objections for a ${options.callType.replace(/_/g, ' ')}.`,
      },
    ],
    {
      model: GROQ_MODELS.LLAMA_3_3_70B_VERSATILE,
      temperature: 0.8,
      maxTokens: 2048,
    }
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as PersonaConfig;
  } catch (error) {
    console.error('Failed to parse persona response:', error);
    throw new GroqError('Failed to generate persona', 'PARSE_ERROR');
  }
}

// -------------------- Backwards Compatibility (Legacy Chat API) --------------------

// These exports maintain compatibility with the old chat API
// TODO: Remove when legacy chat is migrated

export interface ChatContext {
  user: {
    name?: string;
    company?: string;
    role?: string;
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export async function chatWithGroq(
  message: string,
  context: ChatContext,
  modelId?: string
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a helpful AI assistant. User: ${context.user.name || 'User'}`,
    },
    ...context.conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  return chat(messages, {
    model: (modelId as GroqModel) || DEFAULT_MODELS.ANALYSIS,
  });
}

export async function generateBriefWithGroq(): Promise<never> {
  throw new Error('generateBriefWithGroq is deprecated. Use the new Gemini client instead.');
}

// -------------------- Exports --------------------

export { GROQ_MODELS, DEFAULT_MODELS };
