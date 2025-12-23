'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { DashboardTour } from '@/components/tour';
import type { CallType } from '@/types/database';

interface Stats {
  totalCalls: number;
  avgScore: number | null;
  currentStreak: number;
  callsThisWeek: number;
}

interface SkillScores {
  opening: number | null;
  discovery: number | null;
  objection_handling: number | null;
  call_control: number | null;
  closing: number | null;
}

interface RecentCall {
  id: string;
  type: CallType;
  persona_name: string;
  persona_title: string;
  overall_score: number | null;
  duration_seconds: number | null;
  created_at: string;
}

const practiceTypes = [
  {
    id: 'cold_call',
    label: 'Cold Call',
    icon: 'ph-phone-outgoing',
    description: 'Practice opening calls and booking meetings',
    color: '#6366f1',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    icon: 'ph-magnifying-glass',
    description: 'Practice uncovering pain points',
    color: '#10b981',
  },
  {
    id: 'objection_gauntlet',
    label: 'Objections',
    icon: 'ph-shield',
    description: 'Handle common pushback scenarios',
    color: '#f59e0b',
  },
];

const skillLabels: Record<string, string> = {
  opening: 'Opening',
  discovery: 'Discovery',
  objection_handling: 'Objection Handling',
  call_control: 'Call Control',
  closing: 'Closing',
};

