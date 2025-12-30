'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users?limit=5'),
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

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="ph ph-spinner animate-spin"></i>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div>
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
          <div className="admin-stat-label">Monthly Revenue (MRR)</div>
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

      {/* Charts */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3>Users by Plan</h3>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-500)' }}>
                {stats?.users.byPlan.free || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Free</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                {stats?.users.byPlan.starter || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Starter</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning-500)' }}>
                {stats?.users.byPlan.pro || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Pro</div>
            </div>
          </div>
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3>Revenue Projection</h3>
          </div>
          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                Monthly (MRR)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                ${stats?.revenue.mrr || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                Annual (ARR)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                ${stats?.revenue.estimated || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>Recent Users</h2>
          <Link href="/admin/users" style={{ color: 'var(--primary-500)', fontSize: '0.875rem', textDecoration: 'none' }}>
            View all
          </Link>
        </div>
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
                  <span className={`admin-status ${user.plan}`}>
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </span>
                </td>
                <td>{user.user_progress?.[0]?.total_calls || 0}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentUsers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                  No users yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
