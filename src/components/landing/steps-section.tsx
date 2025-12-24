'use client';

import styles from './landing.module.css';

function ModeVisual() {
  const modes = [
    { icon: 'ph-phone-outgoing', label: 'Cold Call', active: true },
    { icon: 'ph-magnifying-glass', label: 'Discovery', active: false },
    { icon: 'ph-shield-warning', label: 'Objections', active: false },
  ];

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: '10px',
      padding: '0.75rem',
      width: '160px',
      border: '1px solid var(--gray-200)',
      boxShadow: '0 3px 8px rgba(27,17,58,0.05)'
    }}>
      <div style={{
        fontSize: '0.5rem',
        fontWeight: 600,
        color: 'var(--gray-400)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <i className="ph ph-target" style={{ fontSize: '0.625rem' }}></i>
        Select Mode
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {modes.map((mode) => (
          <div
            key={mode.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              borderRadius: '6px',
              background: mode.active ? 'var(--primary-50)' : 'var(--gray-50)',
              border: mode.active ? '1px solid var(--primary-300)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: mode.active ? 'var(--primary-500)' : 'var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className={`ph-fill ${mode.icon}`} style={{
                fontSize: '0.75rem',
                color: mode.active ? 'white' : 'var(--gray-400)'
              }}></i>
            </div>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: mode.active ? 600 : 500,
              color: mode.active ? 'var(--gray-900)' : 'var(--gray-500)'
            }}>
              {mode.label}
            </span>
            {mode.active && (
              <i className="ph-fill ph-check-circle" style={{
                marginLeft: 'auto',
                fontSize: '0.75rem',
                color: 'var(--primary-500)'
              }}></i>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonaVisual() {
  const personas = [
    { initials: 'SC', name: 'Sarah Chen', role: 'VP Operations', difficulty: 'Hard', selected: true },
    { initials: 'MJ', name: 'Marcus Johnson', role: 'Dir. Sales', difficulty: 'Medium', selected: false },
  ];

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: '10px',
      padding: '0.75rem',
      width: '160px',
      border: '1px solid var(--gray-200)',
      boxShadow: '0 3px 8px rgba(27,17,58,0.05)'
    }}>
      <div style={{
        fontSize: '0.5rem',
        fontWeight: 600,
        color: 'var(--gray-400)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <i className="ph ph-users" style={{ fontSize: '0.625rem' }}></i>
        Choose Prospect
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {personas.map((p) => (
          <div
            key={p.initials}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              borderRadius: '6px',
              background: p.selected ? 'var(--primary-50)' : 'var(--gray-50)',
              border: p.selected ? '1px solid var(--primary-300)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.5625rem',
              fontWeight: 700
            }}>
              {p.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--gray-900)' }}>{p.name}</div>
              <div style={{ fontSize: '0.5rem', color: 'var(--gray-500)' }}>{p.role}</div>
            </div>
            {p.selected && (
              <i className="ph-fill ph-check-circle" style={{
                fontSize: '0.75rem',
                color: 'var(--primary-500)'
              }}></i>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CallVisual() {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: '10px',
      padding: '0.75rem',
      width: '160px',
      border: '1px solid var(--gray-200)',
      boxShadow: '0 3px 8px rgba(27,17,58,0.05)'
    }}>
      {/* Score Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.625rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <i className="ph-fill ph-chart-line-up" style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}></i>
          <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--gray-500)' }}>Results</span>
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
          +8 pts
        </div>
      </div>

      {/* Score Circle */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary-50), var(--white))',
        border: '2px solid var(--primary-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 0.5rem',
        boxShadow: '0 3px 8px rgba(170, 144, 254, 0.2)'
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600)' }}>82</span>
      </div>

      {/* Feedback */}
      <div style={{
        background: 'var(--gray-50)',
        borderRadius: '6px',
        padding: '0.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginBottom: '0.375rem'
        }}>
          <i className="ph-fill ph-check-circle" style={{ fontSize: '0.5625rem', color: 'var(--success-500)' }}></i>
          <span style={{ fontSize: '0.5rem', color: 'var(--gray-700)' }}>Strong opening hook</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <i className="ph-fill ph-arrow-circle-up" style={{ fontSize: '0.5625rem', color: 'var(--primary-500)' }}></i>
          <span style={{ fontSize: '0.5rem', color: 'var(--gray-700)' }}>Ask more discovery Qs</span>
        </div>
      </div>
    </div>
  );
}

export function StepsSection() {
  return (
    <section className={`${styles.section} ${styles.sectionGray}`} id="how-it-works">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionDesc}>
            Three simple steps to sharpen your sales skills.
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <ModeVisual />
            </div>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepTitle}>Choose a practice mode</div>
            <div className={styles.stepDesc}>Pick Cold Call, Discovery, or Objection Gauntlet based on what you want to improve.</div>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <PersonaVisual />
            </div>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepTitle}>Select your AI prospect</div>
            <div className={styles.stepDesc}>Choose from 6 realistic personas with different personalities and objection styles.</div>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <CallVisual />
            </div>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepTitle}>Practice and improve</div>
            <div className={styles.stepDesc}>Have a voice conversation, get instant AI feedback, and track your progress over time.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
