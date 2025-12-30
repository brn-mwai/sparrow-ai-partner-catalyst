'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { generateAdminReport } from '@/lib/reports/pdf-generator';

interface Stats {
  users: {
    total: number;
    newThisWeek: number;
    active: number;
    byPlan: {
      free: number;
      starter: number;
      pro: number;
    };
  };
  calls: {
    total: number;
    today: number;
  };
  revenue: {
    mrr: number;
    estimated: number;
  };
}

interface RecentUser {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  created_at: string;
  user_progress: {
    total_calls: number;
  }[] | null;
}

const COLORS = ['#E5E7EB', '#7C3AED', '#F59E0B'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users?limit=10'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setRecentUsers(usersData.users);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (!stats) return;
    setGenerating(true);
    try {
      generateAdminReport(stats, recentUsers.map(u => ({
        name: u.name,
        email: u.email,
        plan: u.plan,
        created_at: u.created_at,
      })));
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  }, [stats, recentUsers]);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <i className="ph ph-spinner animate-spin"></i>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  // Chart data
  const planChartData = [
    { name: 'Free', value: stats?.users.byPlan.free || 0, color: '#E5E7EB' },
    { name: 'Starter', value: stats?.users.byPlan.starter || 0, color: '#7C3AED' },
    { name: 'Pro', value: stats?.users.byPlan.pro || 0, color: '#F59E0B' },
  ];

  const revenueChartData = [
    { name: 'Starter', revenue: (stats?.users.byPlan.starter || 0) * 29 },
    { name: 'Pro', revenue: (stats?.users.byPlan.pro || 0) * 79 },
  ];

  // Simulated trend data (would come from API in production)
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    users: Math.floor(Math.random() * 5) + (stats?.users.total || 0) - 10 + i,
    calls: Math.floor(Math.random() * 10) + i * 2,
  }));

  return (
    <div className="admin-dashboard">
      {/* Header with actions */}
      <div className="admin-page-header">
        <div>
          <h1>Overview</h1>
          <p>Monitor your platform metrics and user activity</p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? (
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

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon users">
              <i className="ph ph-users"></i>
            </div>
            {stats?.users.newThisWeek ? (
              <span className="admin-stat-change positive">
                +{stats.users.newThisWeek} this week
              </span>
            ) : null}
          </div>
          <div className="admin-stat-value">{stats?.users.total || 0}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon calls">
              <i className="ph ph-phone"></i>
            </div>
            {stats?.calls.today ? (
              <span className="admin-stat-change positive">
                +{stats.calls.today} today
              </span>
            ) : null}
          </div>
          <div className="admin-stat-value">{stats?.calls.total || 0}</div>
          <div className="admin-stat-label">Total Calls</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon revenue">
              <i className="ph ph-currency-dollar"></i>
            </div>
          </div>
          <div className="admin-stat-value">
            ${stats?.revenue.mrr || 0}
          </div>
          <div className="admin-stat-label">Monthly Revenue</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon active">
              <i className="ph ph-activity"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats?.users.active || 0}</div>
          <div className="admin-stat-label">Active Users (7d)</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="admin-charts-row">
        {/* Activity Trend Chart */}
        <div className="admin-chart-card wide">
          <div className="admin-chart-header">
            <h3>Activity Trend</h3>
            <span className="admin-chart-period">Last 7 days</span>
          </div>
          <div className="admin-chart-body">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3>Users by Plan</h3>
          </div>
          <div className="admin-chart-body pie-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={planChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {planChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="admin-chart-legend">
              {planChartData.map((item, index) => (
                <div key={item.name} className="admin-chart-legend-item">
                  <span className="admin-chart-legend-dot" style={{ background: COLORS[index] }}></span>
                  <span className="admin-chart-legend-label">{item.name}</span>
                  <span className="admin-chart-legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="admin-chart-card full-width">
        <div className="admin-chart-header">
          <h3>Revenue by Plan</h3>
          <div className="admin-chart-stats">
            <div className="admin-chart-stat">
              <span className="admin-chart-stat-label">MRR</span>
              <span className="admin-chart-stat-value">${stats?.revenue.mrr || 0}</span>
            </div>
            <div className="admin-chart-stat">
              <span className="admin-chart-stat-label">ARR</span>
              <span className="admin-chart-stat-value">${stats?.revenue.estimated || 0}</span>
            </div>
          </div>
        </div>
        <div className="admin-chart-body">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#7C3AED" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>Recent Users</h2>
          <Link href="/admin/users" className="admin-link">
            View all <i className="ph ph-arrow-right"></i>
          </Link>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Calls</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-avatar">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="admin-user-info">
                        <span className="admin-user-name">{user.name || 'No name'}</span>
                        <span className="admin-user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${user.plan}`}>
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </span>
                  </td>
                  <td className="admin-table-number">{user.user_progress?.[0]?.total_calls || 0}</td>
                  <td className="admin-table-date">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-table-empty">
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
