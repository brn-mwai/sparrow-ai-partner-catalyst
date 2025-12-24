'use client';

import Link from 'next/link';
import styles from './landing.module.css';

export function CTASection() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>Ready to close more deals?</h2>
        <p className={styles.ctaDesc}>
          Stop practicing on real prospects. Start training with AI that pushes back like real buyers.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/sign-up" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
            <i className="ph ph-phone-call"></i>
            Start Practicing - Free
          </Link>
        </div>
      </div>
    </section>
  );
}
