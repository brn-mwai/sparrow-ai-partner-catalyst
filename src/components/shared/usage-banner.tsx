'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UsageData {
  plan: 'free' | 'starter' | 'pro';
  planName: string;
  callsUsed: number;
  callsLimit: number;
  callsRemaining: number;
  isUnlimited: boolean;
  percentUsed: number;
}

interface UsageBannerProps {
  className?: string;
  compact?: boolean;
}

export function UsageBanner({ className = '', compact = false }: UsageBannerProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/user/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !usage) {
    return null;
  }

  // Don't show for unlimited plans
  if (usage.isUnlimited) {
    return null;
  }

  const isAtLimit = usage.callsRemaining === 0;
  const isNearLimit = usage.callsRemaining === 1;

  if (compact) {
    return (
      <div className={`usage-badge ${isAtLimit ? 'at-limit' : isNearLimit ? 'near-limit' : ''} ${className}`}>
        <i className="ph ph-lightning"></i>
        <span>
          {usage.callsRemaining}/{usage.callsLimit} calls
        </span>
      </div>
    );
  }

  return (
    <div className={`usage-banner ${isAtLimit ? 'at-limit' : isNearLimit ? 'near-limit' : ''} ${className}`}>
      <div className="usage-banner-content">
        <div className="usage-banner-info">
          <div className="usage-banner-header">
            <span className="usage-plan-badge">{usage.planName} Plan</span>
            {isAtLimit && (
              <span className="usage-limit-badge">
                <i className="ph ph-warning-circle"></i>
                Limit Reached
              </span>
            )}
          </div>
          <div className="usage-banner-stats">
            <span className="usage-count">
              <strong>{usage.callsUsed}</strong> of <strong>{usage.callsLimit}</strong> calls used
            </span>
            {!isAtLimit && (
              <span className="usage-remaining">
                {usage.callsRemaining} remaining
              </span>
            )}
          </div>
          <div className="usage-progress-bar">
            <div
              className="usage-progress-fill"
              style={{ width: `${usage.percentUsed}%` }}
            />
          </div>
        </div>
        {isAtLimit ? (
          <Link href="/pricing" className="btn btn-primary btn-sm">
            <i className="ph ph-rocket-launch"></i>
            Upgrade Now
          </Link>
        ) : isNearLimit ? (
          <Link href="/pricing" className="btn btn-secondary btn-sm">
            <i className="ph ph-arrow-up"></i>
            Upgrade
          </Link>
        ) : null}
      </div>
      {isAtLimit && (
        <p className="usage-banner-message">
          You've reached your free plan limit. Upgrade to continue practicing and improving your sales skills.
        </p>
      )}
    </div>
  );
}

export default UsageBanner;
