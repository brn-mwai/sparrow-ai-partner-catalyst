'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TranscriptCoach } from '@/components/debrief/transcript-coach';
import type { CallOutcome, FeedbackType, FeedbackCategory, PersonaConfig } from '@/types/database';

interface CallResult {
  callId: string;
  type?: 'cold_call' | 'discovery' | 'objection_gauntlet';
  duration_seconds: number;
  scores: {
    overall: number;
    categories: {
      opening: number;
      discovery: number;
      objection_handling: number;
      call_control: number;
      closing: number;
    };
    outcome: CallOutcome;
  };
  feedback: Array<{
    category: FeedbackCategory;
    timestamp_ms: number;
    type: FeedbackType;
    content: string;
    suggestion?: string;
    excerpt?: string;
  }>;
  transcript: Array<{
    speaker: 'user' | 'prospect';
    content: string;
    timestamp_ms: number;
  }>;
  persona: PersonaConfig;
}

const categoryLabels: Record<string, string> = {
  opening: 'Opening',
  discovery: 'Discovery',
  objection: 'Objection Handling',
  objection_handling: 'Objection Handling', // Legacy support
  communication: 'Call Control',
  call_control: 'Call Control', // Legacy support
  closing: 'Closing',
};

const outcomeLabels: Record<CallOutcome, { label: string; icon: string; color: string }> = {
  meeting_booked: { label: 'Meeting Booked!', icon: 'ph-calendar-check', color: '#10b981' },
  callback: { label: 'Callback Scheduled', icon: 'ph-phone-incoming', color: '#f59e0b' },
  rejected: { label: 'Rejected', icon: 'ph-x-circle', color: '#ef4444' },
  no_decision: { label: 'No Decision', icon: 'ph-question', color: '#6b7280' },
};

