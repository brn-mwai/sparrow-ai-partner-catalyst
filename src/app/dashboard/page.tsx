'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface Stats {
  totalCalls: number;
  avgScore: number;
  currentStreak: number;
  callsThisWeek: number;
}

interface RecentCall {
  id: string;
  prospectName: string;
  prospectTitle: string;
  type: 'cold_call' | 'discovery' | 'objection';
  score: number;
  duration: string;
  createdAt: string;
}

const practiceTypes = [
  {
    id: 'cold_call',
    label: 'Cold Call',
    icon: 'ph-phone-outgoing',
    description: 'Practice opening calls and booking meetings',
    color: 'var(--primary-500)',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    icon: 'ph-magnifying-glass',
    description: 'Practice uncovering pain points',
    color: 'var(--success-500)',
  },
  {
    id: 'objection',
    label: 'Objections',
    icon: 'ph-shield',
    description: 'Handle common pushback scenarios',
    color: 'var(--warning-500)',
  },
];

export default function DashboardPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState<Stats>({
    totalCalls: 0,
    avgScore: 0,
    currentStreak: 0,
    callsThisWeek: 0,
  });

  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);

  // Simulated data - replace with actual API call
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setStats({
        totalCalls: 23,
        avgScore: 7.4,
        currentStreak: 4,
        callsThisWeek: 6,
      });
      setRecentCalls([
        {
          id: '1',
          prospectName: 'Sarah Chen',
          prospectTitle: 'VP of Operations',
          type: 'cold_call',
          score: 7.8,
          duration: '3:24',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: '2',
          prospectName: 'Mike Torres',
          prospectTitle: 'CTO',
          type: 'discovery',
          score: 6.2,
          duration: '8:15',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: '3',
          prospectName: 'Lisa Park',
          prospectTitle: 'Director of Sales',
          type: 'objection',
          score: 8.5,
          duration: '5:42',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cold_call':
        return 'Cold Call';
      case 'discovery':
        return 'Discovery';
      case 'objection':
        return 'Objections';
      default:
        return type;
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'var(--success-500)';
    if (score >= 6) return 'var(--primary-500)';
    return 'var(--warning-500)';
  };

  return (
    <div className="dashboard-page">
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
        <div className="streak-badge">
          <i className="ph-fill ph-fire"></i>
          <span>{stats.currentStreak} day streak</span>
        </div>
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
          <div className="stat-card-icon">
            <i className="ph ph-chart-line-up"></i>
          </div>
          <div className="stat-card-value">
            {isLoading ? '-' : `${stats.avgScore.toFixed(1)}/10`}
          </div>
          <div className="stat-card-label">Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">
            <i className="ph ph-fire"></i>
          </div>
          <div className="stat-card-value">{isLoading ? '-' : stats.currentStreak}</div>
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
          <h3>Focus Area: Discovery Questions</h3>
          <p>
            In 4 of your last 6 calls, you didn't dig deep enough into pain points.
            Try asking "How is that impacting your team?" more often.
          </p>
        </div>
        <Link href="/dashboard/practice?type=discovery" className="focus-area-btn">
          Practice Discovery
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
                href={`/dashboard/history/${call.id}`}
                className="recent-call-item"
              >
                <div className="recent-call-avatar">
                  {call.prospectName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="recent-call-info">
                  <div className="recent-call-name">{call.prospectName}</div>
                  <div className="recent-call-title">{call.prospectTitle}</div>
                </div>
                <div className="recent-call-meta">
                  <span className="recent-call-type">{getTypeLabel(call.type)}</span>
                  <span
                    className="recent-call-score"
                    style={{ color: getScoreColor(call.score) }}
                  >
                    {call.score.toFixed(1)}
                  </span>
                  <span className="recent-call-duration">
                    <i className="ph ph-timer"></i>
                    {call.duration}
                  </span>
                  <span className="recent-call-time">{formatTimeAgo(call.createdAt)}</span>
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
          <div className="skill-bar">
            <div className="skill-bar-label">
              <span>Opening</span>
              <span>8.1</span>
            </div>
            <div className="skill-bar-track">
              <div className="skill-bar-fill" style={{ width: '81%' }}></div>
            </div>
          </div>
          <div className="skill-bar">
            <div className="skill-bar-label">
              <span>Discovery</span>
              <span>6.2</span>
            </div>
            <div className="skill-bar-track">
              <div
                className="skill-bar-fill needs-work"
                style={{ width: '62%' }}
              ></div>
            </div>
          </div>
          <div className="skill-bar">
            <div className="skill-bar-label">
              <span>Objection Handling</span>
              <span>7.1</span>
            </div>
            <div className="skill-bar-track">
              <div className="skill-bar-fill" style={{ width: '71%' }}></div>
            </div>
          </div>
          <div className="skill-bar">
            <div className="skill-bar-label">
              <span>Closing</span>
              <span>5.4</span>
            </div>
            <div className="skill-bar-track">
              <div
                className="skill-bar-fill needs-work"
                style={{ width: '54%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
