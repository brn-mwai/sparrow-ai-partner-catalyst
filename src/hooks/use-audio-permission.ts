'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  checkMicrophonePermission,
  requestMicrophonePermission,
  stopMediaStream,
  isAudioSupported,
  type PermissionStatus,
} from '@/lib/audio/utils';

export interface UseAudioPermissionResult {
  /** Current permission status */
  status: PermissionStatus;
  /** Whether permission check is in progress */
  isChecking: boolean;
  /** Whether audio is supported in this browser */
  isSupported: boolean;
  /** Error message if permission was denied */
  error: string | null;
  /** Active media stream (if permission granted and stream requested) */
  stream: MediaStream | null;
  /** Request microphone permission */
  requestPermission: () => Promise<boolean>;
  /** Stop and release the media stream */
  releaseStream: () => void;
}

/**
 * Hook for managing microphone permissions
 */
export function useAudioPermission(): UseAudioPermissionResult {
  const [status, setStatus] = useState<PermissionStatus>('prompt');
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isSupported = typeof window !== 'undefined' && isAudioSupported();

  // Check permission on mount
  useEffect(() => {
    const check = async () => {
      setIsChecking(true);
      try {
        const result = await checkMicrophonePermission();
        setStatus(result);
      } catch {
        setStatus('prompt');
      } finally {
        setIsChecking(false);
      }
    };

    check();
  }, []);

  // Listen for permission changes
  useEffect(() => {
    if (!isSupported) return;

    const handlePermissionChange = async () => {
      const result = await checkMicrophonePermission();
      setStatus(result);
    };

    // Try to listen for permission changes
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          permissionStatus.addEventListener('change', handlePermissionChange);
          return () => {
            permissionStatus.removeEventListener('change', handlePermissionChange);
          };
        })
        .catch(() => {
          // Permissions API not fully supported
        });
    }
  }, [isSupported]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stopMediaStream(stream);
      }
    };
  }, [stream]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Audio is not supported in this browser');
      return false;
    }

    setIsChecking(true);
    setError(null);

    try {
      const mediaStream = await requestMicrophonePermission();
      setStream(mediaStream);
      setStatus('granted');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get microphone permission';
      setError(message);
      setStatus('denied');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isSupported]);

  const releaseStream = useCallback(() => {
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
  }, [stream]);

  return {
    status,
    isChecking,
    isSupported,
    error,
    stream,
    requestPermission,
    releaseStream,
  };
}

export default useAudioPermission;
