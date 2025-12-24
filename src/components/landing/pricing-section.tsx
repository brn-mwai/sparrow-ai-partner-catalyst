'use client';

import { PricingCard, type PricingPlan } from './pricing-card';
import styles from './landing.module.css';

const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Try it out',
    features: [
      '3 practice calls per month',
      'All 3 practice modes',
      '2 AI personas',
      'Basic scoring & feedback',
    ],
    ctaText: 'Get Started',
  },
  {
    name: 'Pro',
    price: 19,
    period: 'month',
    description: 'For serious improvement',
    features: [
      'Unlimited practice calls',
      'All 3 practice modes',
      'All 6 AI personas',
      'Detailed scoring & feedback',
      'Progress tracking dashboard',
      'Call history & transcripts',
    ],
    featured: true,
    ctaText: 'Get Started',
  },
  {
    name: 'Team',
    price: 49,
    period: 'user/month',
    description: 'For sales teams',
    features: [
      'Everything in Pro',
      'Team analytics dashboard',
      'Manager leaderboards',
      'Custom personas (coming soon)',
      'Priority support',
    ],
    ctaText: 'Contact Sales',
  },
];

export function PricingSection() {
  return (
    <section className={styles.section} id="pricing">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p className={styles.sectionDesc}>
            Start free. Upgrade when you&apos;re ready to close more deals.
          </p>
        </div>

        <div className={styles.pricingGrid}>
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
