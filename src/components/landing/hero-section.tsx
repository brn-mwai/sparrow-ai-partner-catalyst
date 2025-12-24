'use client';

import Link from 'next/link';
import styles from './landing.module.css';

export function HeroSection() {
  const scrollToDemo = () => {
    const element = document.getElementById('demo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroBadge}>
          <i className="ph ph-microphone"></i>
          AI-Powered Sales Training
        </div>

        <h1 className={styles.heroTitle}>
          Practice on AI,
          <br />
          <span className={styles.heroTitleHighlight}>close on humans</span>
        </h1>

        <p className={styles.heroDesc}>
          Stop winging sales calls. Practice with realistic AI prospects that push back,
          raise objections, and give you instant feedback to improve.
        </p>

        <div className={styles.heroButtons}>
          <Link href="/sign-up" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
            <i className="ph ph-phone-call"></i>
            Start Practicing - Free
          </Link>
          <button
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLg}`}
            onClick={scrollToDemo}
          >
            <i className="ph ph-play"></i>
            Watch Demo
          </button>
        </div>

        <div className={styles.heroChecks}>
          <div className={styles.heroCheck}>
            <i className="ph-bold ph-check-circle"></i>
            <span>3 free practice calls</span>
          </div>
          <div className={styles.heroCheck}>
            <i className="ph-bold ph-check-circle"></i>
            <span>No credit card required</span>
          </div>
          <div className={styles.heroCheck}>
            <i className="ph-bold ph-check-circle"></i>
            <span>Real-time AI feedback</span>
          </div>
        </div>
      </div>
    </section>
  );
}
