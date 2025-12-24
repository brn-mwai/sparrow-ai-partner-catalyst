'use client';

import {
  FeatureCard,
  VoiceCallPreview,
  PracticeModePreview,
  ObjectionPreview,
  PersonaPreview,
  ScoringPreview,
  ProgressPreview,
} from './feature-card';
import styles from './landing.module.css';

const FEATURES = [
  {
    title: 'Voice-First Practice',
    description:
      'Practice speaking, not typing. Have real voice conversations with AI prospects that feel natural.',
    preview: <VoiceCallPreview />,
  },
  {
    title: '3 Practice Modes',
    description:
      'Cold calls, discovery calls, or rapid-fire objection handling. Choose the skill you want to sharpen.',
    preview: <PracticeModePreview />,
  },
  {
    title: 'Realistic Objections',
    description:
      'AI prospects push back like real buyers. Handle "send me an email" and "we use a competitor" objections.',
    preview: <ObjectionPreview />,
  },
  {
    title: '6 AI Personas',
    description:
      'Practice with different buyer types - from skeptical VPs to friendly evaluators to busy executives.',
    preview: <PersonaPreview />,
  },
  {
    title: 'Instant AI Scoring',
    description:
      'Get scored on opening, discovery, objection handling, communication, and closing after every call.',
    preview: <ScoringPreview />,
  },
  {
    title: 'Track Your Progress',
    description:
      'See your scores improve over time. Review past calls and identify areas to focus on.',
    preview: <ProgressPreview />,
  },
];

export function FeaturesGrid() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to improve</h2>
          <p className={styles.sectionDesc}>
            Voice-driven practice with AI prospects that push back, score your performance,
            and help you close more deals.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              preview={feature.preview}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
