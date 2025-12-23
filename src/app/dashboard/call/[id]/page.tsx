'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConversation } from '@elevenlabs/react';
import type { PersonaConfig, TranscriptMessage } from '@/types/database';

interface CallData {
  callId: string;
  persona: PersonaConfig;
  elevenlabs: {
    conversationId: string;
    signedUrl: string;
    voiceId: string;
  };
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

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setCallStatus('active');
      startTimeRef.current = Date.now();
      // Start timer
      timerRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    },
    onMessage: (message) => {
      const newMessage: TranscriptMessage = {
        speaker: message.source === 'user' ? 'user' : 'prospect',
        content: message.message,
        timestamp_ms: Date.now() - startTimeRef.current,
      };
      setTranscript((prev) => [...prev, newMessage]);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      setError('Voice connection error. Please try again.');
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

        // If not in session storage, we need to redirect back
        // In a real app, we'd fetch from API
        setError('Call data not found. Please start a new practice session.');
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load call data');
        setIsLoading(false);
      }
    };

    fetchCallData();
  }, [callId]);

  // Start conversation when data is ready
  useEffect(() => {
    if (callData?.elevenlabs.signedUrl && callStatus === 'connecting') {
      conversation.startSession({
        signedUrl: callData.elevenlabs.signedUrl,
      });
    }

    return () => {
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
    };
  }, [callData]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleEndCall = useCallback(async () => {
    setCallStatus('ending');

    try {
      // End ElevenLabs session
      await conversation.endSession();

      // Send end call request to API
      const response = await fetch(`/api/calls/${callId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_seconds: callDuration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end call');
      }

      const result = await response.json();

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
  }, [callId, callDuration, conversation, router]);

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
          <button onClick={() => router.push('/dashboard/practice')} className="btn-primary">
            Back to Practice
          </button>
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
              <span>Connecting...</span>
            </>
          )}
          {callStatus === 'active' && (
            <>
              <span className="recording-dot"></span>
              <span>Call in Progress</span>
            </>
          )}
          {callStatus === 'ending' && (
            <>
              <i className="ph ph-spinner animate-spin"></i>
              <span>Ending call...</span>
            </>
          )}
        </div>
        <div className="call-timer">
          <i className="ph ph-timer"></i>
          {formatDuration(callDuration)}
        </div>
      </div>

      {/* Main Call Area */}
      <div className="call-main">
        {/* Prospect Info */}
        <div className="prospect-display">
          <div className="prospect-avatar-large">
            <div className={`avatar-ring ${conversation.isSpeaking ? 'speaking' : ''}`}>
              <div className="avatar-inner">
                {persona.name.split(' ').map((n) => n[0]).join('')}
              </div>
            </div>
            {/* Voice waveform visualization */}
            {conversation.isSpeaking && (
              <div className="waveform-container">
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
                <div className="waveform-bar"></div>
              </div>
            )}
          </div>
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
                <span className="message-content">{msg.content}</span>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

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
