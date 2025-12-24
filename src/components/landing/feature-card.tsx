'use client';

import { useState, useEffect } from 'react';
import styles from './landing.module.css';

export interface FeatureCardProps {
  title: string;
  description: string;
  preview: React.ReactNode;
}

export function FeatureCard({ title, description, preview }: FeatureCardProps) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featurePreview}>{preview}</div>
      <div className={styles.featureContent}>
        <div className={styles.featureTitle}>{title}</div>
        <div className={styles.featureDesc}>{description}</div>
      </div>
    </div>
  );
}

// -------------------- Feature Preview Components --------------------

export function VoiceCallPreview() {
  const [isActive, setIsActive] = useState(true);
  const [bars, setBars] = useState([35, 55, 75, 45, 65, 40, 60, 50, 70, 55]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev);
      setBars(bars.map(() => Math.random() * 50 + 30));
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary-50), var(--white))',
      borderRadius: '10px',
      padding: '0.875rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      width: '140px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--primary-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 3px 8px rgba(170, 144, 254, 0.3)'
      }}>
        <i className="ph-fill ph-microphone" style={{ fontSize: '1.125rem', color: 'white' }}></i>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        height: '20px'
      }}>
        {bars.map((height, i) => (
          <div
            key={i}
            style={{
              width: '2px',
              height: `${height}%`,
              background: isActive ? 'var(--primary-500)' : 'var(--gray-300)',
              borderRadius: '1px',
              transition: 'all 0.15s ease'
            }}
          />
        ))}
      </div>
      <div style={{
        fontSize: '0.5625rem',
        fontWeight: 600,
        color: isActive ? 'var(--primary-600)' : 'var(--gray-500)'
      }}>
        {isActive ? 'Speaking...' : 'Listening...'}
      </div>
    </div>
  );
}

