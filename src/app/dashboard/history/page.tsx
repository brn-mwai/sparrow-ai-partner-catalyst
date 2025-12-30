'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { generateUserProgressReport, type UserReportData } from '@/lib/reports/user-report-generator';
import type { CallType, CallOutcome, CallStatus } from '@/types/database';

interface CallRecord {
  id: string;
  type: CallType;
  persona_name: string;
  persona_title: string;
  persona_company: string;
  status: CallStatus;
  duration_seconds: number | null;
  overall_score: number | null;
  outcome: CallOutcome | null;
  created_at: string;
  completed_at: string | null;
}

const callTypeLabels: Record<CallType, { label: string; icon: string }> = {
  cold_call: { label: 'Cold Call', icon: 'ph-phone-outgoing' },
  discovery: { label: 'Discovery', icon: 'ph-magnifying-glass' },
  objection_gauntlet: { label: 'Objection Gauntlet', icon: 'ph-shield' },
};

const outcomeLabels: Record<CallOutcome, { label: string; color: string }> = {
  meeting_booked: { label: 'Meeting Booked', color: '#10b981' },
  callback: { label: 'Callback', color: '#f59e0b' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  no_decision: { label: 'No Decision', color: '#6b7280' },
};

export default function HistoryPage() {
  const { user } = useUser();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | CallType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/calls');
      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
      }
    } catch (err) {
      console.error('Failed to fetch calls:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportHistory = useCallback(async () => {
    if (!user || calls.length === 0) return;

    setIsGenerating(true);
    try {
      const completedCalls = calls.filter(c => c.status === 'completed');
      const totalDuration = completedCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
      const avgScore = completedCalls.filter(c => c.overall_score).length > 0
        ? completedCalls.filter(c => c.overall_score).reduce((sum, c) => sum + (c.overall_score || 0), 0) / completedCalls.filter(c => c.overall_score).length
        : null;

      const outcomes = {
        meeting_booked: calls.filter(c => c.outcome === 'meeting_booked').length,
        callback: calls.filter(c => c.outcome === 'callback').length,
        rejected: calls.filter(c => c.outcome === 'rejected').length,
        no_decision: calls.filter(c => c.outcome === 'no_decision').length,
      };

      const callsByType = [
        { type: 'Cold Call', count: calls.filter(c => c.type === 'cold_call').length },
        { type: 'Discovery', count: calls.filter(c => c.type === 'discovery').length },
        { type: 'Objection Gauntlet', count: calls.filter(c => c.type === 'objection_gauntlet').length },
      ].filter(c => c.count > 0);

      const reportData: Omit<UserReportData, 'chartImages'> = {
        userName: user.fullName || user.primaryEmailAddress?.emailAddress || 'User',
        userEmail: user.primaryEmailAddress?.emailAddress || '',
        generatedAt: new Date(),
        timeRange: 'All Calls',
        stats: {
          totalCalls: calls.length,
          totalDuration,
          avgScore,
          currentStreak: 0,
          longestStreak: 0,
        },
        skillScores: {
          opening: null,
          discovery: null,
          objection_handling: null,
          call_control: null,
          closing: null,
        },
        outcomes,
        callsByType,
        scoreHistory: completedCalls
          .filter(c => c.overall_score)
          .slice(0, 20)
          .map(c => ({
            date: c.created_at,
            score: c.overall_score || 0,
          })),
        recentCalls: calls.slice(0, 20).map(c => ({
          type: c.type,
          personaName: c.persona_name,
          score: c.overall_score,
          duration: c.duration_seconds || 0,
          date: c.created_at,
          outcome: c.outcome,
        })),
      };

      await generateUserProgressReport(reportData);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [user, calls]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return '#6b7280';
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const filteredCalls = calls
    .filter(call => filter === 'all' || call.type === filter)
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.overall_score || 0) - (a.overall_score || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const stats = {
    total: calls.length,
    completed: calls.filter(c => c.status === 'completed').length,
    avgScore: calls.filter(c => c.overall_score).reduce((sum, c) => sum + (c.overall_score || 0), 0) /
              (calls.filter(c => c.overall_score).length || 1),
    meetingsBooked: calls.filter(c => c.outcome === 'meeting_booked').length,
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Call History</h1>
          <p className="dashboard-page-subtitle">Review your past practice sessions</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportHistory}
            disabled={isGenerating || calls.length === 0}
          >
            {isGenerating ? (
              <>
                <i className="ph ph-spinner animate-spin"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="ph ph-file-pdf"></i>
                Export PDF
              </>
            )}
          </button>
          <Link href="/dashboard/practice" className="btn btn-primary">
            <i className="ph ph-plus"></i>
            New Practice
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="history-stats">
        <div className="history-stat">
          <span className="history-stat-value">{stats.total}</span>
          <span className="history-stat-label">Total Calls</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-value">{stats.completed}</span>
          <span className="history-stat-label">Completed</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-value" style={{ color: getScoreColor(stats.avgScore) }}>
            {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '--'}
          </span>
          <span className="history-stat-label">Avg Score</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-value" style={{ color: '#10b981' }}>
            {stats.meetingsBooked}
          </span>
          <span className="history-stat-label">Meetings Booked</span>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <label>Type</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | CallType)}>
            <option value="all">All Types</option>
            <option value="cold_call">Cold Calls</option>
            <option value="discovery">Discovery</option>
            <option value="objection_gauntlet">Objection Gauntlet</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}>
            <option value="date">Most Recent</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </div>

      {/* Call List */}
      <div className="history-list">
        {isLoading ? (
          <div className="history-loading">
            <i className="ph ph-spinner animate-spin"></i>
            <span>Loading calls...</span>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="history-empty">
            <i className="ph ph-phone-slash"></i>
            <h3>No calls yet</h3>
            <p>Start practicing to see your call history here</p>
            <Link href="/dashboard/practice" className="btn btn-primary">
              <i className="ph ph-phone-call"></i>
              Start Practicing
            </Link>
          </div>
        ) : (
          filteredCalls.map((call) => {
            const typeInfo = callTypeLabels[call.type];
            const outcomeInfo = call.outcome ? outcomeLabels[call.outcome] : null;

            return (
              <Link
                key={call.id}
                href={`/dashboard/call/${call.id}/debrief`}
                className="call-card"
              >
                <div className="call-card-left">
                  <div className="call-type-badge">
                    <i className={`ph ${typeInfo.icon}`}></i>
                    {typeInfo.label}
                  </div>
                  <div className="call-prospect">
                    <div className="prospect-avatar">
                      {call.persona_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="prospect-info">
                      <span className="prospect-name">{call.persona_name}</span>
                      <span className="prospect-title">{call.persona_title}</span>
                      <span className="prospect-company">
                        <i className="ph ph-buildings"></i>
                        {call.persona_company}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="call-card-center">
                  <div className="call-meta">
                    <span className="call-date">
                      <i className="ph ph-calendar"></i>
                      {formatDate(call.created_at)}
                    </span>
                    <span className="call-duration">
                      <i className="ph ph-timer"></i>
                      {formatDuration(call.duration_seconds)}
                    </span>
                  </div>
                  {outcomeInfo && (
                    <span
                      className="call-outcome"
                      style={{ color: outcomeInfo.color }}
                    >
                      {outcomeInfo.label}
                    </span>
                  )}
                </div>

                <div className="call-card-right">
                  {call.overall_score !== null ? (
                    <div
                      className="call-score"
                      style={{ color: getScoreColor(call.overall_score) }}
                    >
                      <span className="score-value">{call.overall_score.toFixed(1)}</span>
                      <span className="score-label">/10</span>
                    </div>
                  ) : (
                    <span className="call-status">
                      {call.status === 'abandoned' ? 'Abandoned' : 'In Progress'}
                    </span>
                  )}
                  <i className="ph ph-caret-right"></i>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
