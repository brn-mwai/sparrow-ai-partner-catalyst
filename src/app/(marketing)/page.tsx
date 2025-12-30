'use client';

import { useState } from 'react';
import {
  LandingHeader,
  MobileNav,
  HeroSection,
  PreviewSection,
  FeaturesGrid,
  StepsSection,
  PricingSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';
import { BetaBanner } from '@/components/shared/beta-banner';

export default function LandingPage() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <>
      <BetaBanner variant="landing" />
      <LandingHeader onMobileMenuClick={handleMobileNavToggle} />
      <MobileNav isOpen={isMobileNavOpen} onClose={handleMobileNavClose} />

      <main>
        <HeroSection />
        <PreviewSection />
        <FeaturesGrid />
        <StepsSection />
        <PricingSection />
        <CTASection />
      </main>

      <LandingFooter />
    </>
  );
}
