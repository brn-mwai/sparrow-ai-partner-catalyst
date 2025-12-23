'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import './onboarding.css';

type Step = 'role' | 'industry' | 'goals';

interface OnboardingData {
  role: string;
  industry: string;
  goals: string[];
  company_name: string;
}

const roles = [
  {
    id: 'sdr',
    title: 'SDR / BDR',
    description: 'Book meetings and qualify leads',
    icon: 'ph-phone-outgoing',
  },
  {
    id: 'ae',
    title: 'Account Executive',
    description: 'Run demos and close deals',
    icon: 'ph-presentation-chart',
  },
  {
    id: 'manager',
    title: 'Sales Manager',
    description: 'Coach and lead a team',
    icon: 'ph-users-three',
  },
  {
    id: 'founder',
    title: 'Founder / CEO',
    description: 'Sell your own product',
    icon: 'ph-rocket-launch',
  },
];

const industries = [
  { id: 'saas', label: 'SaaS / Software', icon: 'ph-cloud' },
  { id: 'fintech', label: 'Fintech', icon: 'ph-currency-dollar' },
  { id: 'healthcare', label: 'Healthcare', icon: 'ph-heartbeat' },
  { id: 'ecommerce', label: 'E-commerce', icon: 'ph-shopping-cart' },
  { id: 'agency', label: 'Agency / Services', icon: 'ph-briefcase' },
  { id: 'manufacturing', label: 'Manufacturing', icon: 'ph-factory' },
  { id: 'real_estate', label: 'Real Estate', icon: 'ph-buildings' },
  { id: 'education', label: 'Education', icon: 'ph-graduation-cap' },
  { id: 'other', label: 'Other', icon: 'ph-dots-three' },
];

const goals = [
  {
    id: 'cold_calling',
    label: 'Cold Calling',
    description: 'Get better at opening cold calls',
    icon: 'ph-phone-call',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    description: 'Ask better questions, uncover pain',
    icon: 'ph-magnifying-glass',
  },
  {
    id: 'objections',
    label: 'Objection Handling',
    description: 'Handle pushback with confidence',
    icon: 'ph-shield',
  },
  {
    id: 'closing',
    label: 'Closing',
    description: 'Ask for the meeting or next step',
    icon: 'ph-handshake',
  },
  {
    id: 'confidence',
    label: 'Build Confidence',
    description: 'Feel more comfortable on calls',
    icon: 'ph-trophy',
  },
  {
    id: 'consistency',
    label: 'Be More Consistent',
    description: 'Develop reliable call patterns',
    icon: 'ph-chart-line-up',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState<Step>('role');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    industry: '',
    goals: [],
    company_name: '',
  });

  const handleRoleSelect = (roleId: string) => {
    setData(prev => ({ ...prev, role: roleId }));
    setStep('industry');
  };

  const handleIndustrySelect = (industryId: string) => {
    setData(prev => ({ ...prev, industry: industryId }));
    setStep('goals');
  };

  const handleGoalToggle = (goalId: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId],
    }));
  };

  const handleComplete = async () => {
    if (data.goals.length === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Redirect to dashboard with tour param
        router.push('/dashboard?tour=true');
      } else {
        console.error('Onboarding failed');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'industry') setStep('role');
    else if (step === 'goals') setStep('industry');
  };

  const getStepNumber = () => {
    switch (step) {
      case 'role': return 1;
      case 'industry': return 2;
      case 'goals': return 3;
    }
  };

  return (
    <div className="onboarding-page">
      {/* Background decoration */}
      <div className="onboarding-bg">
        <div className="onboarding-bg-gradient" />
        <div className="onboarding-bg-circles">
          <div className="bg-circle bg-circle-1" />
          <div className="bg-circle bg-circle-2" />
          <div className="bg-circle bg-circle-3" />
        </div>
      </div>

      <div className="onboarding-container">
        {/* Logo */}
        <div className="onboarding-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="var(--primary-500)" />
            <path
              d="M10 20L16 12L22 20"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Sparrow</span>
        </div>

        {/* Progress indicator */}
        <div className="onboarding-progress">
          <div className="progress-steps">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`progress-step ${num <= getStepNumber() ? 'active' : ''} ${num < getStepNumber() ? 'completed' : ''}`}
              >
                {num < getStepNumber() ? (
                  <i className="ph-fill ph-check" />
                ) : (
                  num
                )}
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((getStepNumber() - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Welcome message */}
        <div className="onboarding-header">
          <h1>
            {step === 'role' && `Welcome${user?.firstName ? `, ${user.firstName}` : ''}!`}
            {step === 'industry' && 'What industry are you in?'}
            {step === 'goals' && 'What do you want to improve?'}
          </h1>
          <p>
            {step === 'role' && "Let's personalize your experience. What's your role?"}
            {step === 'industry' && "This helps us create more realistic practice scenarios."}
            {step === 'goals' && "Select all that apply. We'll focus your training here."}
          </p>
        </div>

        {/* Step content */}
        <div className="onboarding-content">
          {step === 'role' && (
            <div className="option-grid role-grid">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className={`option-card ${data.role === role.id ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <div className="option-icon">
                    <i className={`ph ${role.icon}`} />
                  </div>
                  <div className="option-content">
                    <h3>{role.title}</h3>
                    <p>{role.description}</p>
                  </div>
                  <div className="option-check">
                    <i className="ph-fill ph-check-circle" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'industry' && (
            <div className="option-grid industry-grid">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  className={`option-card compact ${data.industry === industry.id ? 'selected' : ''}`}
                  onClick={() => handleIndustrySelect(industry.id)}
                >
                  <div className="option-icon small">
                    <i className={`ph ${industry.icon}`} />
                  </div>
                  <span>{industry.label}</span>
                  <div className="option-check">
                    <i className="ph-fill ph-check-circle" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'goals' && (
            <>
              <div className="option-grid goals-grid">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    className={`option-card ${data.goals.includes(goal.id) ? 'selected' : ''}`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <div className="option-icon">
                      <i className={`ph ${goal.icon}`} />
                    </div>
                    <div className="option-content">
                      <h3>{goal.label}</h3>
                      <p>{goal.description}</p>
                    </div>
                    <div className="option-check">
                      {data.goals.includes(goal.id) ? (
                        <i className="ph-fill ph-check-square" />
                      ) : (
                        <i className="ph ph-square" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="onboarding-actions">
                <button
                  className="btn-secondary"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <i className="ph ph-arrow-left" />
                  Back
                </button>
                <button
                  className="btn-primary"
                  onClick={handleComplete}
                  disabled={data.goals.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="ph ph-spinner animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Get Started
                      <i className="ph ph-arrow-right" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Back button for non-final steps */}
        {step !== 'role' && step !== 'goals' && (
          <button className="back-button" onClick={handleBack}>
            <i className="ph ph-arrow-left" />
            Back
          </button>
        )}
      </div>
    </div>
  );
}
