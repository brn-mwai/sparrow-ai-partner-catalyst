'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UsageBanner } from '@/components/shared/usage-banner';
import type { CallType, PersonalityType, DifficultyLevel, PersonaConfig } from '@/types/database';

interface PracticeMode {
  id: CallType;
  label: string;
  icon: string;
  description: string;
  tips: string[];
}

const practiceModes: PracticeMode[] = [
  {
    id: 'cold_call',
    label: 'Cold Call',
    icon: 'ph-phone-outgoing',
    description: 'Practice opening calls and booking meetings with prospects who weren\'t expecting your call.',
    tips: [
      'Lead with a pattern interrupt',
      'Earn the right to ask questions',
      'Focus on booking the meeting, not selling',
    ],
  },
  {
    id: 'discovery',
    label: 'Discovery',
    icon: 'ph-magnifying-glass',
    description: 'Practice uncovering pain points and qualifying opportunities through strategic questioning.',
    tips: [
      'Ask open-ended questions',
      'Dig into the impact of problems',
      'Listen more than you talk',
    ],
  },
  {
    id: 'objection_gauntlet',
    label: 'Objection Gauntlet',
    icon: 'ph-shield',
    description: 'Face rapid-fire objections and practice handling pushback with confidence.',
    tips: [
      'Acknowledge before reframing',
      'Ask questions to understand the objection',
      'Don\'t get defensive',
    ],
  },
];

const industries = [
  'SaaS / Tech',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Professional Services',
  'Retail / E-commerce',
  'Real Estate',
  'Other',
];

const roles = [
  'VP / Director of Operations',
  'VP / Director of Sales',
  'VP / Director of Marketing',
  'CTO / Technical Lead',
  'CFO / Finance Director',
  'CEO / Founder',
  'Procurement Manager',
  'IT Manager',
];

const personalities: { id: PersonalityType; label: string; description: string; icon: string }[] = [
  { id: 'skeptical', label: 'Skeptical', description: 'Questions everything, needs proof', icon: 'ph-question' },
  { id: 'busy', label: 'Busy', description: 'Short on time, needs quick value', icon: 'ph-clock' },
  { id: 'friendly', label: 'Friendly', description: 'Open to conversation, but still needs convincing', icon: 'ph-smiley' },
  { id: 'technical', label: 'Technical', description: 'Wants details and specifics', icon: 'ph-gear' },
];

const difficulties: { id: DifficultyLevel; label: string; description: string; color: string }[] = [
  { id: 'easy', label: 'Easy', description: 'Warm prospect, few objections', color: '#10b981' },
  { id: 'medium', label: 'Medium', description: 'Balanced challenge', color: '#f59e0b' },
  { id: 'hard', label: 'Hard', description: 'Tough prospect, many objections', color: '#ef4444' },
  { id: 'brutal', label: 'Brutal', description: 'Expert mode - they can hang up', color: '#7c3aed' },
];

function PracticePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState<CallType | null>(
    (searchParams.get('type') as CallType) || null
  );
  const [selectedIndustry, setSelectedIndustry] = useState('SaaS / Tech');
  const [selectedRole, setSelectedRole] = useState('VP / Director of Operations');
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityType>('skeptical');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPersona, setGeneratedPersona] = useState<PersonaConfig | null>(null);
  const [generatedProspectId, setGeneratedProspectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ limit: number; plan: string } | null>(null);

  useEffect(() => {
    const type = searchParams.get('type') as CallType;
    if (type && practiceModes.find(m => m.id === type)) {
      setSelectedMode(type);
      setStep(2);
    }
  }, [searchParams]);

  const handleModeSelect = (mode: CallType) => {
    setSelectedMode(mode);
    setStep(2);
  };

  const handleGeneratePersona = async () => {
    if (!selectedMode) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: selectedIndustry,
          role: selectedRole,
          personality: selectedPersonality,
          difficulty: selectedDifficulty,
          callType: selectedMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate persona');
      }

      const data = await response.json();
      setGeneratedPersona(data.persona);
      setGeneratedProspectId(data.prospectId || null); // Store the saved prospect ID
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartCall = async () => {
    if (!generatedPersona || !selectedMode) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedMode,
          persona: generatedPersona,
          prospectId: generatedProspectId, // Link call to saved prospect
        }),
      });

      const data = await response.json();

      // Handle rate limit error
      if (response.status === 429) {
        setRateLimitInfo({
          limit: data.limit,
          plan: data.plan,
        });
        setShowRateLimitModal(true);
        setIsGenerating(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start call');
      }

      // Store call data in sessionStorage for the call page
      sessionStorage.setItem(`call_${data.callId}`, JSON.stringify({
        callId: data.callId,
        persona: generatedPersona,
        callType: selectedMode,
        elevenlabs: data.elevenlabs,
      }));

      router.push(`/dashboard/call/${data.callId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsGenerating(false);
    }
  };

  const selectedModeData = practiceModes.find(m => m.id === selectedMode);

  return (
    <div className="practice-page">
      {/* Usage Banner */}
      <UsageBanner />

      {/* Header */}
      <div className="practice-header">
        <Link href="/dashboard" className="back-link">
          <i className="ph ph-arrow-left"></i>
          Back to Dashboard
        </Link>
        <h1>Practice Session</h1>
        <p>Configure your AI prospect and start practicing</p>
      </div>

      {/* Progress Steps */}
      <div className="practice-steps">
        <div className={`practice-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">{step > 1 ? <i className="ph ph-check"></i> : '1'}</div>
          <span>Choose Mode</span>
        </div>
        <div className="step-connector"></div>
        <div className={`practice-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">{step > 2 ? <i className="ph ph-check"></i> : '2'}</div>
          <span>Configure Prospect</span>
        </div>
        <div className="step-connector"></div>
        <div className={`practice-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>Review & Start</span>
        </div>
      </div>

      {/* Step 1: Select Mode */}
      {step === 1 && (
        <div className="practice-step-content">
          <h2>What do you want to practice?</h2>
          <div className="mode-grid">
            {practiceModes.map((mode) => (
              <button
                key={mode.id}
                className={`mode-card ${selectedMode === mode.id ? 'selected' : ''}`}
                onClick={() => handleModeSelect(mode.id)}
              >
                <div className="mode-icon">
                  <i className={`ph ${mode.icon}`}></i>
                </div>
                <h3>{mode.label}</h3>
                <p>{mode.description}</p>
                <div className="mode-tips">
                  <strong>Tips:</strong>
                  <ul>
                    {mode.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Configure Prospect */}
      {step === 2 && (
        <div className="practice-step-content">
          <h2>Configure your AI prospect</h2>

          {selectedModeData && (
            <div className="selected-mode-badge">
              <i className={`ph ${selectedModeData.icon}`}></i>
              {selectedModeData.label}
              <button onClick={() => setStep(1)} className="change-mode-btn">
                Change
              </button>
            </div>
          )}

          <div className="config-grid">
            {/* Industry */}
            <div className="config-section">
              <label>Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="config-section">
              <label>Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Personality */}
            <div className="config-section full-width">
              <label>Personality Type</label>
              <div className="personality-grid">
                {personalities.map((p) => (
                  <button
                    key={p.id}
                    className={`personality-option ${selectedPersonality === p.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPersonality(p.id)}
                  >
                    <i className={`ph ${p.icon}`}></i>
                    <span className="personality-label">{p.label}</span>
                    <span className="personality-desc">{p.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="config-section full-width">
              <label>Difficulty</label>
              <div className="difficulty-slider">
                {difficulties.map((d) => (
                  <button
                    key={d.id}
                    className={`difficulty-option ${selectedDifficulty === d.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDifficulty(d.id)}
                    style={{ '--difficulty-color': d.color } as React.CSSProperties}
                  >
                    <span className="difficulty-label">{d.label}</span>
                    <span className="difficulty-desc">{d.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="ph ph-warning"></i>
              {error}
            </div>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              <i className="ph ph-arrow-left"></i>
              Back
            </button>
            <button
              className="btn-primary"
              onClick={handleGeneratePersona}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <i className="ph ph-spinner animate-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  Generate Prospect
                  <i className="ph ph-arrow-right"></i>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Start */}
      {step === 3 && generatedPersona && (
        <div className="practice-step-content">
          <h2>Meet your prospect</h2>

          <div className="persona-card">
            <div className="persona-header">
              <div className="persona-avatar">
                {generatedPersona.name ? generatedPersona.name.split(' ').map(n => n[0]).join('') : '?'}
              </div>
              <div className="persona-info">
                <h3>{generatedPersona.name}</h3>
                <p>{generatedPersona.title}</p>
                <p className="persona-company">
                  <i className="ph ph-buildings"></i>
                  {generatedPersona.company} • {generatedPersona.company_size}
                </p>
              </div>
              <div className="persona-badges">
                <span className={`badge badge-${selectedPersonality}`}>
                  {selectedPersonality}
                </span>
                <span className={`badge badge-${selectedDifficulty}`}>
                  {selectedDifficulty}
                </span>
              </div>
            </div>

            <div className="persona-background">
              <h4>
                <i className="ph ph-user"></i>
                Background
              </h4>
              <p>{generatedPersona.background}</p>
            </div>

            <div className="persona-goal">
              <h4>
                <i className="ph ph-target"></i>
                Your Goal
              </h4>
              <p>{generatedPersona.goal_for_rep}</p>
            </div>

            <div className="persona-objections">
              <h4>
                <i className="ph ph-warning-circle"></i>
                Expected Objections
              </h4>
              <ul>
                {generatedPersona.objections.map((obj, i) => (
                  <li key={i}>"{obj}"</li>
                ))}
              </ul>
            </div>

            <div className="persona-tips">
              <h4>
                <i className="ph ph-lightbulb"></i>
                Tips
              </h4>
              <ul>
                {generatedPersona.triggers.positive.map((trigger, i) => (
                  <li key={i} className="tip-positive">
                    <i className="ph ph-check-circle"></i>
                    {trigger}
                  </li>
                ))}
                {generatedPersona.triggers.negative.slice(0, 2).map((trigger, i) => (
                  <li key={i} className="tip-negative">
                    <i className="ph ph-x-circle"></i>
                    Avoid: {trigger}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="ph ph-warning"></i>
              {error}
            </div>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              <i className="ph ph-arrow-left"></i>
              Change Settings
            </button>
            <button
              className="btn-secondary"
              onClick={handleGeneratePersona}
              disabled={isGenerating}
            >
              <i className="ph ph-arrows-clockwise"></i>
              Generate New Prospect
            </button>
            <button
              className="btn-primary btn-large"
              onClick={handleStartCall}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <i className="ph ph-spinner animate-spin"></i>
                  Starting Call...
                </>
              ) : (
                <>
                  <i className="ph ph-phone-call"></i>
                  Start Call
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Rate Limit Modal */}
      {showRateLimitModal && (
        <div className="modal-overlay" onClick={() => setShowRateLimitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="rate-limit-modal">
              <div className="rate-limit-modal-icon">
                <i className="ph ph-warning-circle"></i>
              </div>
              <h2>Call Limit Reached</h2>
              <p>
                You've used all {rateLimitInfo?.limit} practice calls on the {rateLimitInfo?.plan} plan.
                Upgrade to continue improving your sales skills!
              </p>
              <div className="rate-limit-modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRateLimitModal(false)}
                >
                  Maybe Later
                </button>
                <Link href="/pricing" className="btn btn-primary">
                  <i className="ph ph-rocket-launch"></i>
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PracticeLoading() {
  return (
    <div className="practice-page">
      <div className="practice-header">
        <div className="loading-placeholder" style={{ width: 150, height: 20 }}></div>
        <div className="loading-placeholder" style={{ width: 200, height: 32, marginTop: 12 }}></div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PracticeLoading />}>
      <PracticePageContent />
    </Suspense>
  );
}
