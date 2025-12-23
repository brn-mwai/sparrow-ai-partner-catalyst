'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { UserRole, DifficultyLevel, CallType } from '@/types/database';

interface UserPreferences {
  default_difficulty?: DifficultyLevel;
  default_call_type?: CallType;
  default_industry?: string;
  voice_style?: 'professional' | 'casual';
  coaching_tips_enabled?: boolean;
}

interface UserProfile {
  name: string;
  role: UserRole | null;
  industry: string;
  company: string;
  preferences: UserPreferences;
}

export default function SettingsPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    role: null,
    industry: '',
    company: '',
    preferences: {
      default_difficulty: 'medium',
      default_call_type: 'cold_call',
      coaching_tips_enabled: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success && data.user) {
        setProfile({
          name: data.user.name || '',
          role: data.user.role,
          industry: data.user.industry || '',
          company: data.user.company || '',
          preferences: data.user.preferences || {
            default_difficulty: 'medium',
            default_call_type: 'cold_call',
            coaching_tips_enabled: true,
          },
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Settings</h1>
          <p className="dashboard-page-subtitle">Manage your profile and training preferences</p>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`settings-message ${saveMessage.type}`}>
          <i className={`ph ${saveMessage.type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}`}></i>
          {saveMessage.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Profile Information</h2>
          <p className="settings-section-desc">Your profile helps personalize your training experience</p>
        </div>
        <div className="settings-form">
          <div className="settings-form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          <div className="settings-form-row">
            <div className="settings-form-group">
              <label>Company</label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                placeholder="Where do you work?"
              />
            </div>
            <div className="settings-form-group">
              <label>Industry</label>
              <select
                value={profile.industry}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="settings-select"
              >
                <option value="">Select industry</option>
                <option value="saas">SaaS / Software</option>
                <option value="fintech">FinTech</option>
                <option value="healthcare">Healthcare</option>
                <option value="e-commerce">E-Commerce</option>
                <option value="consulting">Consulting</option>
                <option value="marketing">Marketing / Agency</option>
                <option value="real-estate">Real Estate</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="settings-form-group">
            <label>Role</label>
            <select
              value={profile.role || ''}
              onChange={(e) => setProfile({ ...profile, role: e.target.value as UserRole })}
              className="settings-select"
            >
              <option value="">Select your role</option>
              <option value="sdr">SDR (Sales Development Rep)</option>
              <option value="ae">AE (Account Executive)</option>
              <option value="manager">Sales Manager</option>
              <option value="founder">Founder / CEO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Training Preferences Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Training Preferences</h2>
          <p className="settings-section-desc">Customize your default practice settings</p>
        </div>
        <div className="settings-form">
          <div className="settings-form-row">
            <div className="settings-form-group">
              <label>Default Call Type</label>
              <select
                value={profile.preferences.default_call_type || 'cold_call'}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      default_call_type: e.target.value as CallType,
                    },
                  })
                }
                className="settings-select"
              >
                <option value="cold_call">Cold Call</option>
                <option value="discovery">Discovery Call</option>
                <option value="objection_gauntlet">Objection Gauntlet</option>
              </select>
            </div>
            <div className="settings-form-group">
              <label>Default Difficulty</label>
              <select
                value={profile.preferences.default_difficulty || 'medium'}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      default_difficulty: e.target.value as DifficultyLevel,
                    },
                  })
                }
                className="settings-select"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="brutal">Brutal</option>
              </select>
            </div>
          </div>
          <div className="settings-form-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                checked={profile.preferences.coaching_tips_enabled ?? true}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      coaching_tips_enabled: e.target.checked,
                    },
                  })
                }
              />
              <span>Show coaching tips during calls</span>
            </label>
            <span className="settings-help-text">
              Display helpful suggestions while youre practicing
            </span>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Account</h2>
          <p className="settings-section-desc">Your account information</p>
        </div>
        <div className="settings-account-info">
          <div className="settings-account-row">
            <span className="settings-account-label">Email</span>
            <span className="settings-account-value">{user?.primaryEmailAddress?.emailAddress || 'Not available'}</span>
          </div>
          <div className="settings-account-row">
            <span className="settings-account-label">Account created</span>
            <span className="settings-account-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-actions">
        <button className="settings-save-btn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <i className="ph ph-spinner animate-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="ph ph-check"></i>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
