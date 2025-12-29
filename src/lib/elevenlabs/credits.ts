// ============================================
// SPARROW AI - ElevenLabs Credit Management
// Optimize usage for demos and limited credits
// ============================================

/**
 * Credit usage estimates (conservative)
 * ElevenLabs charges per character for TTS
 */
export const CREDIT_ESTIMATES = {
  // Average characters per minute of conversation
  CHARS_PER_MINUTE: 800,

  // Average characters per AI response
  CHARS_PER_RESPONSE: 150,

  // Estimated credits per minute (with overhead)
  CREDITS_PER_MINUTE: 1000,
};

/**
 * Demo mode configuration
 * Optimized for limited credits
 */
export const DEMO_MODE_CONFIG = {
  // Maximum call duration in seconds (2 minutes for demo)
  MAX_CALL_DURATION_SECONDS: 120,

  // Warning threshold (show warning at 30 seconds remaining)
  WARNING_THRESHOLD_SECONDS: 30,

  // Target response length (shorter = fewer credits)
  TARGET_RESPONSE_LENGTH: 'short', // 'short' | 'medium' | 'long'

  // Maximum number of demo calls
  MAX_DEMO_CALLS: 5,
};

/**
 * Production mode configuration
 * For when you have more credits
 */
export const PRODUCTION_CONFIG = {
  MAX_CALL_DURATION_SECONDS: 300, // 5 minutes
  WARNING_THRESHOLD_SECONDS: 60,
  TARGET_RESPONSE_LENGTH: 'medium',
  MAX_DEMO_CALLS: -1, // unlimited
};

/**
 * Get current mode configuration
 */
export function getCreditsConfig() {
  const isDemoMode = process.env.ELEVENLABS_DEMO_MODE === 'true';
  return isDemoMode ? DEMO_MODE_CONFIG : PRODUCTION_CONFIG;
}

/**
 * Estimate credits for a call duration
 */
export function estimateCreditsForDuration(durationSeconds: number): number {
  const minutes = durationSeconds / 60;
  return Math.ceil(minutes * CREDIT_ESTIMATES.CREDITS_PER_MINUTE);
}

/**
 * Estimate remaining calls based on credits
 */
export function estimateRemainingCalls(
  availableCredits: number,
  avgCallDurationSeconds: number = 120
): number {
  const creditsPerCall = estimateCreditsForDuration(avgCallDurationSeconds);
  return Math.floor(availableCredits / creditsPerCall);
}

/**
 * Credit-saving tips for the system prompt
 */
export const CREDIT_SAVING_PROMPT_ADDITIONS = `
# RESPONSE LENGTH (IMPORTANT FOR CREDITS)
Keep your responses SHORT and PUNCHY:
- Maximum 1-2 sentences per response
- Use fragments: "Not interested." "Maybe." "Depends."
- Don't over-explain - real busy people don't
- Quick reactions: "Hmm." "Right." "And?" "So?"
- Get to the point fast
`;

/**
 * Check if we should warn about credits
 */
export function shouldWarnAboutCredits(
  callDurationSeconds: number,
  maxDuration: number = DEMO_MODE_CONFIG.MAX_CALL_DURATION_SECONDS
): { warn: boolean; message: string; remainingSeconds: number } {
  const remaining = maxDuration - callDurationSeconds;
  const threshold = DEMO_MODE_CONFIG.WARNING_THRESHOLD_SECONDS;

  if (remaining <= 0) {
    return {
      warn: true,
      message: 'Call time limit reached. Ending call to save credits.',
      remainingSeconds: 0,
    };
  }

  if (remaining <= threshold) {
    return {
      warn: true,
      message: `${remaining} seconds remaining. Wrap up your call.`,
      remainingSeconds: remaining,
    };
  }

  return {
    warn: false,
    message: '',
    remainingSeconds: remaining,
  };
}

/**
 * Format credits display
 */
export function formatCredits(credits: number): string {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M`;
  }
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`;
  }
  return credits.toString();
}
