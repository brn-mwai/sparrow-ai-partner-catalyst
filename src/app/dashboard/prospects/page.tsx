'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Prospect {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  companySize: string;
  industry: string;
  difficulty: 'easy' | 'medium' | 'hard';
  personalityTraits: string[];
  background: string | null;
  objections: string | null;
  isDefault: boolean;
  createdAt: string;
  timesUsed: number;
  avgScore: number | null;
  bestScore: number | null;
  isFavorite: boolean;
}

interface GenerateConfig {
  industry: string;
  role: string;
  personality: 'skeptical' | 'busy' | 'friendly' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  callType: 'cold_call' | 'discovery' | 'objection_gauntlet';
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Logistics',
  'Marketing',
  'Real Estate',
  'Education',
  'Other',
];

const ROLES = [
  'CEO',
  'CTO',
  'CFO',
  'VP of Sales',
  'VP of Operations',
  'VP of Marketing',
  'Director of IT',
  'Director of Procurement',
  'Head of HR',
  'Product Manager',
];

const PERSONALITIES = [
  { value: 'skeptical', label: 'Skeptical', description: 'Needs proof, pushes back' },
  { value: 'busy', label: 'Busy', description: 'Short on time, direct' },
  { value: 'friendly', label: 'Friendly', description: 'Open, warm, conversational' },
  { value: 'technical', label: 'Technical', description: 'Detail-oriented, analytical' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', color: '#ef4444' },
];

const personalityColors: Record<string, string> = {
  skeptical: '#ef4444',
  Skeptical: '#ef4444',
  busy: '#f59e0b',
  Busy: '#f59e0b',
  friendly: '#10b981',
  Friendly: '#10b981',
  technical: '#6366f1',
  Technical: '#6366f1',
  Analytical: '#6366f1',
  'Budget-conscious': '#f59e0b',
};

const difficultyColors: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

export default function ProspectsPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'used'>('recent');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateConfig, setGenerateConfig] = useState<GenerateConfig>({
    industry: 'Technology',
    role: 'VP of Sales',
    personality: 'skeptical',
    difficulty: 'medium',
    callType: 'cold_call',
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProspects = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/prospects');
      if (!response.ok) {
        throw new Error('Failed to fetch prospects');
      }
      const data = await response.json();
      setProspects(data.prospects || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching prospects:', err);
      setError('Failed to load prospects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const handleToggleFavorite = async (prospectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/prospects/${prospectId}/favorite`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setProspects((prev) =>
          prev.map((p) => (p.id === prospectId ? { ...p, isFavorite: data.isFavorite } : p))
        );
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleDelete = async (prospectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prospect?')) return;

    try {
      setDeletingId(prospectId);
      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProspects((prev) => prev.filter((p) => p.id !== prospectId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete prospect');
      }
    } catch (err) {
      console.error('Error deleting prospect:', err);
      alert('Failed to delete prospect');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateConfig),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      const persona = data.persona;

      if (!persona) {
        throw new Error('No persona data received from API');
      }

      // Save the generated persona as a prospect
      const saveResponse = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: persona.name?.split(' ')[0] || 'AI',
          lastName: persona.name?.split(' ').slice(1).join(' ') || 'Prospect',
          title: persona.title || generateConfig.role,
          companyName: persona.company || 'Generated Company',
          companySize: persona.company_size || '51-200',
          industry: persona.industry || generateConfig.industry,
          difficulty: generateConfig.difficulty,
          personalityTraits: [generateConfig.personality],
          background: persona.background,
          objections: persona.objections?.join('. ') || '',
        }),
      });

      if (!saveResponse.ok) {
        const saveError = await saveResponse.json().catch(() => ({}));
        throw new Error(saveError.error || 'Failed to save prospect');
      }

      const savedData = await saveResponse.json();
      setProspects((prev) => [savedData.prospect, ...prev]);
      setShowGenerateModal(false);
    } catch (err) {
      console.error('Error generating prospect:', err);
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to generate prospect: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePractice = (prospectId: string) => {
    router.push(`/dashboard/practice?prospectId=${prospectId}`);
  };

  const filteredProspects = prospects
    .filter((p) => {
      if (filter === 'favorites') return p.isFavorite;
      if (filter === 'custom') return !p.isDefault;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.avgScore || 0) - (a.avgScore || 0);
      if (sortBy === 'used') return b.timesUsed - a.timesUsed;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getScoreColor = (score: number | null) => {
    if (!score) return '#6b7280';
    if (score >= 70) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">AI Prospects</h1>
          <p className="dashboard-page-subtitle">
            Your library of AI-generated prospect personas for practice
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
          <i className="ph ph-sparkle"></i>
          Generate New
        </button>
      </div>

      {/* Filters */}
      <div className="prospects-filters">
        <div className="filter-tabs">
          <button
            onClick={() => setFilter('all')}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All ({prospects.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`filter-tab ${filter === 'favorites' ? 'active' : ''}`}
          >
            <i className="ph-fill ph-star"></i>
            Favorites ({prospects.filter((p) => p.isFavorite).length})
          </button>
          <button
            onClick={() => setFilter('custom')}
            className={`filter-tab ${filter === 'custom' ? 'active' : ''}`}
          >
            Custom ({prospects.filter((p) => !p.isDefault).length})
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'score' | 'used')}
          className="filter-select"
        >
          <option value="recent">Most Recent</option>
          <option value="score">Highest Score</option>
          <option value="used">Most Used</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="prospects-error">
          <i className="ph ph-warning-circle"></i>
          <span>{error}</span>
          <button onClick={fetchProspects} className="btn btn-secondary btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="prospects-loading">
          <i className="ph ph-spinner animate-spin"></i>
          <span>Loading prospects...</span>
        </div>
      ) : filteredProspects.length > 0 ? (
        <div className="prospects-grid">
          {filteredProspects.map((prospect) => (
            <div
              key={prospect.id}
              className="prospect-card"
              onClick={() => handlePractice(prospect.id)}
            >
              <div className="prospect-card-header">
                <div className="prospect-avatar">
                  {prospect.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="prospect-info">
                  <h3 className="prospect-name">{prospect.name}</h3>
                  <p className="prospect-title">
                    {prospect.title} at {prospect.company}
                  </p>
                </div>
                <button
                  className="prospect-favorite-btn"
                  onClick={(e) => handleToggleFavorite(prospect.id, e)}
                  title={prospect.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <i
                    className={`ph${prospect.isFavorite ? '-fill' : ''} ph-star`}
                    style={{ color: prospect.isFavorite ? '#f59e0b' : 'var(--gray-300)' }}
                  ></i>
                </button>
              </div>

              <div className="prospect-tags">
                {prospect.personalityTraits.map((trait, i) => (
                  <span
                    key={i}
                    className="prospect-tag"
                    style={{
                      background: `${personalityColors[trait] || '#6b7280'}15`,
                      color: personalityColors[trait] || '#6b7280',
                    }}
                  >
                    {trait}
                  </span>
                ))}
                <span
                  className="prospect-tag"
                  style={{
                    background: `${difficultyColors[prospect.difficulty]}15`,
                    color: difficultyColors[prospect.difficulty],
                  }}
                >
                  {prospect.difficulty.charAt(0).toUpperCase() + prospect.difficulty.slice(1)}
                </span>
                <span className="prospect-tag industry">{prospect.industry}</span>
              </div>

              <div className="prospect-card-footer">
                <div className="prospect-stats">
                  <span className="prospect-stat">
                    <i className="ph ph-phone"></i>
                    {prospect.timesUsed} calls
                  </span>
                  {prospect.avgScore !== null && (
                    <span
                      className="prospect-stat score"
                      style={{ color: getScoreColor(prospect.avgScore) }}
                    >
                      {(prospect.avgScore / 10).toFixed(1)}/10
                    </span>
                  )}
                </div>
                <div className="prospect-actions">
                  {!prospect.isDefault && (
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={(e) => handleDelete(prospect.id, e)}
                      disabled={deletingId === prospect.id}
                      title="Delete prospect"
                    >
                      {deletingId === prospect.id ? (
                        <i className="ph ph-spinner animate-spin"></i>
                      ) : (
                        <i className="ph ph-trash"></i>
                      )}
                    </button>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={() => handlePractice(prospect.id)}>
                    Practice
                    <i className="ph ph-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="prospects-empty">
          <div className="prospects-empty-icon">
            <i className="ph ph-users-three"></i>
          </div>
          <h3>No prospects yet</h3>
          <p>Generate your first AI prospect to start practicing.</p>
          <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
            <i className="ph ph-sparkle"></i>
            Generate Prospect
          </button>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => !isGenerating && setShowGenerateModal(false)}>
          <div className="modal-content generate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate AI Prospect</h2>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
              >
                <i className="ph ph-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Industry</label>
                <select
                  value={generateConfig.industry}
                  onChange={(e) =>
                    setGenerateConfig({ ...generateConfig, industry: e.target.value })
                  }
                  disabled={isGenerating}
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={generateConfig.role}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, role: e.target.value })}
                  disabled={isGenerating}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Personality</label>
                <div className="personality-options">
                  {PERSONALITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`personality-option ${generateConfig.personality === p.value ? 'active' : ''}`}
                      onClick={() =>
                        setGenerateConfig({
                          ...generateConfig,
                          personality: p.value as GenerateConfig['personality'],
                        })
                      }
                      disabled={isGenerating}
                    >
                      <span className="personality-label">{p.label}</span>
                      <span className="personality-desc">{p.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Difficulty</label>
                <div className="difficulty-options">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      className={`difficulty-option ${generateConfig.difficulty === d.value ? 'active' : ''}`}
                      style={
                        generateConfig.difficulty === d.value
                          ? { borderColor: d.color, background: `${d.color}10` }
                          : {}
                      }
                      onClick={() =>
                        setGenerateConfig({
                          ...generateConfig,
                          difficulty: d.value as GenerateConfig['difficulty'],
                        })
                      }
                      disabled={isGenerating}
                    >
                      <span style={{ color: d.color }}>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Call Type</label>
                <select
                  value={generateConfig.callType}
                  onChange={(e) =>
                    setGenerateConfig({
                      ...generateConfig,
                      callType: e.target.value as GenerateConfig['callType'],
                    })
                  }
                  disabled={isGenerating}
                >
                  <option value="cold_call">Cold Call</option>
                  <option value="discovery">Discovery Call</option>
                  <option value="objection_gauntlet">Objection Gauntlet</option>
                </select>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="modal-error">
                <i className="ph ph-warning-circle"></i>
                <span>{error}</span>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => setError(null)}
                >
                  <i className="ph ph-x"></i>
                </button>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <i className="ph ph-spinner animate-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="ph ph-sparkle"></i>
                    Generate Prospect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
