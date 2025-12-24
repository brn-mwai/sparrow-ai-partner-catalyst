'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';

interface ProgressData {
  total_calls: number;
  total_duration_seconds: number;
  current_streak: number;
  longest_streak: number;
  avg_overall_score: number | null;
  skill_scores: {
    opening: number | null;
    discovery: number | null;
    objection_handling: number | null;
    call_control: number | null;
    closing: number | null;
  };
  score_history: Array<{
    date: string;
    score: number;
  }>;
  calls_by_type: Array<{
    type: string;
    count: number;
  }>;
  outcomes: {
    meeting_booked: number;
    callback: number;
    rejected: number;
    no_decision: number;
  };
}

const skillLabels: Record<string, string> = {
  opening: 'Opening',
  discovery: 'Discovery',
  objection_handling: 'Objection Handling',
  call_control: 'Call Control',
  closing: 'Closing',
};

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    fetchProgress();
  }, [timeRange]);

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/progress?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return '#6b7280';
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getSkillData = () => {
    if (!progress?.skill_scores) return [];
    return Object.entries(progress.skill_scores)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => ({
        skill: skillLabels[key] || key,
        score: value || 0,
        fullMark: 10,
      }));
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="progress-loading">
          <i className="ph ph-spinner animate-spin"></i>
          <span>Loading your progress...</span>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="dashboard-page">
        <div className="progress-empty">
          <i className="ph ph-chart-line-up"></i>
          <h3>No Progress Data Yet</h3>
          <p>Complete some practice calls to see your progress</p>
          <Link href="/dashboard/practice" className="btn-primary">
            <i className="ph ph-phone-call"></i>
            Start Practicing
          </Link>
        </div>
      </div>
    );
  }

  const skillData = getSkillData();

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Your Progress</h1>
          <p className="dashboard-page-subtitle">Track your skill development over time</p>
        </div>
        <div className="time-range-selector">
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="progress-overview">
        <div className="progress-stat-card">
          <div className="stat-icon">
            <i className="ph ph-phone-call"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{progress.total_calls}</span>
            <span className="stat-label">Total Calls</span>
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="stat-icon">
            <i className="ph ph-clock"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatDuration(progress.total_duration_seconds)}</span>
            <span className="stat-label">Total Practice Time</span>
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="stat-icon" style={{ color: getScoreColor(progress.avg_overall_score) }}>
            <i className="ph ph-chart-line-up"></i>
          </div>
          <div className="stat-content">
            <span
              className="stat-value"
              style={{ color: getScoreColor(progress.avg_overall_score) }}
            >
              {progress.avg_overall_score?.toFixed(1) || '--'}
            </span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b' }}>
            <i className="ph ph-fire"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: '#f59e0b' }}>
              {progress.current_streak}
            </span>
            <span className="stat-label">Current Streak</span>
            {progress.longest_streak > progress.current_streak && (
              <span className="stat-sublabel">Best: {progress.longest_streak} days</span>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="progress-charts-row">
        {/* Score Trend */}
        <div className="progress-chart-card">
          <h3>
            <i className="ph ph-trend-up"></i>
            Score Trend
          </h3>
          {progress.score_history.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progress.score_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : '--', 'Score']}
                    labelFormatter={(date) => new Date(date as string).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <p>Complete more calls to see your score trend</p>
            </div>
          )}
        </div>

        {/* Skill Radar */}
        <div className="progress-chart-card">
          <h3>
            <i className="ph ph-hexagon"></i>
            Skill Breakdown
          </h3>
          {skillData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={skillData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <p>Complete calls to see your skill breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Skill Details */}
      <div className="progress-skills-section">
        <h3>
          <i className="ph ph-target"></i>
          Skill Details
        </h3>
        <div className="skills-grid">
          {Object.entries(progress.skill_scores).map(([key, value]) => {
            const score = value || 0;
            const label = skillLabels[key] || key;
            const color = getScoreColor(score);

            return (
              <div key={key} className="skill-detail-card">
                <div className="skill-header">
                  <span className="skill-name">{label}</span>
                  <span className="skill-score" style={{ color }}>
                    {score > 0 ? score.toFixed(1) : '--'}
                  </span>
                </div>
                <div className="skill-bar-container">
                  <div
                    className="skill-bar"
                    style={{
                      width: `${(score / 10) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <div className="skill-feedback">
                  {score >= 8 && <span className="feedback-excellent">Excellent</span>}
                  {score >= 6 && score < 8 && <span className="feedback-good">Good - Keep practicing</span>}
                  {score > 0 && score < 6 && <span className="feedback-improve">Focus area</span>}
                  {score === 0 && <span className="feedback-none">Not yet scored</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outcomes and Call Types */}
      <div className="progress-bottom-row">
        {/* Outcomes */}
        <div className="progress-chart-card">
          <h3>
            <i className="ph ph-flag-checkered"></i>
            Call Outcomes
          </h3>
          <div className="outcomes-grid">
            <div className="outcome-item">
              <div className="outcome-icon meeting-booked">
                <i className="ph ph-calendar-check"></i>
              </div>
              <div className="outcome-content">
                <span className="outcome-value">{progress.outcomes.meeting_booked}</span>
                <span className="outcome-label">Meetings Booked</span>
              </div>
            </div>
            <div className="outcome-item">
              <div className="outcome-icon callback">
                <i className="ph ph-phone-incoming"></i>
              </div>
              <div className="outcome-content">
                <span className="outcome-value">{progress.outcomes.callback}</span>
                <span className="outcome-label">Callbacks</span>
              </div>
            </div>
            <div className="outcome-item">
              <div className="outcome-icon rejected">
                <i className="ph ph-x-circle"></i>
              </div>
              <div className="outcome-content">
                <span className="outcome-value">{progress.outcomes.rejected}</span>
                <span className="outcome-label">Rejected</span>
              </div>
            </div>
            <div className="outcome-item">
              <div className="outcome-icon no-decision">
                <i className="ph ph-question"></i>
              </div>
              <div className="outcome-content">
                <span className="outcome-value">{progress.outcomes.no_decision}</span>
                <span className="outcome-label">No Decision</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calls by Type */}
        <div className="progress-chart-card">
          <h3>
            <i className="ph ph-chart-bar"></i>
            Calls by Type
          </h3>
          {progress.calls_by_type.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={progress.calls_by_type} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="type"
                    tick={{ fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <p>No calls yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      <div className="progress-actions">
        <div className="action-card focus-action">
          <div className="action-icon">
            <i className="ph ph-target"></i>
          </div>
          <div className="action-content">
            <h4>Focus on Your Weakest Skill</h4>
            <p>
              {Object.entries(progress.skill_scores)
                .filter(([_, v]) => v !== null)
                .sort(([_, a], [__, b]) => (a || 0) - (b || 0))[0]?.[0]
                ? `Practice ${skillLabels[Object.entries(progress.skill_scores).filter(([_, v]) => v !== null).sort(([_, a], [__, b]) => (a || 0) - (b || 0))[0]?.[0]] || 'your skills'} to improve your overall score.`
                : 'Complete more calls to identify areas for improvement.'}
            </p>
          </div>
          <Link href="/dashboard/practice" className="btn-primary">
            Practice Now
          </Link>
        </div>
      </div>
    </div>
  );
}
