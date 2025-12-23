'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour.css';

const tourSteps: DriveStep[] = [
  {
    element: '.dashboard-page-header',
    popover: {
      title: 'Welcome to Sparrow! 🎉',
      description: 'This is your personal sales training dashboard. Let me show you around!',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '.quick-start-section',
    popover: {
      title: 'Start Practicing',
      description: 'Choose a practice mode: Cold Call to practice openers, Discovery to uncover pain points, or Objection Gauntlet to handle pushback.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '.stats-grid',
    popover: {
      title: 'Track Your Progress',
      description: 'See your key metrics at a glance: total calls, average score, current streak, and weekly activity.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.focus-area-card',
    popover: {
      title: 'Focus Area',
      description: "We'll identify your weakest skill and suggest targeted practice to help you improve faster.",
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.recent-calls',
    popover: {
      title: 'Recent Calls',
      description: 'Review your past practice sessions, see scores, and click to view detailed feedback.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.skill-preview-card',
    popover: {
      title: 'Skill Breakdown',
      description: "Track your performance across 5 key sales skills. We'll score each call on these dimensions.",
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.sidebar-nav',
    popover: {
      title: 'Navigation',
      description: 'Use the sidebar to navigate: Practice for new calls, History for past calls, Progress for detailed analytics, and Settings for preferences.',
      side: 'right',
      align: 'start',
    },
  },
  {
    popover: {
      title: "You're All Set! 🚀",
      description: "Ready to sharpen your sales skills? Click 'Start Practicing' to begin your first call!",
    },
  },
];

export function DashboardTour() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasShownTour, setHasShownTour] = useState(false);

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: 'rgba(27, 17, 58, 0.7)',
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'sparrow-tour-popover',
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Get Started!',
      onDestroyStarted: () => {
        // Mark tour as completed
        localStorage.setItem('sparrow_tour_completed', 'true');
        driverObj.destroy();

        // Remove tour param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('tour');
        router.replace(url.pathname, { scroll: false });
      },
      steps: tourSteps,
    });

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      driverObj.drive();
    }, 500);
  }, [router]);

  useEffect(() => {
    const shouldShowTour = searchParams.get('tour') === 'true';
    const tourCompleted = localStorage.getItem('sparrow_tour_completed');

    if (shouldShowTour && !tourCompleted && !hasShownTour) {
      setHasShownTour(true);
      startTour();
    }
  }, [searchParams, hasShownTour, startTour]);

  // This component doesn't render anything visible
  return null;
}

// Hook to manually trigger the tour
export function useDashboardTour() {
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: 'rgba(27, 17, 58, 0.7)',
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'sparrow-tour-popover',
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done',
      steps: tourSteps,
    });

    driverObj.drive();
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem('sparrow_tour_completed');
  }, []);

  return { startTour, resetTour };
}