export default function DebriefPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;

  const [result, setResult] = useState<CallResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feedback' | 'transcript'>('feedback');
  const [error, setError] = useState<string | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  useEffect(() => {
    loadCallResult();
  }, [callId]);

  const loadCallResult = async () => {
    setIsLoading(true);
    try {
      // First try to get from sessionStorage (if just ended)
      const stored = sessionStorage.getItem(`call_result_${callId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Get persona and call type from call data
        const callData = sessionStorage.getItem(`call_${callId}`);
        if (callData) {
          const callDataParsed = JSON.parse(callData);
          parsed.persona = callDataParsed.persona;
          parsed.type = callDataParsed.callType;
        }
        setResult(parsed);
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from API
      const response = await fetch(`/api/calls/${callId}`);
      if (!response.ok) {
        throw new Error('Failed to load call data');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load call data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getFeedbackIcon = (type: FeedbackType) => {
    switch (type) {
      case 'positive':
        return { icon: 'ph-check-circle', color: '#10b981' };
      case 'negative':
        return { icon: 'ph-x-circle', color: '#ef4444' };
      case 'missed_opportunity':
        return { icon: 'ph-warning-circle', color: '#f59e0b' };
    }
  };

  // Strip XML tags like <Sparrow-1>...</Sparrow-1> from transcript content
  const stripXmlTags = (text: string): string => {
    return text
      .replace(/<[^>]+>/g, '') // Remove all XML/HTML tags
      .trim();
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="debrief-loading">
          <i className="ph ph-spinner animate-spin"></i>
          <h2>Analyzing your call...</h2>
          <p>This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="dashboard-page">
        <div className="debrief-error">
          <i className="ph ph-warning-circle"></i>
          <h2>Could not load call data</h2>
          <p>{error || 'Call data not found'}</p>
          <Link href="/dashboard/history" className="btn btn-primary">
            View Call History
          </Link>
        </div>
      </div>
    );
  }

  const { scores, feedback, transcript, persona } = result;
  const outcomeInfo = outcomeLabels[scores.outcome];

  return (
    <div className={`debrief-page-wrapper ${isCoachOpen ? 'coach-open' : ''}`}>
    <div className="dashboard-page debrief-page">
      {/* Header */}
      <div className="dashboard-page-header debrief-header">
        <div>
          <Link href="/dashboard" className="back-link">
            <i className="ph ph-arrow-left"></i>
            Back to Dashboard
          </Link>
          <h1 className="dashboard-page-title">Call Debrief</h1>
          <p className="dashboard-page-subtitle">
            <i className="ph ph-timer"></i>
            Duration: {formatDuration(result.duration_seconds)}
          </p>
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="dashboard-card outcome-banner" style={{ backgroundColor: `${outcomeInfo.color}10`, borderColor: outcomeInfo.color }}>
        <i className={`ph ${outcomeInfo.icon}`} style={{ color: outcomeInfo.color, fontSize: '1.5rem' }}></i>
        <span style={{ color: outcomeInfo.color, fontWeight: 600, fontSize: '1.125rem' }}>{outcomeInfo.label}</span>
      </div>

      {/* Prospect Info */}
      {persona && (
        <div className="dashboard-card prospect-summary">
          <div className="prospect-avatar">
            {persona.name ? persona.name.split(' ').map(n => n[0]).join('') : '?'}
          </div>
          <div className="prospect-details">
            <span className="prospect-name">{persona.name}</span>
            <span className="prospect-title">{persona.title}</span>
            <span className="prospect-company">
              <i className="ph ph-buildings"></i>
              {persona.company}
            </span>
          </div>
        </div>
      )}

      {/* Overall Score */}
      <div className="dashboard-card overall-score-card">
        <div className="score-display">
          <span className="score-value" style={{ color: getScoreColor(scores.overall) }}>
            {scores.overall.toFixed(1)}
          </span>
          <span className="score-max">/10</span>
        </div>
        <span className="score-label">Overall Score</span>
      </div>

      {/* Category Scores */}
      <div className="dashboard-card score-breakdown">
        <h3>Score Breakdown</h3>
        <div className="category-scores">
          {Object.entries(scores.categories).map(([key, value]) => {
            const label = categoryLabels[key] || key;
            const color = getScoreColor(value);

            return (
              <div key={key} className="category-score">
                <div className="category-header">
                  <span className="category-name">{label}</span>
                  <span className="category-value" style={{ color }}>
                    {value.toFixed(1)}
                  </span>
                </div>
                <div className="category-bar-container">
                  <div
                    className="category-bar"
                    style={{
                      width: `${(value / 10) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="debrief-tabs">
        <button
          className={activeTab === 'feedback' ? 'active' : ''}
          onClick={() => setActiveTab('feedback')}
        >
          <i className="ph ph-lightbulb"></i>
          Key Moments
          {feedback.length > 0 && (
            <span className="tab-badge">{feedback.length}</span>
          )}
        </button>
        <button
          className={activeTab === 'transcript' ? 'active' : ''}
          onClick={() => setActiveTab('transcript')}
        >
          <i className="ph ph-chats"></i>
          Transcript
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-card debrief-content">
        {activeTab === 'feedback' && (
          <div className="feedback-list">
            {feedback.length === 0 ? (
              <div className="feedback-empty">
                <i className="ph ph-chat-circle-text"></i>
                <p>No specific feedback for this call</p>
              </div>
            ) : (
              feedback
                .sort((a, b) => a.timestamp_ms - b.timestamp_ms)
                .map((item, index) => {
                  const feedbackStyle = getFeedbackIcon(item.type);
                  return (
                    <div key={index} className={`feedback-item ${item.type}`}>
                      <div className="feedback-header">
                        <span className="feedback-timestamp">
                          <i className="ph ph-clock"></i>
                          {formatTimestamp(item.timestamp_ms)}
                        </span>
                        <span className="feedback-category">
                          {categoryLabels[item.category] || item.category}
                        </span>
                        <i
                          className={`ph ${feedbackStyle.icon}`}
                          style={{ color: feedbackStyle.color }}
                        ></i>
                      </div>
                      <p className="feedback-content">{item.content}</p>
                      {item.excerpt && (
                        <blockquote className="feedback-excerpt">
                          "{item.excerpt}"
                        </blockquote>
                      )}
                      {item.suggestion && (
                        <div className="feedback-suggestion">
                          <i className="ph ph-lightbulb"></i>
                          <span>{item.suggestion}</span>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="transcript-view">
            {transcript.length === 0 ? (
              <div className="transcript-empty">
                <i className="ph ph-chat-circle-text"></i>
                <p>No transcript available</p>
              </div>
            ) : (
              transcript.map((msg, index) => (
                <div key={index} className={`transcript-message ${msg.speaker}`}>
                  <div className="message-header">
                    <span className="message-speaker">
                      {msg.speaker === 'user' ? 'You' : persona?.name.split(' ')[0] || 'Prospect'}
                    </span>
                    <span className="message-time">
                      {formatTimestamp(msg.timestamp_ms)}
                    </span>
                  </div>
                  <p className="message-content">{stripXmlTags(msg.content)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="debrief-actions">
        <Link href="/dashboard/practice" className="btn btn-secondary">
          <i className="ph ph-arrows-clockwise"></i>
          Try Again
        </Link>
        <Link href="/dashboard/history" className="btn btn-secondary">
          <i className="ph ph-clock-counter-clockwise"></i>
          View History
        </Link>
        <Link href="/dashboard" className="btn btn-primary">
          <i className="ph ph-house"></i>
          Back to Dashboard
        </Link>
      </div>
    </div>

    {/* Coach Sparrow Transcript Analysis Panel */}
    <TranscriptCoach
      transcript={transcript}
      prospectName={persona?.name || 'Prospect'}
      callType={result.type || 'cold_call'}
      scores={scores}
      isOpen={isCoachOpen}
      onToggle={() => setIsCoachOpen(!isCoachOpen)}
    />
    </div>
  );
}
