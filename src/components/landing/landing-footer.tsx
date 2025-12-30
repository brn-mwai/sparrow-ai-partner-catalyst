'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './landing.module.css';

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLogo}>
          <Image
            src="/Logo/sparrow-logo.png"
            alt="Sparrow AI"
            width={80}
            height={26}
            className={styles.footerLogoImg}
          />
        </div>

        <div className={styles.footerLinks}>
          <Link href="/privacy" className={styles.footerLink}>
            Privacy
          </Link>
          <Link href="/terms" className={styles.footerLink}>
            Terms
          </Link>
          <Link href="/cookies" className={styles.footerLink}>
            Cookies
          </Link>
          <Link href="/support" className={styles.footerLink}>
            Support
          </Link>
          <a
            href="https://github.com/brn-mwai/sparrow-ai-partner-catalyst"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
            title="GitHub"
          >
            <i className="ph ph-github-logo" style={{ fontSize: '1.25rem' }}></i>
          </a>
        </div>

        <div className={styles.footerCopyright}>
          &copy; {new Date().getFullYear()} Sparrow AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
