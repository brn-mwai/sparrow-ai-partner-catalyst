'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConversation } from '@elevenlabs/react';
import type { PersonaConfig, TranscriptMessage } from '@/types/database';

// ============================================
// CREDIT MANAGEMENT - Demo Mode Configuration
// ============================================
const DEMO_MODE = {
  // Maximum call duration in seconds (2 minutes to save credits)
  MAX_DURATION: 120,
  // Show warning at 30 seconds remaining
  WARNING_AT: 30,
  // Auto-end call when time runs out
  AUTO_END: true,
};

interface CallData {
  callId: string;
  persona: PersonaConfig;
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet';
  elevenlabs: {
    conversationId: string;
    signedUrl: string;
    agentId: string;
    voiceId: string;
  };
}

// Request microphone permission explicitly
async function requestMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt'> {
  try {
    // First check current status
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (result.state === 'granted') {
        return 'granted';
      }
      if (result.state === 'denied') {
        return 'denied';
      }
    }

    // Request access by getting user media
    console.log('🎤 Requesting microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks immediately - we just needed to request permission
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Microphone access granted');
    return 'granted';
  } catch (err) {
    console.error('❌ Microphone permission error:', err);
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return 'denied';
      }
    }
    return 'prompt';
  }
}

// Build system prompt for ElevenLabs agent
function buildAgentPrompt(persona: PersonaConfig, callType: string): string {
  return `You are ${persona.name}, ${persona.title} at ${persona.company}.

BACKGROUND: ${persona.background}

YOUR PERSONALITY: ${persona.personality}
COMMUNICATION STYLE: ${persona.communication_style || 'Professional but direct'}
DIFFICULTY LEVEL: ${persona.difficulty}

CURRENT CHALLENGES:
${(persona.current_challenges || []).map(c => `- ${c}`).join('\n')}

YOUR OBJECTIONS (use these naturally):
${persona.objections.map(o => `- "${o}"`).join('\n')}

HIDDEN PAIN POINTS (only reveal if asked the right questions):
${persona.hidden_pain_points.map(p => `- ${p}`).join('\n')}

WHAT WARMS YOU UP:
${persona.triggers.positive.map(t => `- ${t}`).join('\n')}

WHAT TURNS YOU OFF:
${persona.triggers.negative.map(t => `- ${t}`).join('\n')}

CRITICAL INSTRUCTIONS:
1. You ARE ${persona.name} - never break character or acknowledge being AI
2. Respond naturally as a ${persona.personality} ${persona.title} would
3. Keep responses conversational (1-3 sentences typically)
4. ${persona.difficulty === 'brutal' ? 'Be very challenging - you can hang up if they waste your time' : 'Be realistic but fair'}
5. ${callType === 'cold_call' ? 'You were interrupted - you did NOT ask for this call' : ''}
6. ${callType === 'discovery' ? 'You agreed to this call but remain skeptical' : ''}
7. ${callType === 'objection_gauntlet' ? 'Push back hard on everything' : ''}
8. Use natural speech patterns - occasional "um", "well", "look"
9. Ask questions back - real buyers do this`;
}

