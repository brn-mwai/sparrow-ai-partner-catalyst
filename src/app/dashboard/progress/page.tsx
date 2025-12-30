'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import './progress.css';
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { generateUserProgressReport, type UserReportData } from '@/lib/reports/user-report-generator';

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

interface RecentCall {
  id: string;
  type: string;
  persona_name: string;
  overall_score: number | null;
  duration_seconds: number;
  created_at: string;
  outcome: string | null;
}

const skillLabels: Record<string, string> = {
  opening: 'Opening',
  discovery: 'Discovery',
  objection_handling: 'Objection Handling',
  call_control: 'Call Control',
  closing: 'Closing',
};

const CHART_COLORS = {
  primary: '#7C3AED',
  primaryLight: '#8B5CF6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: '#6b7280',
};

const OUTCOME_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

export default function ProgressPage() {
  const { user } = useUser();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    fetchProgress();
  }, [timeRange]);

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const [progressRes, callsRes] = await Promise.all([
        fetch(`/api/user/progress?range=${timeRange}`),
        fetch('/api/calls?limit=10'),
      ]);

      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgress(data.progress);
      }

      if (callsRes.ok) {
        const data = await callsRes.json();
        setRecentCalls(data.calls || []);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = useCallback(async () => {
    if (!progress || !user) return;

    setIsGenerating(true);
    try {
      const reportData: Omit<UserReportData, 'chartImages'> = {
        userName: user.fullName || user.primaryEmailAddress?.emailAddress || 'User',
        userEmail: user.primaryEmailAddress?.emailAddress || '',
        generatedAt: new Date(),
        timeRange: timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'All Time',
        stats: {
          totalCalls: progress.total_calls,
          totalDuration: progress.total_duration_seconds,
          avgScore: progress.avg_overall_score,
          currentStreak: progress.current_streak,
          longestStreak: progress.longest_streak,
        },
        skillScores: progress.skill_scores,
        outcomes: progress.outcomes,
        callsByType: progress.calls_by_type,
        scoreHistory: progress.score_history,
        recentCalls: recentCalls.map(c => ({
          type: c.type,
          personaName: c.persona_name,
          score: c.overall_score,
          duration: c.duration_seconds || 0,
          date: c.created_at,
          outcome: c.outcome,
        })),
      };

      await generateUserProgressReport(reportData, {
        scoreTrend: 'chart-score-trend',
        skillRadar: 'chart-skill-radar',
        callsByType: 'chart-calls-type',
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [progress, recentCalls, user, timeRange]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return CHART_COLORS.gray;
    if (score >= 8) return CHART_COLORS.success;
    if (score >= 6) return CHART_COLORS.warning;
    return CHART_COLORS.danger;
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

  const getOutcomeData = () => {
    if (!progress) return [];
    return [
      { name: 'Meetings', value: progress.outcomes.meeting_booked },
      { name: 'Callbacks', value: progress.outcomes.callback },
      { name: 'Rejected', value: progress.outcomes.rejected },
      { name: 'No Decision', value: progress.outcomes.no_decision },
    ].filter(d => d.value > 0);
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
  const outcomeData = getOutcomeData();

  return (
    <div className="dashboard-page progress-page">
      {/* Header */}
      <div className="progress-header">
        <div className="progress-header-left">
          <h1 className="progress-title">Your Progress</h1>
          <p className="progress-subtitle">Track your skill development over time</p>
        </div>
        <div className="progress-header-right">
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
          <button
            className="export-btn"
            onClick={handleExportReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <i className="ph ph-spinner animate-spin"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="ph ph-file-pdf"></i>
                Export Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="progress-stats-grid">
        <div className="progress-stat-card">
          <div className="stat-icon calls">
            <i className="ph ph-phone-call"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{progress.total_calls}</span>
            <span className="stat-label">Total Calls</span>
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="stat-icon time">
            <i className="ph ph-clock"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatDuration(progress.total_duration_seconds)}</span>
            <span className="stat-label">Practice Time</span>
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="stat-icon score" style={{ color: getScoreColor(progress.avg_overall_score) }}>
            <i className="ph ph-chart-line-up"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value" style={{ color: getScoreColor(progress.avg_overall_score) }}>
              {progress.avg_overall_score?.toFixed(1) || '--'}
            </span>
            <span className="stat-label">Avg Score</span>
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="stat-icon streak">
            <i className="ph ph-fire"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value streak-value">{progress.current_streak}</span>
            <span className="stat-label">Day Streak</span>
            {progress.longest_streak > progress.current_streak && (
              <span className="stat-best">Best: {progress.longest_streak}</span>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="progress-charts-row">
        {/* Score Trend */}
        <div className="progress-chart-card wide" id="chart-score-trend">
          <div className="chart-header">
            <h3>
              <i className="ph ph-trend-up"></i>
              Score Trend
            </h3>
            <span className="chart-period">{timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'All time'}</span>
          </div>
          <div className="chart-body">
            {progress.score_history.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={progress.score_history}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : '--', 'Score']}
                    labelFormatter={(date) => new Date(date as string).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <i className="ph ph-chart-line"></i>
                <p>Complete more calls to see your score trend</p>
              </div>
            )}
          </div>
        </div>

        {/* Skill Radar */}
        <div className="progress-chart-card" id="chart-skill-radar">
          <div className="chart-header">
            <h3>
              <i className="ph ph-hexagon"></i>
              Skill Breakdown
            </h3>
          </div>
          <div className="chart-body">
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={skillData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 9, fill: '#9ca3af' }}
                    tickCount={6}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <i className="ph ph-hexagon"></i>
                <p>Complete calls to see your skill breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skill Details */}
      <div className="progress-skills-section">
        <div className="section-header">
          <h3>
            <i className="ph ph-target"></i>
            Skill Performance
          </h3>
        </div>
        <div className="skills-grid">
          {Object.entries(progress.skill_scores).map(([key, value]) => {
            const score = value || 0;
            const label = skillLabels[key] || key;
            const color = getScoreColor(score);

            return (
              <div key={key} className="skill-card">
                <div className="skill-header">
                  <span className="skill-name">{label}</span>
                  <span className="skill-score" style={{ color }}>
                    {score > 0 ? score.toFixed(1) : '--'}
                  </span>
                </div>
                <div className="skill-bar-bg">
                  <div
                    className="skill-bar-fill"
                    style={{
                      width: `${(score / 10) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <div className="skill-status">
                  {score >= 8 && <span className="status excellent">Excellent</span>}
                  {score >= 6 && score < 8 && <span className="status good">Good</span>}
                  {score > 0 && score < 6 && <span className="status focus">Focus Area</span>}
                  {score === 0 && <span className="status none">Not scored</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="progress-charts-row">
        {/* Outcomes Pie Chart */}
        <div className="progress-chart-card">
          <div className="chart-header">
            <h3>
              <i className="ph ph-flag-checkered"></i>
              Call Outcomes
            </h3>
          </div>
          <div className="chart-body pie-chart-container">
            {outcomeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={OUTCOME_COLORS[index % OUTCOME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {outcomeData.map((item, index) => (
                    <div key={item.name} className="legend-item">
                      <span className="legend-dot" style={{ background: OUTCOME_COLORS[index] }}></span>
                      <span className="legend-label">{item.name}</span>
                      <span className="legend-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="chart-empty">
                <i className="ph ph-chart-pie"></i>
                <p>No outcomes recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Calls by Type */}
        <div className="progress-chart-card" id="chart-calls-type">
          <div className="chart-header">
            <h3>
              <i className="ph ph-chart-bar"></i>
              Calls by Type
            </h3>
          </div>
          <div className="chart-body">
            {progress.calls_by_type.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={progress.calls_by_type} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="type"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    width={110}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={CHART_COLORS.primary}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <i className="ph ph-chart-bar"></i>
                <p>No calls yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Calls Table */}
      {recentCalls.length > 0 && (
        <div className="progress-table-section">
          <div className="section-header">
            <h3>
              <i className="ph ph-clock-counter-clockwise"></i>
              Recent Calls
            </h3>
            <Link href="/dashboard/history" className="view-all-link">
              View All <i className="ph ph-arrow-right"></i>
            </Link>
          </div>
          <div className="progress-table-container">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Prospect</th>
                  <th>Score</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.slice(0, 5).map((call) => (
                  <tr key={call.id}>
                    <td>
                      <span className="call-type-badge">
                        {call.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="prospect-cell">{call.persona_name}</td>
                    <td>
                      <span className="score-badge" style={{ color: getScoreColor(call.overall_score) }}>
                        {call.overall_score?.toFixed(1) || '--'}
                      </span>
                    </td>
                    <td>{formatDuration(call.duration_seconds || 0)}</td>
                    <td className="date-cell">
                      {new Date(call.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <span className={`outcome-badge ${call.outcome || 'none'}`}>
                        {call.outcome ? call.outcome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '--'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Card */}
      <div className="progress-action-card">
        <div className="action-icon">
          <i className="ph ph-target"></i>
        </div>
        <div className="action-content">
          <h4>Keep Improving</h4>
          <p>
            {Object.entries(progress.skill_scores)
              .filter(([_, v]) => v !== null)
              .sort(([_, a], [__, b]) => (a || 0) - (b || 0))[0]?.[0]
              ? `Focus on ${skillLabels[Object.entries(progress.skill_scores).filter(([_, v]) => v !== null).sort(([_, a], [__, b]) => (a || 0) - (b || 0))[0]?.[0]] || 'your skills'} to boost your overall performance.`
              : 'Complete more calls to identify areas for improvement.'}
          </p>
        </div>
        <Link href="/dashboard/practice" className="action-btn">
          <i className="ph ph-play"></i>
          Practice Now
        </Link>
      </div>
    </div>
  );
}
