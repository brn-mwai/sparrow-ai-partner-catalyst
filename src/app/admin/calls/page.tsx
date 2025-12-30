'use client';

import { useEffect, useState, useCallback } from 'react';

interface Call {
  id: string;
  type: string;
  status: string;
  duration_seconds: number | null;
  created_at: string;
  persona_config: {
    name: string;
    title: string;
    company: string;
  };
  users: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  call_scores: {
    overall_score: number;
    outcome: string;
  }[] | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminCallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/calls?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter, statusFilter]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cold_call': return 'Cold Call';
      case 'discovery': return 'Discovery';
      case 'objection_gauntlet': return 'Objection';
      default: return type;
    }
  };

  const getOutcomeColor = (outcome: string | undefined) => {
    switch (outcome) {
      case 'meeting_booked': return 'var(--success-500)';
      case 'callback': return 'var(--warning-500)';
      case 'rejected': return 'var(--error-500)';
      default: return 'var(--gray-500)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Call History
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          View all practice calls across all users
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <select
          className="admin-filter-btn"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          style={{ cursor: 'pointer' }}
        >
          <option value="all">All Types</option>
          <option value="cold_call">Cold Call</option>
          <option value="discovery">Discovery</option>
          <option value="objection_gauntlet">Objection</option>
        </select>

        <select
          className="admin-filter-btn"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          style={{ cursor: 'pointer' }}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="active">Active</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>

      {/* Calls Table */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>Calls ({pagination.total})</h2>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
            <i className="ph ph-spinner animate-spin" style={{ fontSize: '1.5rem' }}></i>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Prospect</th>
                <th>Type</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Score</th>
                <th>Outcome</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => {
                const score = call.call_scores?.[0];
                return (
                  <tr key={call.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {call.users?.name?.charAt(0) || call.users?.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="admin-user-info">
                          <span className="admin-user-name">{call.users?.name || 'Unknown'}</span>
                          <span className="admin-user-email">{call.users?.email || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div style={{ color: 'var(--gray-900)' }}>{call.persona_config?.name || '-'}</div>
                        <div style={{ color: 'var(--gray-500)' }}>
                          {call.persona_config?.title} at {call.persona_config?.company}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-status" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                        {getTypeLabel(call.type)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status ${call.status === 'completed' ? 'active' : 'inactive'}`}>
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDuration(call.duration_seconds)}</td>
                    <td>
                      {score?.overall_score ? (
                        <span style={{ fontWeight: 600 }}>{score.overall_score.toFixed(1)}</span>
                      ) : '-'}
                    </td>
                    <td>
                      {score?.outcome ? (
                        <span style={{
                          color: getOutcomeColor(score.outcome),
                          fontWeight: 500,
                          fontSize: '0.8125rem',
                          textTransform: 'capitalize',
                        }}>
                          {score.outcome.replace('_', ' ')}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{new Date(call.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {calls.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                    No calls found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--gray-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="admin-filter-btn"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              <button
                className="admin-filter-btn"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
