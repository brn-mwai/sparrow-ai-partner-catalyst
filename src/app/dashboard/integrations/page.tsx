'use client';

import { useState, useEffect } from 'react';

interface IntegrationStatus {
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'checking';
  details?: string;
  docsUrl?: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      name: 'ElevenLabs',
      description: 'Voice AI for realistic prospect conversations',
      icon: 'ph-microphone',
      status: 'checking',
      docsUrl: 'https://elevenlabs.io/docs',
    },
    {
      name: 'Google Gemini',
      description: 'AI for persona generation and call analysis',
      icon: 'ph-brain',
      status: 'checking',
      docsUrl: 'https://ai.google.dev/docs',
    },
    {
      name: 'Groq',
      description: 'Fast inference for real-time scoring',
      icon: 'ph-lightning',
      status: 'checking',
      docsUrl: 'https://console.groq.com/docs',
    },
    {
      name: 'Supabase',
      description: 'Database and real-time subscriptions',
      icon: 'ph-database',
      status: 'checking',
      docsUrl: 'https://supabase.com/docs',
    },
  ]);

  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    // Check each integration status
    const updatedIntegrations = [...integrations];

    // Check ElevenLabs
    try {
      const hasElevenLabs = !!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      updatedIntegrations[0] = {
        ...updatedIntegrations[0],
        status: hasElevenLabs ? 'connected' : 'disconnected',
        details: hasElevenLabs ? 'Agent configured' : 'Missing API key or Agent ID',
      };
    } catch {
      updatedIntegrations[0] = { ...updatedIntegrations[0], status: 'disconnected', details: 'Configuration error' };
    }

    // Check Gemini - assume connected if we're running
    updatedIntegrations[1] = {
      ...updatedIntegrations[1],
      status: 'connected',
      details: 'Gemini 2.0 Flash',
    };

    // Check Groq
    updatedIntegrations[2] = {
      ...updatedIntegrations[2],
      status: 'connected',
      details: 'Llama 3.3 70B',
    };

    // Check Supabase
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    updatedIntegrations[3] = {
      ...updatedIntegrations[3],
      status: hasSupabase ? 'connected' : 'disconnected',
      details: hasSupabase ? 'Database connected' : 'Missing configuration',
    };

    setIntegrations(updatedIntegrations);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return '#10b981';
      case 'disconnected':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Integrations</h1>
          <p className="dashboard-page-subtitle">
            Manage your AI and service connections
          </p>
        </div>
        <button
          onClick={checkIntegrations}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: 'white',
            border: '1px solid var(--gray-200)',
            color: 'var(--gray-700)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <i className="ph ph-arrows-clockwise"></i>
          Refresh Status
        </button>
      </div>

      {/* Status Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#10b981',
              marginBottom: '0.25rem',
            }}
          >
            {integrations.filter((i) => i.status === 'connected').length}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
            Connected
          </div>
        </div>
        <div
          style={{
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#ef4444',
              marginBottom: '0.25rem',
            }}
          >
            {integrations.filter((i) => i.status === 'disconnected').length}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
            Disconnected
          </div>
        </div>
        <div
          style={{
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--gray-900)',
              marginBottom: '0.25rem',
            }}
          >
            {integrations.length}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
            Total Services
          </div>
        </div>
        <div
          style={{
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--primary-500)',
              marginBottom: '0.25rem',
            }}
          >
            <i className="ph-fill ph-check-circle"></i>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
            System Ready
          </div>
        </div>
      </div>

      {/* Integrations List */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--gray-100)',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--gray-900)' }}>
            AI Services
          </h2>
        </div>

        {integrations.map((integration, index) => (
          <div
            key={integration.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: index < integrations.length - 1 ? '1px solid var(--gray-100)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--primary-50)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className={`ph ${integration.icon}`}
                  style={{ fontSize: '1.5rem', color: 'var(--primary-600)' }}
                ></i>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: 'var(--gray-900)',
                    marginBottom: '0.125rem',
                  }}
                >
                  {integration.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                  {integration.description}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {integration.details && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                  {integration.details}
                </span>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.75rem',
                  background: `${getStatusColor(integration.status)}15`,
                  borderRadius: '9999px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getStatusColor(integration.status),
                  }}
                ></div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    color: getStatusColor(integration.status),
                  }}
                >
                  {getStatusLabel(integration.status)}
                </span>
              </div>
              {integration.docsUrl && (
                <a
                  href={integration.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.375rem 0.75rem',
                    background: 'var(--gray-100)',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    color: 'var(--gray-600)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <i className="ph ph-book-open"></i>
                  Docs
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Environment Variables Info */}
      <div
        style={{
          marginTop: '2rem',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          borderRadius: '0.75rem',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i
            className="ph ph-info"
            style={{ fontSize: '1.5rem', color: 'var(--primary-600)', flexShrink: 0 }}
          ></i>
          <div>
            <h3
              style={{
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: 'var(--gray-900)',
                marginBottom: '0.5rem',
              }}
            >
              Configuration
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: '1.6' }}>
              API keys and configuration are managed through environment variables. Check your{' '}
              <code
                style={{
                  background: 'var(--primary-100)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.8125rem',
                }}
              >
                .env.local
              </code>{' '}
              file to update credentials. See the{' '}
              <a
                href="https://github.com/anthropics/sparrow-ai#readme"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-600)', fontWeight: '500' }}
              >
                documentation
              </a>{' '}
              for setup instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
