'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { TranscriptMessage, PersonaConfig } from '@/types/database';

export interface VoiceCallConfig {
  signedUrl: string;
  persona: PersonaConfig;
  onTranscriptUpdate?: (transcript: TranscriptMessage[]) => void;
  onStatusChange?: (status: VoiceCallStatus) => void;
  onError?: (error: Error) => void;
}

export type VoiceCallStatus =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'speaking'
  | 'listening'
  | 'ending'
  | 'ended'
  | 'error';

export interface VoiceCallState {
  status: VoiceCallStatus;
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isMuted: boolean;
  duration: number;
  transcript: TranscriptMessage[];
  error: string | null;
}

export interface VoiceCallActions {
  start: () => Promise<void>;
  end: () => Promise<void>;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
}

/**
 * Custom hook for managing ElevenLabs voice conversations
 * Optimized for low-latency real-time voice calls
 */
export function useVoiceCall(config: VoiceCallConfig): [VoiceCallState, VoiceCallActions] {
  const [status, setStatus] = useState<VoiceCallStatus>('idle');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // ElevenLabs conversation hook with optimized settings
  const conversation = useConversation({
    onConnect: useCallback(() => {
      console.log('[VoiceCall] Connected to ElevenLabs');
      setStatus('active');
      setError(null);
      reconnectAttemptsRef.current = 0;
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      config.onStatusChange?.('active');
    }, [config]),

    onDisconnect: useCallback(() => {
      console.log('[VoiceCall] Disconnected from ElevenLabs');

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Only set ended if we're not in an error state
      if (status !== 'error') {
        setStatus('ended');
        config.onStatusChange?.('ended');
      }
    }, [status, config]),

    onMessage: useCallback((message: { source: string; message: string }) => {
      const newMessage: TranscriptMessage = {
        speaker: message.source === 'user' ? 'user' : 'prospect',
        content: message.message,
        timestamp_ms: startTimeRef.current > 0
          ? Date.now() - startTimeRef.current
          : 0,
      };

      setTranscript((prev) => {
        const updated = [...prev, newMessage];
        config.onTranscriptUpdate?.(updated);
        return updated;
      });
    }, [config]),

    onError: useCallback((err: Error | unknown) => {
      console.error('[VoiceCall] Error:', err);
      setError(err instanceof Error ? err.message : 'Voice connection error');
      setStatus('error');
      config.onError?.(err instanceof Error ? err : new Error(String(err)));
      config.onStatusChange?.('error');

      // Attempt reconnection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        console.log(`[VoiceCall] Attempting reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        setTimeout(() => {
          setStatus('connecting');
          config.onStatusChange?.('connecting');
        }, 1000 * reconnectAttemptsRef.current); // Exponential backoff
      }
    }, [config]),
  });

  // Update status based on speaking state
  useEffect(() => {
    if (status === 'active' || status === 'speaking' || status === 'listening') {
      if (conversation.isSpeaking) {
        setStatus('speaking');
        config.onStatusChange?.('speaking');
      } else {
        setStatus('listening');
        config.onStatusChange?.('listening');
      }
    }
  }, [conversation.isSpeaking, status, config]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start the conversation
  const start = useCallback(async () => {
    if (status !== 'idle' && status !== 'error') {
      console.warn('[VoiceCall] Cannot start - already in progress');
      return;
    }

    setStatus('connecting');
    setError(null);
    setTranscript([]);
    setDuration(0);
    config.onStatusChange?.('connecting');

    try {
      await conversation.startSession({
        signedUrl: config.signedUrl,
      });
    } catch (err) {
      console.error('[VoiceCall] Failed to start:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setStatus('error');
      config.onError?.(err instanceof Error ? err : new Error(String(err)));
      config.onStatusChange?.('error');
    }
  }, [config, conversation, status]);

  // End the conversation
  const end = useCallback(async () => {
    if (status === 'idle' || status === 'ended') {
      return;
    }

    setStatus('ending');
    config.onStatusChange?.('ending');

    try {
      await conversation.endSession();
    } catch (err) {
      console.error('[VoiceCall] Error ending session:', err);
      // Don't throw - ending should be best effort
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setStatus('ended');
    config.onStatusChange?.('ended');
  }, [conversation, status, config]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    // ElevenLabs mute is done via volume
    if (newMuted) {
      conversation.setVolume({ volume: 0 });
    } else {
      conversation.setVolume({ volume: 1 });
    }
  }, [conversation, isMuted]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
  }, [conversation]);

  const state: VoiceCallState = {
    status,
    isConnected: status === 'active' || status === 'speaking' || status === 'listening',
    isSpeaking: conversation.isSpeaking,
    isListening: !conversation.isSpeaking && (status === 'active' || status === 'listening'),
    isMuted,
    duration,
    transcript,
    error,
  };

  const actions: VoiceCallActions = {
    start,
    end,
    toggleMute,
    setVolume,
  };

  return [state, actions];
}

export default useVoiceCall;
