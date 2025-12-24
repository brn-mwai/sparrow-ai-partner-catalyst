'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './landing.module.css';

export function PreviewSection() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [callTime, setCallTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [waveHeights, setWaveHeights] = useState([40, 60, 80, 50, 70, 45, 65, 55]);

  const conversation = [
    { role: 'prospect', text: "Hello?" },
    { role: 'rep', text: "Hi Sarah, this is Alex from Sparrow. I know you're busy, but I noticed TechFlow just raised your Series B - congrats!" },
    { role: 'prospect', text: "Thanks... who is this again?" },
    { role: 'rep', text: "Alex from Sparrow. Quick question - are you still handling ops for the team?" },
    { role: 'prospect', text: "I am, but we're pretty set on tools. Can you send me an email?" },
    { role: 'rep', text: "Happy to. Before I do - when you say 'set on tools', is that for the current team size, or the scale-up?" },
    { role: 'prospect', text: "...that's actually a good question. We're tripling next quarter." },
  ];

  const scores = [
    { label: 'Opening', score: 85, icon: 'ph-hand-waving' },
    { label: 'Discovery', score: 78, icon: 'ph-magnifying-glass' },
    { label: 'Objections', score: 92, icon: 'ph-shield-check' },
    { label: 'Communication', score: 88, icon: 'ph-chat-circle-text' },
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % conversation.length);
    }, 3500);

    const timeInterval = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);

    const waveInterval = setInterval(() => {
      setIsActive((prev) => !prev);
      setWaveHeights([
        Math.random() * 50 + 30,
        Math.random() * 50 + 30,
        Math.random() * 50 + 30,
        Math.random() * 50 + 30,
        Math.random() * 50 + 30,
        Math.random() * 50 + 30,
        Math.random() * 50 + 30,
        Math.random() * 50 + 30,
      ]);
    }, 200);

    return () => {
      clearInterval(messageInterval);
      clearInterval(timeInterval);
      clearInterval(waveInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className={`${styles.section} ${styles.sectionGray}`} id="demo">
      {/* Background Container */}
      <div className={styles.previewContainer}>
        <div className={styles.preview}>
          <div className={styles.previewInner}>
          {/* Browser Chrome */}
          <div className={styles.previewHeader}>
            <div className={styles.previewDot} style={{ background: '#ff5f57' }}></div>
            <div className={styles.previewDot} style={{ background: '#febc2e' }}></div>
            <div className={styles.previewDot} style={{ background: '#28c840' }}></div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'var(--gray-100)',
                borderRadius: '6px',
                padding: '4px 16px',
                fontSize: '0.75rem',
                color: 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="ph ph-lock-simple" style={{ fontSize: '10px' }}></i>
                app.sparrow-ai.com/practice
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Image
                src="/Assets/sparrow-ai.png"
                alt="Sparrow AI"
                width={20}
                height={20}
                style={{ borderRadius: '4px' }}
              />
            </div>
          </div>

          {/* Dashboard Content */}
          <div style={{ display: 'flex', background: 'var(--gray-50)', height: '480px' }}>

            {/* Left Sidebar - Mode & Persona */}
            <div style={{
              width: '220px',
              background: 'var(--white)',
              borderRight: '1px solid var(--gray-200)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Mode Selector */}
              <div>
                <div style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.75rem'
                }}>
                  Practice Mode
                </div>
                <div style={{
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  borderRadius: '10px',
                  padding: '0.875rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <i className="ph-fill ph-phone-outgoing" style={{ color: 'var(--primary-500)', fontSize: '1rem' }}></i>
                    <span style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.875rem' }}>Cold Call</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
                    Practice opening calls and getting past gatekeepers
                  </div>
                </div>
              </div>

              {/* Persona Card */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  marginBottom: '0.75rem'
                }}>
                  <Image
                    src="/Assets/sparrow-ai.png"
                    alt="AI"
                    width={14}
                    height={14}
                    style={{ borderRadius: '2px' }}
                  />
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: 'var(--gray-400)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    AI Prospect
                  </span>
                </div>
                <div style={{
                  background: 'var(--white)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '10px',
                  padding: '0.875rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}>
                    SC
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.875rem' }}>Sarah Chen</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>VP of Operations</div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--error-50)',
                    color: 'var(--error-600)',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    <i className="ph ph-lightning"></i>
                    Hard
                  </div>
                </div>
              </div>

              {/* Call Timer */}
              <div style={{
                background: 'var(--secondary-800)',
                borderRadius: '10px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.5rem'
                }}>
                  Call Duration
                </div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--white)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {formatTime(callTime)}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  marginTop: '0.5rem'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <span style={{ fontSize: '0.625rem', color: 'var(--gray-400)' }}>Live</span>
                </div>
              </div>
            </div>

            {/* Main Content - Transcript */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

              {/* Voice Waveform */}
              <div style={{
                background: 'var(--white)',
                borderBottom: '1px solid var(--gray-200)',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    height: '32px'
                  }}>
                    {waveHeights.map((height, i) => (
                      <div
                        key={i}
                        style={{
                          width: '3px',
                          height: `${height}%`,
                          background: isActive ? 'var(--primary-500)' : 'var(--gray-300)',
                          borderRadius: '2px',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: isActive ? 'var(--primary-600)' : 'var(--gray-500)',
                    fontWeight: 500
                  }}>
                    {isActive ? 'Speaking...' : 'Listening...'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid var(--gray-200)',
                    background: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <i className="ph ph-microphone" style={{ fontSize: '1rem', color: 'var(--gray-600)' }}></i>
                  </button>
                  <button style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'var(--error-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <i className="ph ph-phone-disconnect" style={{ fontSize: '1rem', color: 'white' }}></i>
                  </button>
                </div>
              </div>

              {/* Transcript Area - Scrollable */}
              <div style={{
                flex: 1,
                padding: '1.25rem 1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                maxHeight: '380px'
              }}>
                {conversation.slice(0, currentMessage + 1).map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'rep' ? 'flex-end' : 'flex-start',
                      gap: '0.5rem',
                      alignItems: 'flex-start'
                    }}
                  >
                    {msg.role === 'prospect' && (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--primary-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--primary-700)' }}>SC</span>
                      </div>
                    )}
                    <div style={{
                      maxWidth: '75%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: msg.role === 'rep' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      background: msg.role === 'rep' ? 'var(--primary-500)' : 'var(--white)',
                      color: msg.role === 'rep' ? 'white' : 'var(--gray-900)',
                      boxShadow: msg.role === 'prospect' ? '0 1px 3px rgba(27,17,58,0.08)' : 'none'
                    }}>
                      {msg.text}
                    </div>
                    {msg.role === 'rep' && (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--secondary-800)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="ph ph-user" style={{ fontSize: '0.75rem', color: 'white' }}></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar - Live Scoring */}
            <div style={{
              width: '200px',
              background: 'var(--white)',
              borderLeft: '1px solid var(--gray-200)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Image
                  src="/Assets/sparrow-ai.png"
                  alt="Sparrow AI"
                  width={18}
                  height={18}
                  style={{ borderRadius: '3px' }}
                />
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--gray-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  AI Coach
                </span>
              </div>

              {/* Score Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scores.map((item) => (
                  <div key={item.label}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className={`ph ${item.icon}`} style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}></i>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-600)' }}>{item.score}</span>
                    </div>
                    <div style={{
                      height: '4px',
                      background: 'var(--gray-100)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${item.score}%`,
                        background: 'var(--primary-500)',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Coaching Tip */}
              <div style={{
                background: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start'
              }}>
                <i className="ph ph-lightbulb" style={{
                  color: 'var(--primary-500)',
                  fontSize: '0.875rem',
                  marginTop: '1px',
                  flexShrink: 0
                }}></i>
                <span style={{
                  fontSize: '0.6875rem',
                  color: 'var(--gray-700)',
                  lineHeight: 1.4
                }}>
                  Great pivot! Now dig into the scaling pain point.
                </span>
              </div>

              {/* Overall Score */}
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-50), var(--white))',
                border: '1px solid var(--primary-200)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                marginTop: 'auto'
              }}>
                <div style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--gray-500)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.25rem'
                }}>
                  Overall
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--primary-500)',
                  lineHeight: 1
                }}>
                  86
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  marginTop: '0.25rem'
                }}>
                  <i className="ph ph-trend-up" style={{ fontSize: '0.75rem', color: 'var(--success-500)' }}></i>
                  <span style={{ fontSize: '0.625rem', color: 'var(--success-600)', fontWeight: 500 }}>+12 from last</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
