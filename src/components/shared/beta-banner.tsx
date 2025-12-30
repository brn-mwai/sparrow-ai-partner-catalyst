'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BetaBannerProps {
  variant?: 'landing' | 'dashboard';
}

export function BetaBanner({ variant = 'landing' }: BetaBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const isDashboard = variant === 'dashboard';

  return (
    <div className={`beta-banner ${isDashboard ? 'beta-banner-dashboard' : ''}`}>
      <div className="beta-banner-content">
        <span className="beta-badge">BETA</span>
        <span className="beta-text">
          MVP built for the AI Partner Catalyst Hackathon by Google Cloud
        </span>
        <Link
          href="https://ai-partner-catalyst.devpost.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="beta-link"
        >
          Learn more
          <i className="ph ph-arrow-right"></i>
        </Link>
      </div>
      <button
        className="beta-close"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss banner"
      >
        <i className="ph ph-x"></i>
      </button>
    </div>
  );
}
