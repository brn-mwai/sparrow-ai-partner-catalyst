'use client';

import { useEffect, useState } from 'react';

interface Stats {
  users: {
    total: number;
    byPlan: {
      free: number;
      starter: number;
      pro: number;
    };
  };
  revenue: {
    mrr: number;
    estimated: number;
  };
}

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
        <i className="ph ph-spinner animate-spin" style={{ fontSize: '1.5rem' }}></i>
      </div>
    );
  }

  const pricing = {
    starter: 29,
    pro: 79,
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Revenue Overview
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          Track subscription revenue and growth
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon revenue">
              <i className="ph ph-currency-dollar"></i>
            </div>
          </div>
          <div className="admin-stat-value">${stats?.revenue.mrr || 0}</div>
          <div className="admin-stat-label">Monthly Recurring Revenue</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
              <i className="ph ph-chart-line-up"></i>
            </div>
          </div>
          <div className="admin-stat-value">${stats?.revenue.estimated || 0}</div>
          <div className="admin-stat-label">Annual Run Rate (ARR)</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-500)' }}>
              <i className="ph ph-users"></i>
            </div>
          </div>
          <div className="admin-stat-value">
            {(stats?.users.byPlan.starter || 0) + (stats?.users.byPlan.pro || 0)}
          </div>
          <div className="admin-stat-label">Paying Customers</div>
        </div>
      </div>

      {/* Plan Breakdown */}
      <div className="admin-charts-grid" style={{ marginTop: '1.5rem' }}>
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3>Revenue by Plan</h3>
          </div>
          <div style={{ padding: '1rem 0' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem 0',
              borderBottom: '1px solid var(--gray-100)',
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Starter Plan</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  ${pricing.starter}/month per user
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>
                  ${(stats?.users.byPlan.starter || 0) * pricing.starter}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  {stats?.users.byPlan.starter || 0} users
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem 0',
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Pro Plan</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  ${pricing.pro}/month per user
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>
                  ${(stats?.users.byPlan.pro || 0) * pricing.pro}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  {stats?.users.byPlan.pro || 0} users
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3>Conversion Funnel</h3>
          </div>
          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Free Users</span>
                <span style={{ fontWeight: 600 }}>{stats?.users.byPlan.free || 0}</span>
              </div>
              <div style={{
                height: '8px',
                background: 'var(--gray-100)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--gray-400)',
                }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Starter</span>
                <span style={{ fontWeight: 600 }}>{stats?.users.byPlan.starter || 0}</span>
              </div>
              <div style={{
                height: '8px',
                background: 'var(--gray-100)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: stats?.users.total
                    ? `${((stats.users.byPlan.starter || 0) / stats.users.total) * 100}%`
                    : '0%',
                  height: '100%',
                  background: 'var(--primary-500)',
                }}></div>
              </div>
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Pro</span>
                <span style={{ fontWeight: 600 }}>{stats?.users.byPlan.pro || 0}</span>
              </div>
              <div style={{
                height: '8px',
                background: 'var(--gray-100)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: stats?.users.total
                    ? `${((stats.users.byPlan.pro || 0) / stats.users.total) * 100}%`
                    : '0%',
                  height: '100%',
                  background: 'var(--warning-500)',
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Note */}
      <div className="admin-chart-card" style={{ marginTop: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.5rem 0',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <i className="ph ph-credit-card" style={{ fontSize: '1.5rem', color: 'var(--primary-500)' }}></i>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Stripe Integration</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              Connect Stripe to enable payment processing and detailed revenue analytics
            </div>
          </div>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-filter-btn"
            style={{ marginLeft: 'auto', textDecoration: 'none' }}
          >
            <i className="ph ph-arrow-square-out"></i>
            Open Stripe
          </a>
        </div>
      </div>
    </div>
  );
}