export function PracticeModePreview() {
  const [activeMode, setActiveMode] = useState(0);
  const modes = [
    { icon: 'ph-phone-outgoing', label: 'Cold Call', color: 'var(--primary-500)' },
    { icon: 'ph-magnifying-glass', label: 'Discovery', color: 'var(--primary-600)' },
    { icon: 'ph-shield-warning', label: 'Objections', color: 'var(--primary-700)' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMode((prev) => (prev + 1) % modes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: '10px',
      padding: '0.5rem',
      width: '140px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    }}>
      {modes.map((mode, i) => (
        <div
          key={mode.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.5rem',
            borderRadius: '6px',
            background: i === activeMode ? 'var(--primary-50)' : 'transparent',
            border: i === activeMode ? '1px solid var(--primary-200)' : '1px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '5px',
            background: i === activeMode ? mode.color : 'var(--gray-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}>
            <i className={`ph-fill ${mode.icon}`} style={{
              fontSize: '0.6875rem',
              color: i === activeMode ? 'white' : 'var(--gray-400)'
            }}></i>
          </div>
          <span style={{
            fontSize: '0.625rem',
            fontWeight: i === activeMode ? 600 : 500,
            color: i === activeMode ? 'var(--gray-900)' : 'var(--gray-500)'
          }}>
            {mode.label}
          </span>
          {i === activeMode && (
            <i className="ph-fill ph-check-circle" style={{
              marginLeft: 'auto',
              fontSize: '0.6875rem',
              color: 'var(--primary-500)'
            }}></i>
          )}
        </div>
      ))}
    </div>
  );
}

export function ObjectionPreview() {
  const [currentObjection, setCurrentObjection] = useState(0);
  const objections = [
    "We're using a competitor",
    "Send me an email",
    "Not in budget right now",
    "Need to think about it",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentObjection((prev) => (prev + 1) % objections.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: '10px',
      padding: '0.75rem',
      width: '140px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        marginBottom: '0.5rem'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '5px',
          background: 'var(--error-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <i className="ph-fill ph-shield-warning" style={{ fontSize: '0.625rem', color: 'var(--error-500)' }}></i>
        </div>
        <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Objection
        </span>
      </div>
      <div style={{
        background: 'var(--gray-50)',
        borderRadius: '6px',
        padding: '0.5rem',
        fontSize: '0.625rem',
        color: 'var(--gray-700)',
        fontStyle: 'italic',
        minHeight: '36px',
        display: 'flex',
        alignItems: 'center'
      }}>
        "{objections[currentObjection]}"
      </div>
      <div style={{
        display: 'flex',
        gap: '3px',
        marginTop: '0.5rem',
        justifyContent: 'center'
      }}>
        {objections.map((_, i) => (
          <div
            key={i}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: i === currentObjection ? 'var(--primary-500)' : 'var(--gray-200)',
              transition: 'background 0.2s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function PersonaPreview() {
  const personas = [
    { initials: 'SC', name: 'Sarah Chen', role: 'VP Ops', difficulty: 'Hard', color: 'var(--error-500)' },
    { initials: 'MJ', name: 'Marcus J.', role: 'Dir. Sales', difficulty: 'Medium', color: 'var(--primary-500)' },
    { initials: 'JW', name: 'Jennifer W.', role: 'CRO', difficulty: 'Hard', color: 'var(--error-500)' },
  ];

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: '10px',
      padding: '0.625rem',
      width: '140px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        marginBottom: '0.5rem'
      }}>
        <i className="ph-fill ph-users-three" style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}></i>
        <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          AI Personas
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {personas.map((p) => (
          <div key={p.initials} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem',
            borderRadius: '5px',
            background: 'var(--gray-50)'
          }}>
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.5rem',
              fontWeight: 700
            }}>
              {p.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--gray-900)' }}>{p.name}</div>
              <div style={{ fontSize: '0.5rem', color: 'var(--gray-500)' }}>{p.role}</div>
            </div>
            <div style={{
              fontSize: '0.4375rem',
              fontWeight: 600,
              padding: '1px 3px',
              borderRadius: '2px',
              background: p.difficulty === 'Hard' ? 'var(--error-50)' : 'var(--primary-50)',
              color: p.difficulty === 'Hard' ? 'var(--error-600)' : 'var(--primary-600)'
            }}>
              {p.difficulty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoringPreview() {
  const [scores, setScores] = useState([85, 78, 92, 88]);
  const categories = ['Opening', 'Discovery', 'Objection', 'Closing'];

  useEffect(() => {
    const interval = setInterval(() => {
      setScores(scores.map(s => Math.min(100, Math.max(60, s + (Math.random() * 10 - 5)))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--primary-50), var(--white))',
      border: '1px solid var(--primary-200)',
      borderRadius: '10px',
      padding: '0.75rem',
      width: '140px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'var(--white)',
        border: '2px solid var(--primary-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 0.5rem',
        boxShadow: '0 3px 8px rgba(170, 144, 254, 0.2)'
      }}>
        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-600)' }}>{overall}</span>
      </div>
      <div style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
        Overall Score
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.125rem' }}>
        {categories.map((cat, i) => (
          <div key={cat} style={{ flex: 1 }}>
            <div style={{
              height: '24px',
              background: 'var(--gray-100)',
              borderRadius: '3px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <div style={{
                height: `${scores[i]}%`,
                background: 'var(--primary-500)',
                borderRadius: '3px',
                transition: 'height 0.3s ease'
              }}></div>
            </div>
            <div style={{ fontSize: '0.4375rem', color: 'var(--gray-500)', marginTop: '2px' }}>
              {cat.slice(0, 3)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressPreview() {
  const data = [
    { day: 'Mon', score: 72 },
    { day: 'Tue', score: 75 },
    { day: 'Wed', score: 68 },
    { day: 'Thu', score: 82 },
    { day: 'Fri', score: 85 },
    { day: 'Sat', score: 88 },
    { day: 'Sun', score: 86 },
  ];

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: '10px',
      padding: '0.75rem',
      width: '140px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <i className="ph-fill ph-chart-line-up" style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}></i>
          <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--gray-500)' }}>This Week</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          fontSize: '0.5rem',
          color: 'var(--success-600)',
          fontWeight: 600
        }}>
          <i className="ph ph-trend-up" style={{ fontSize: '0.5625rem' }}></i>
          +16%
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '36px',
        gap: '2px'
      }}>
        {data.map((d, i) => (
          <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{
              width: '12px',
              height: `${(d.score - 60) * 1}px`,
              background: i === data.length - 1 ? 'var(--primary-500)' : 'var(--primary-200)',
              borderRadius: '2px',
              transition: 'height 0.3s ease'
            }}></div>
            <span style={{ fontSize: '0.4375rem', color: 'var(--gray-400)' }}>{d.day.charAt(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
