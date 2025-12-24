// ============================================
// SPARROW AI - Audio Utilities
// Microphone handling, permissions, and audio processing
// ============================================

export class AudioError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AudioError';
    this.code = code;
  }
}

// -------------------- Permission Handling --------------------

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Check if the browser supports audio input
 */
export function isAudioSupported(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Check current microphone permission status
 */
export async function checkMicrophonePermission(): Promise<PermissionStatus> {
  if (!isAudioSupported()) {
    return 'unsupported';
  }

  try {
    // Try the Permissions API first (not supported in all browsers)
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      return result.state as PermissionStatus;
    }

    // Fallback: try to get user media briefly to check
    return 'prompt';
  } catch {
    return 'prompt';
  }
}

/**
 * Request microphone permission
 * Returns a MediaStream if successful
 */
export async function requestMicrophonePermission(): Promise<MediaStream> {
  if (!isAudioSupported()) {
    throw new AudioError(
      'Audio is not supported in this browser',
      'UNSUPPORTED'
    );
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // Optimal settings for voice
        sampleRate: 16000,
        channelCount: 1,
      },
    });

    return stream;
  } catch (error) {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          throw new AudioError(
            'Microphone permission denied. Please allow microphone access.',
            'PERMISSION_DENIED'
          );
        case 'NotFoundError':
          throw new AudioError(
            'No microphone found. Please connect a microphone.',
            'NOT_FOUND'
          );
        case 'NotReadableError':
          throw new AudioError(
            'Microphone is in use by another application.',
            'IN_USE'
          );
        default:
          throw new AudioError(
            `Failed to access microphone: ${error.message}`,
            'UNKNOWN'
          );
      }
    }

    throw new AudioError(
      'Failed to access microphone',
      'UNKNOWN'
    );
  }
}

/**
 * Stop all tracks in a media stream
 */
export function stopMediaStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

// -------------------- Audio Device Management --------------------

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

/**
 * Get list of available audio input devices
 */
export async function getAudioInputDevices(): Promise<AudioDevice[]> {
  if (!isAudioSupported()) {
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((device) => device.kind === 'audioinput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
        kind: 'audioinput' as const,
      }));
  } catch {
    return [];
  }
}

/**
 * Get list of available audio output devices
 */
export async function getAudioOutputDevices(): Promise<AudioDevice[]> {
  if (!isAudioSupported()) {
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((device) => device.kind === 'audiooutput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
        kind: 'audiooutput' as const,
      }));
  } catch {
    return [];
  }
}

// -------------------- Audio Analysis --------------------

/**
 * Create an audio analyzer for visualizing audio levels
 */
export function createAudioAnalyzer(
  stream: MediaStream,
  options?: { fftSize?: number; smoothingTimeConstant?: number }
): {
  analyser: AnalyserNode;
  getLevel: () => number;
  getFrequencyData: () => Uint8Array;
  cleanup: () => void;
} {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();

  analyser.fftSize = options?.fftSize || 256;
  analyser.smoothingTimeConstant = options?.smoothingTimeConstant || 0.8;

  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const getLevel = (): number => {
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = (dataArray[i] - 128) / 128;
      sum += value * value;
    }
    return Math.sqrt(sum / dataArray.length);
  };

  const getFrequencyData = (): Uint8Array => {
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);
    return frequencyData;
  };

  const cleanup = (): void => {
    source.disconnect();
    audioContext.close();
  };

  return { analyser, getLevel, getFrequencyData, cleanup };
}

// -------------------- Audio Level Detection --------------------

export type SpeakingState = 'silent' | 'speaking' | 'stopped';

/**
 * Create a voice activity detector
 */
export function createVoiceActivityDetector(
  stream: MediaStream,
  options?: {
    threshold?: number;
    debounceMs?: number;
    onStateChange?: (state: SpeakingState) => void;
  }
): {
  start: () => void;
  stop: () => void;
  getState: () => SpeakingState;
} {
  const threshold = options?.threshold || 0.01;
  const debounceMs = options?.debounceMs || 300;

  const { getLevel, cleanup } = createAudioAnalyzer(stream);

  let state: SpeakingState = 'silent';
  let animationFrame: number | null = null;
  let lastSpeakingTime = 0;

  const checkLevel = (): void => {
    const level = getLevel();
    const now = Date.now();

    if (level > threshold) {
      lastSpeakingTime = now;
      if (state !== 'speaking') {
        state = 'speaking';
        options?.onStateChange?.('speaking');
      }
    } else if (state === 'speaking' && now - lastSpeakingTime > debounceMs) {
      state = 'stopped';
      options?.onStateChange?.('stopped');
      // After a brief pause, go back to silent
      setTimeout(() => {
        if (state === 'stopped') {
          state = 'silent';
          options?.onStateChange?.('silent');
        }
      }, 500);
    }

    animationFrame = requestAnimationFrame(checkLevel);
  };

  return {
    start: () => {
      if (animationFrame === null) {
        checkLevel();
      }
    },
    stop: () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      cleanup();
    },
    getState: () => state,
  };
}

// -------------------- Connection Quality --------------------

export interface ConnectionQuality {
  rtt: number; // Round-trip time in ms
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Estimate connection quality based on various metrics
 */
export async function estimateConnectionQuality(): Promise<ConnectionQuality> {
  // Use the Network Information API if available
  const connection = (navigator as any).connection;

  if (connection) {
    const rtt = connection.rtt || 0;
    let quality: ConnectionQuality['quality'];

    if (rtt < 50) {
      quality = 'excellent';
    } else if (rtt < 100) {
      quality = 'good';
    } else if (rtt < 200) {
      quality = 'fair';
    } else {
      quality = 'poor';
    }

    return { rtt, quality };
  }

  // Fallback: do a quick ping test
  try {
    const start = performance.now();
    await fetch('/api/health', { method: 'HEAD' });
    const rtt = performance.now() - start;

    let quality: ConnectionQuality['quality'];
    if (rtt < 100) {
      quality = 'excellent';
    } else if (rtt < 200) {
      quality = 'good';
    } else if (rtt < 400) {
      quality = 'fair';
    } else {
      quality = 'poor';
    }

    return { rtt: Math.round(rtt), quality };
  } catch {
    return { rtt: -1, quality: 'poor' };
  }
}

// -------------------- Exports --------------------

export default {
  isAudioSupported,
  checkMicrophonePermission,
  requestMicrophonePermission,
  stopMediaStream,
  getAudioInputDevices,
  getAudioOutputDevices,
  createAudioAnalyzer,
  createVoiceActivityDetector,
  estimateConnectionQuality,
};