export default function DashboardPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCalls: 0,
    avgScore: null,
    currentStreak: 0,
    callsThisWeek: 0,
  });
  const [skillScores, setSkillScores] = useState<SkillScores>({
    opening: null,
    discovery: null,
    objection_handling: null,
    call_control: null,
    closing: null,
  });
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [focusArea, setFocusArea] = useState<{ skill: string; label: string } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch progress data
      const progressRes = await fetch('/api/user/progress?range=7d');
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        if (progressData.progress) {
          const p = progressData.progress;
          setStats({
            totalCalls: p.total_calls,
            avgScore: p.avg_overall_score,
            currentStreak: p.current_streak,
            callsThisWeek: p.total_calls, // For 7d range, this is the week's calls
          });
          setSkillScores(p.skill_scores || skillScores);

          // Find weakest skill for focus area
          const skills = Object.entries(p.skill_scores || {})
            .filter(([_, v]) => v !== null) as [string, number][];
          if (skills.length > 0) {
            const weakest = skills.sort(([_, a], [__, b]) => a - b)[0];
            setFocusArea({
              skill: weakest[0],
              label: skillLabels[weakest[0]] || weakest[0],
            });
          }
        }
      }

      // Fetch recent calls
      const callsRes = await fetch('/api/calls');
      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setRecentCalls((callsData.calls || []).slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: CallType) => {
    switch (type) {
      case 'cold_call':
        return 'Cold Call';
      case 'discovery':
        return 'Discovery';
      case 'objection_gauntlet':
        return 'Objections';
      default:
        return type;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return '#6b7280';
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getFocusMessage = () => {
    if (!focusArea) {
      return 'Complete some practice calls to identify areas for improvement.';
    }
    const messages: Record<string, string> = {
      opening: 'Your openers could be stronger. Focus on earning attention in the first 10 seconds.',
      discovery: 'You\'re not digging deep enough into pain points. Ask more "why" and "how" questions.',
      objection_handling: 'Work on reframing objections as opportunities to learn more about their needs.',
      call_control: 'Practice guiding conversations back on track when prospects go off-topic.',
      closing: 'Don\'t forget to ask for a specific next step at the end of each call.',
    };
    return messages[focusArea.skill] || `Focus on improving your ${focusArea.label} skills.`;
  };

  return (
    <div className="dashboard-page">
      {/* Dashboard Tour */}
      <Suspense fallback={null}>
        <DashboardTour />
      </Suspense>

      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="dashboard-page-subtitle">
            Ready to sharpen your sales skills today?
          </p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="streak-badge">
            <i className="ph-fill ph-fire"></i>
            <span>{stats.currentStreak} day streak</span>
          </div>
        )}
      </div>

      {/* Quick Start */}
      <div className="quick-start-section">
        <h2 className="section-title">
          <i className="ph ph-play-circle"></i>
          Start Practicing
        </h2>
        <div className="practice-types-grid">
          {practiceTypes.map((type) => (
            <Link
              key={type.id}
              href={`/dashboard/practice?type=${type.id}`}
              className="practice-type-card"
            >
              <div
                className="practice-type-icon"
                style={{ backgroundColor: type.color }}
              >
                <i className={`ph ${type.icon}`}></i>
              </div>
              <div className="practice-type-content">
                <h3>{type.label}</h3>
                <p>{type.description}</p>
              </div>
              <i className="ph ph-arrow-right practice-type-arrow"></i>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">
            <i className="ph ph-phone-call"></i>
          </div>
          <div className="stat-card-value">{isLoading ? '-' : stats.totalCalls}</div>
          <div className="stat-card-label">Total Calls</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: getScoreColor(stats.avgScore) }}>
            <i className="ph ph-chart-line-up"></i>
          </div>
          <div className="stat-card-value" style={{ color: getScoreColor(stats.avgScore) }}>
            {isLoading ? '-' : stats.avgScore ? `${stats.avgScore.toFixed(1)}/10` : '--'}
          </div>
          <div className="stat-card-label">Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: stats.currentStreak > 0 ? '#f59e0b' : undefined }}>
            <i className="ph ph-fire"></i>
          </div>
          <div className="stat-card-value" style={{ color: stats.currentStreak > 0 ? '#f59e0b' : undefined }}>
            {isLoading ? '-' : stats.currentStreak}
          </div>
          <div className="stat-card-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">
            <i className="ph ph-calendar-check"></i>
          </div>
          <div className="stat-card-value">{isLoading ? '-' : stats.callsThisWeek}</div>
          <div className="stat-card-label">This Week</div>
        </div>
      </div>

      {/* Focus Area */}
      <div className="focus-area-card">
        <div className="focus-area-icon">
          <i className="ph ph-target"></i>
        </div>
        <div className="focus-area-content">
          <h3>Focus Area{focusArea ? `: ${focusArea.label}` : ''}</h3>
          <p>{getFocusMessage()}</p>
        </div>
        <Link
          href={`/dashboard/practice${focusArea?.skill === 'discovery' ? '?type=discovery' : focusArea?.skill === 'objection_handling' ? '?type=objection_gauntlet' : ''}`}
          className="focus-area-btn"
        >
          Practice Now
          <i className="ph ph-arrow-right"></i>
        </Link>
      </div>

      {/* Recent Calls */}
      <div className="recent-calls">
        <div className="recent-calls-header">
          <h3 className="section-title">
            <i className="ph ph-clock-counter-clockwise"></i>
            Recent Calls
          </h3>
          <Link href="/dashboard/history" className="view-all-link">
            View all <i className="ph ph-arrow-right"></i>
          </Link>
        </div>
        {isLoading ? (
          <div className="loading-state">
            <i className="ph ph-spinner animate-spin"></i>
            <span>Loading...</span>
          </div>
        ) : recentCalls.length > 0 ? (
          <div className="recent-calls-list">
            {recentCalls.map((call) => (
              <Link
                key={call.id}
                href={`/dashboard/call/${call.id}/debrief`}
                className="recent-call-item"
              >
                <div className="recent-call-avatar">
                  {call.persona_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="recent-call-info">
                  <div className="recent-call-name">{call.persona_name}</div>
                  <div className="recent-call-title">{call.persona_title}</div>
                </div>
                <div className="recent-call-meta">
                  <span className="recent-call-type">{getTypeLabel(call.type)}</span>
                  {call.overall_score !== null && (
                    <span
                      className="recent-call-score"
                      style={{ color: getScoreColor(call.overall_score) }}
                    >
                      {call.overall_score.toFixed(1)}
                    </span>
                  )}
                  <span className="recent-call-duration">
                    <i className="ph ph-timer"></i>
                    {formatDuration(call.duration_seconds)}
                  </span>
                  <span className="recent-call-time">{formatTimeAgo(call.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="ph ph-phone-slash"></i>
            </div>
            <p>No practice calls yet. Start your first call above!</p>
          </div>
        )}
      </div>

      {/* Skill Breakdown Preview */}
      <div className="skill-preview-card">
        <div className="skill-preview-header">
          <h3 className="section-title">
            <i className="ph ph-chart-polar"></i>
            Skill Breakdown
          </h3>
          <Link href="/dashboard/progress" className="view-all-link">
            View details <i className="ph ph-arrow-right"></i>
          </Link>
        </div>
        <div className="skill-bars">
          {Object.entries(skillScores).map(([key, value]) => {
            const label = skillLabels[key] || key;
            const score = value || 0;
            const needsWork = score > 0 && score < 6;

            return (
              <div key={key} className="skill-bar">
                <div className="skill-bar-label">
                  <span>{label}</span>
                  <span style={{ color: getScoreColor(value) }}>
                    {value !== null ? value.toFixed(1) : '--'}
                  </span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className={`skill-bar-fill ${needsWork ? 'needs-work' : ''}`}
                    style={{
                      width: `${(score / 10) * 100}%`,
                      backgroundColor: score > 0 ? getScoreColor(score) : undefined,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
