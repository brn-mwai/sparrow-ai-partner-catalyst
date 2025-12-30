'use client';

import { useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  clerk_id: string;
  name: string | null;
  email: string;
  role: string | null;
  industry: string | null;
  plan: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  user_progress: {
    total_calls: number;
    total_duration_seconds: number;
    current_streak: number;
    avg_overall_score: number | null;
  }[] | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.set('search', search);
      if (planFilter !== 'all') params.set('plan', planFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, planFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          User Management
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          View and manage all registered users
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} className="admin-search-input">
          <i className="ph ph-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select
          className="admin-filter-btn"
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          style={{ cursor: 'pointer' }}
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>Users ({pagination.total})</h2>
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
                <th>Role / Industry</th>
                <th>Plan</th>
                <th>Calls</th>
                <th>Time Practiced</th>
                <th>Avg Score</th>
                <th>Streak</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const progress = user.user_progress?.[0];
                return (
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
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div style={{ color: 'var(--gray-900)', textTransform: 'capitalize' }}>
                          {user.role || '-'}
                        </div>
                        <div style={{ color: 'var(--gray-500)', textTransform: 'capitalize' }}>
                          {user.industry || '-'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status ${user.plan}`}>
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                      </span>
                    </td>
                    <td>{progress?.total_calls || 0}</td>
                    <td>{formatDuration(progress?.total_duration_seconds || 0)}</td>
                    <td>
                      {progress?.avg_overall_score
                        ? progress.avg_overall_score.toFixed(1)
                        : '-'}
                    </td>
                    <td>
                      {progress?.current_streak ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {progress.current_streak}
                          <span style={{ fontSize: '0.875rem' }}>🔥</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                    No users found
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