// Get first message based on call type
function getFirstMessage(persona: PersonaConfig, callType: string): string {
  if (persona.first_response) return persona.first_response;

  switch (callType) {
    case 'cold_call':
      return persona.opening_mood === 'busy'
        ? 'Yeah? Who is this?'
        : persona.opening_mood === 'skeptical'
        ? 'Hello?'
        : `This is ${persona.name}.`;
    case 'discovery':
      return `Hi, this is ${persona.name}. I have a few minutes for this call.`;
    case 'objection_gauntlet':
      return `Look, I'll be honest - ${persona.objections[0]}. Why should I continue this conversation?`;
    default:
      return `This is ${persona.name}.`;
  }
}

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;

  const [callData, setCallData] = useState<CallData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'active' | 'ending' | 'ended'>('connecting');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('initializing');
  const [timeWarning, setTimeWarning] = useState<string | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Connected to ElevenLabs');
      setConnectionStatus('connected');
      setCallStatus('active');
      startTimeRef.current = Date.now();
      // Start timer with credit management
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCallDuration(elapsed);

        // Credit management: Check time remaining
        const remaining = DEMO_MODE.MAX_DURATION - elapsed;

        if (remaining <= 0 && DEMO_MODE.AUTO_END) {
          // Time's up - auto-end call
          setTimeWarning('⏱️ Time limit reached! Ending call to save credits...');
        } else if (remaining <= DEMO_MODE.WARNING_AT && remaining > 0) {
          // Show warning
          setTimeWarning(`⚠️ ${remaining}s remaining - wrap up your call!`);
        } else {
          setTimeWarning(null);
        }
      }, 1000);
    },
    onDisconnect: () => {
      console.log('🔌 Disconnected from ElevenLabs');
      setConnectionStatus('disconnected');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    },
    onMessage: (message) => {
      console.log('💬 Message received:', message);
      const newMessage: TranscriptMessage = {
        speaker: message.source === 'user' ? 'user' : 'prospect',
        content: message.message,
        timestamp_ms: Date.now() - startTimeRef.current,
      };
      setTranscript((prev) => [...prev, newMessage]);
    },
    onError: (error) => {
      console.error('❌ ElevenLabs error:', error);
      setConnectionStatus(`error: ${error}`);
      setSessionStarted(false); // Allow retry
      setError(`Voice connection error: ${error}. Please try again.`);
    },
    onStatusChange: (status) => {
      console.log('📊 ElevenLabs status changed:', status);
      setConnectionStatus(status.toString());
    },
  });

  // Fetch call data
  useEffect(() => {
    const fetchCallData = async () => {
      try {
        // Call data should be stored in sessionStorage from the practice page
        const storedData = sessionStorage.getItem(`call_${callId}`);
        if (storedData) {
          setCallData(JSON.parse(storedData));
          setIsLoading(false);
          return;
        }

        // If not in session storage, try to fetch from API
        // This allows direct URL access for active calls
        try {
          const response = await fetch(`/api/calls/${callId}`);
          if (response.ok) {
            const data = await response.json();
            // Check if call is still active and can be resumed
            if (data.status === 'active' && data.persona) {
              // Need to re-initialize ElevenLabs session - redirect to practice
              setError('This call session has expired. Please start a new practice session.');
              setIsLoading(false);
              return;
            }
            // If call is completed, redirect to debrief
            if (data.status === 'completed') {
              router.push(`/dashboard/call/${callId}/debrief`);
              return;
            }
          }
        } catch (apiErr) {
          console.error('API fetch error:', apiErr);
        }

        setError('Call data not found. Please start a new practice session.');
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load call data');
        setIsLoading(false);
      }
    };

    fetchCallData();
  }, [callId, router]);

  // Request microphone permission on mount
  useEffect(() => {
    const requestMicAccess = async () => {
      console.log('🎤 Checking microphone permission...');
      const status = await requestMicrophonePermission();
      console.log('🎤 Microphone permission result:', status);
      setMicPermission(status);
      if (status === 'denied') {
        setError('Microphone access was denied. Please enable microphone access in your browser settings and refresh the page.');
      }
    };
    requestMicAccess();
  }, []);

  // Start conversation when data is ready AND mic permission is granted
  useEffect(() => {
    let mounted = true;

    const startConversation = async () => {
      // Only start once, when we have data AND mic is granted
      if (
        callData?.elevenlabs.signedUrl &&
        callStatus === 'connecting' &&
        micPermission === 'granted' && // Must be granted, not just "not denied"
        !sessionStarted &&
        mounted
      ) {
        try {
          console.log('🚀 Starting ElevenLabs session...');
          console.log('📍 Signed URL:', callData.elevenlabs.signedUrl.substring(0, 80) + '...');
          console.log('🎤 Mic permission:', micPermission);

          setSessionStarted(true);
          setConnectionStatus('starting session...');

          // Build the persona prompt and first message
          const { persona, callType, elevenlabs } = callData;
          const prompt = buildAgentPrompt(persona, callType);
          const firstMessage = getFirstMessage(persona, callType);

          console.log('👤 Persona:', persona.name);
          console.log('💬 First message:', firstMessage);
          console.log('🔊 Voice ID:', elevenlabs.voiceId);
          console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');

          // Start the session with dynamic variables and voice override
          // These fill in the {{variable}} placeholders in the ElevenLabs agent
          console.log('🔧 Starting with dynamic variables and voice override...');
          console.log('🔊 Using voice ID:', elevenlabs.voiceId);

          await conversation.startSession({
            signedUrl: callData.elevenlabs.signedUrl,
            // Override voice based on persona gender (using new account voice IDs)
            overrides: {
              tts: {
                voiceId: elevenlabs.voiceId,
              },
            },
            dynamicVariables: {
              persona_name: persona.name,
              persona_title: persona.title,
              persona_company: persona.company,
              persona_industry: persona.industry,
              persona_company_size: persona.company_size,
              persona_tenure: persona.tenure_months ? `${persona.tenure_months} months` : '6 months',
              call_type: callType,
              persona_background: persona.background,
              persona_personality: persona.personality,
              persona_communication_style: persona.communication_style || 'Professional',
              persona_challenges: (persona.current_challenges || []).join(', '),
              persona_objections: persona.objections.join(', '),
              persona_pain_points: persona.hidden_pain_points.join(', '),
              persona_positive_triggers: persona.triggers.positive.join(', '),
              persona_negative_triggers: persona.triggers.negative.join(', '),
              persona_difficulty: persona.difficulty,
              call_type_instructions: callType === 'cold_call'
                ? 'You were interrupted by this cold call. You did NOT ask for this call.'
                : callType === 'discovery'
                ? 'You agreed to this discovery call but remain skeptical.'
                : 'Push back hard on everything - this is objection practice.',
              first_message: firstMessage,
            },
          });

          console.log('✅ ElevenLabs session start call completed');
        } catch (err) {
          console.error('❌ Failed to start ElevenLabs session:', err);
          if (mounted) {
            setSessionStarted(false); // Allow retry
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setConnectionStatus(`failed: ${errorMsg}`);
            setError(`Failed to connect to voice agent: ${errorMsg}. Please try again.`);
          }
        }
      }
    };

    startConversation();

    return () => {
      mounted = false;
    };
  }, [callData, callStatus, micPermission, sessionStarted, conversation]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleEndCall = useCallback(async () => {
    setCallStatus('ending');

    try {
      // End ElevenLabs session
      await conversation.endSession();

      // Send end call request to API with transcript
      const response = await fetch(`/api/calls/${callId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_seconds: callDuration,
          transcript: transcript, // Send client-captured transcript
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API error:', result);
        throw new Error(result.error || 'Failed to end call');
      }

      // Store result for debrief page
      sessionStorage.setItem(`call_result_${callId}`, JSON.stringify(result));

      setCallStatus('ended');

      // Redirect to debrief
      router.push(`/dashboard/call/${callId}/debrief`);
    } catch (err) {
      console.error('End call error:', err);
      setError('Failed to end call properly');
      setCallStatus('active');
    }
  }, [callId, callDuration, conversation, router, transcript]);

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      conversation.setVolume({ volume: 1 });
    } else {
      conversation.setVolume({ volume: 0 });
    }
    setIsMuted(!isMuted);
  }, [conversation, isMuted]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Strip XML tags like <Sparrow-1>...</Sparrow-1> from transcript content
  const stripXmlTags = (text: string): string => {
    return text
      .replace(/<[^>]+>/g, '') // Remove all XML/HTML tags
      .trim();
  };

  // Handle retry
  const handleRetry = useCallback(async () => {
    console.log('🔄 Retrying connection...');
    setError(null);
    setSessionStarted(false);
    setCallStatus('connecting');
    setConnectionStatus('retrying...');
    // Re-request mic permission
    const status = await requestMicrophonePermission();
    setMicPermission(status);
    // End any existing session first
    try {
      await conversation.endSession();
    } catch {
      // Ignore errors when ending non-existent session
    }
  }, [conversation]);

  if (isLoading) {
    return (
      <div className="call-page loading">
        <div className="loading-spinner">
          <i className="ph ph-spinner animate-spin"></i>
          <span>Preparing your call...</span>
        </div>
      </div>
    );
  }

  if (error || !callData) {
    return (
      <div className="call-page error">
        <div className="error-content">
          <i className="ph ph-warning-circle"></i>
          <h2>Something went wrong</h2>
          <p>{error || 'Call data not found'}</p>
          <div className="error-actions">
            {callData && (
              <button onClick={handleRetry} className="btn-secondary">
                <i className="ph ph-arrows-clockwise"></i>
                Retry Connection
              </button>
            )}
            <button onClick={() => router.push('/dashboard/practice')} className="btn-primary">
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { persona } = callData;

  return (
    <div className="call-page">
      {/* Call Status Bar */}
      <div className={`call-status-bar ${callStatus}`}>
        <div className="call-status-indicator">
          {callStatus === 'connecting' && (
            <>
              <i className="ph ph-spinner animate-spin"></i>
              <span>
                {micPermission === 'checking'
                  ? 'Checking microphone...'
                  : micPermission === 'denied'
                  ? 'Microphone denied'
                  : micPermission === 'prompt'
                  ? 'Requesting microphone access...'
                  : sessionStarted
                  ? 'Connecting to agent...'
                  : 'Preparing call...'}
              </span>
            </>
          )}
          {callStatus === 'active' && (
            <>
              <span className="recording-dot"></span>
              <span>Call in Progress</span>
              {conversation.micMuted && <span className="mic-muted-indicator"> (Mic Muted)</span>}
            </>
          )}
          {callStatus === 'ending' && (
            <>
              <i className="ph ph-spinner animate-spin"></i>
              <span>Ending call...</span>
            </>
          )}
        </div>
        <div className="call-status-right">
          {callStatus === 'connecting' && sessionStarted && (
            <button
              onClick={handleRetry}
              className="retry-btn"
              style={{ marginRight: '10px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
            >
              Retry
            </button>
          )}
          <span className="call-status-badge" title={`SDK: ${conversation.status} | Internal: ${connectionStatus}`}>
            {conversation.status}
          </span>
          <div className="call-timer">
            <i className="ph ph-timer"></i>
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>

      {/* Main Call Area */}
      <div className="call-main">
        {/* Prospect Info */}
        <div className="prospect-display">
          <div className="prospect-avatar-large">
            <div className={`avatar-ring ${conversation.isSpeaking ? 'speaking' : ''}`}>
              <div className="avatar-inner">
                {persona.name ? persona.name.split(' ').map((n) => n[0]).join('') : '?'}
              </div>
            </div>
          </div>
          {/* Voice waveform visualization - below avatar */}
          {conversation.isSpeaking && (
            <div className="waveform-container">
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
              <div className="waveform-bar"></div>
            </div>
          )}
          <h2 className="prospect-name">{persona.name}</h2>
          <p className="prospect-title">{persona.title}</p>
          <p className="prospect-company">
            <i className="ph ph-buildings"></i>
            {persona.company}
          </p>
        </div>

        {/* Goal Reminder */}
        <div className="call-goal">
          <i className="ph ph-target"></i>
          <span>{persona.goal_for_rep}</span>
        </div>
      </div>

      {/* Transcript Panel */}
      <div className="transcript-panel">
        <div className="transcript-header">
          <i className="ph ph-chats"></i>
          Live Transcript
        </div>
        <div className="transcript-content">
          {transcript.length === 0 ? (
            <div className="transcript-empty">
              <p>Conversation will appear here...</p>
            </div>
          ) : (
            transcript.map((msg, i) => (
              <div key={i} className={`transcript-message ${msg.speaker}`}>
                <span className="message-speaker">
                  {msg.speaker === 'user' ? 'You' : persona.name.split(' ')[0]}
                </span>
                <span className="message-content">{stripXmlTags(msg.content)}</span>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Debug Panel - Shows connection details */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel" style={{
          position: 'fixed',
          bottom: '80px',
          right: '10px',
          background: 'rgba(0,0,0,0.85)',
          color: '#00ff00',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          maxWidth: '300px',
          zIndex: 1000,
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>SDK Status: {conversation.status}</div>
          <div>Internal: {connectionStatus}</div>
          <div>Mic: {micPermission}</div>
          <div>Session: {sessionStarted ? 'started' : 'not started'}</div>
          <div>Call Status: {callStatus}</div>
          <div>Speaking: {conversation.isSpeaking ? 'yes' : 'no'}</div>
          <div>Agent ID: {callData?.elevenlabs.agentId?.substring(0, 10)}...</div>
          <div>Transcript: {transcript.length} msgs</div>
        </div>
      )}

      {/* Call Controls */}
      <div className="call-controls">
        <button
          className={`control-btn mute ${isMuted ? 'active' : ''}`}
          onClick={handleToggleMute}
          disabled={callStatus !== 'active'}
        >
          <i className={`ph ${isMuted ? 'ph-microphone-slash' : 'ph-microphone'}`}></i>
          <span>{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          className="control-btn end-call"
          onClick={handleEndCall}
          disabled={callStatus === 'ending' || callStatus === 'connecting'}
        >
          <i className="ph ph-phone-disconnect"></i>
          <span>End Call</span>
        </button>

        <button className="control-btn info" disabled>
          <i className="ph ph-info"></i>
          <span>Tips</span>
        </button>
      </div>
    </div>
  );
}
