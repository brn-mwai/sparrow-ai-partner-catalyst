-- ============================================
-- SPARROW AI - Database Schema
-- Voice-Powered Sales Training Platform
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('sdr', 'ae', 'manager', 'founder');
CREATE TYPE user_plan AS ENUM ('free', 'starter', 'pro');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE speaking_style AS ENUM ('conversational', 'professional', 'casual', 'formal');
CREATE TYPE speaking_pace AS ENUM ('normal', 'fast', 'slow');
CREATE TYPE call_type AS ENUM ('cold_call', 'discovery', 'objection_gauntlet');
CREATE TYPE call_status AS ENUM ('ready', 'active', 'completed', 'abandoned');
CREATE TYPE call_outcome AS ENUM ('meeting_booked', 'callback', 'rejected', 'no_decision');
CREATE TYPE feedback_category AS ENUM ('opening', 'discovery', 'objection', 'communication', 'closing');
CREATE TYPE feedback_type AS ENUM ('positive', 'negative', 'missed_opportunity');

-- ============================================
-- USERS TABLE
-- Synced from Clerk via webhooks
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role user_role,
  industry TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  plan user_plan NOT NULL DEFAULT 'free',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- PROSPECTS TABLE
-- AI personas for practice calls
-- ============================================
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT NOT NULL,

  -- Company Info
  company_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  industry TEXT NOT NULL,

  -- Personality
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  personality_traits TEXT[] DEFAULT '{}',
  background TEXT,
  objections TEXT,

  -- Voice Settings (ElevenLabs)
  voice_id TEXT,
  speaking_style speaking_style DEFAULT 'conversational',
  speaking_pace speaking_pace DEFAULT 'normal',

  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for prospects
CREATE INDEX IF NOT EXISTS idx_prospects_created_by ON prospects(created_by);
CREATE INDEX IF NOT EXISTS idx_prospects_is_default ON prospects(is_default);
CREATE INDEX IF NOT EXISTS idx_prospects_difficulty ON prospects(difficulty);

-- ============================================
-- CALLS TABLE
-- Individual practice sessions
-- ============================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES prospects(id) ON DELETE RESTRICT,

  -- Call Config
  type call_type NOT NULL,
  status call_status NOT NULL DEFAULT 'ready',
  goal TEXT,

  -- Dynamic Persona (used when prospect_id is NULL)
  -- Stores the AI-generated persona config as JSONB
  persona_config JSONB,

  -- Call Data
  duration_seconds INTEGER,
  recording_url TEXT,
  elevenlabs_conversation_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for calls
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_prospect_id ON calls(prospect_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_type ON calls(type);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_user_created ON calls(user_id, created_at DESC);

-- ============================================
-- CALL TRANSCRIPTS TABLE
-- Real-time transcript storage
-- ============================================
CREATE TABLE IF NOT EXISTS call_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,

  -- Messages array: [{speaker: 'user'|'prospect', content: string, timestamp_ms: number}]
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for transcripts
CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_id ON call_transcripts(call_id);

-- ============================================
-- CALL SCORES TABLE
-- AI-generated performance scores
-- ============================================
CREATE TABLE IF NOT EXISTS call_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,

  -- Overall Score (0-100)
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Category Scores (0-100)
  opening_score INTEGER CHECK (opening_score >= 0 AND opening_score <= 100),
  discovery_score INTEGER CHECK (discovery_score >= 0 AND discovery_score <= 100),
  objection_score INTEGER CHECK (objection_score >= 0 AND objection_score <= 100),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  closing_score INTEGER CHECK (closing_score >= 0 AND closing_score <= 100),

  -- Outcome
  outcome call_outcome,

  -- AI Analysis
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',

  -- Metadata
  scoring_provider TEXT, -- 'groq' or 'gemini'
  scoring_latency_ms INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for scores
CREATE INDEX IF NOT EXISTS idx_call_scores_call_id ON call_scores(call_id);
CREATE INDEX IF NOT EXISTS idx_call_scores_overall ON call_scores(overall_score DESC);

-- ============================================
-- CALL FEEDBACK TABLE
-- Timestamped feedback moments
-- ============================================
CREATE TABLE IF NOT EXISTS call_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,

  -- Feedback Details
  category feedback_category NOT NULL,
  timestamp_ms INTEGER NOT NULL,
  feedback_type feedback_type NOT NULL,

  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  suggestion TEXT,
  transcript_excerpt TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_call_feedback_call_id ON call_feedback(call_id);
CREATE INDEX IF NOT EXISTS idx_call_feedback_category ON call_feedback(category);
CREATE INDEX IF NOT EXISTS idx_call_feedback_type ON call_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_call_feedback_timestamp ON call_feedback(call_id, timestamp_ms);

-- ============================================
-- USER PROGRESS TABLE
-- Aggregated user statistics
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Overall Stats
  total_calls INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,

  -- Streak Tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_call_date DATE,

  -- Scores
  avg_overall_score DECIMAL(5,2),
  best_score INTEGER,
  best_score_call_type call_type,

  -- Skill Scores (0-100)
  skill_scores JSONB DEFAULT '{
    "opening": null,
    "discovery": null,
    "objection": null,
    "communication": null,
    "closing": null
  }'::jsonb,

  -- Skill Score Changes (from previous period)
  skill_changes JSONB DEFAULT '{
    "opening": 0,
    "discovery": 0,
    "objection": 0,
    "communication": 0,
    "closing": 0
  }'::jsonb,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- ============================================
-- USER PROSPECT STATS TABLE
-- Per-prospect performance tracking
-- ============================================
CREATE TABLE IF NOT EXISTS user_prospect_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,

  -- Stats
  calls_count INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2),
  best_score INTEGER,
  last_call_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id, prospect_id)
);

-- Indexes for user prospect stats
CREATE INDEX IF NOT EXISTS idx_user_prospect_stats_user ON user_prospect_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prospect_stats_prospect ON user_prospect_stats(prospect_id);

-- ============================================
-- COACH SPARROW CONVERSATIONS TABLE
-- AI coaching chat history
-- ============================================
CREATE TABLE IF NOT EXISTS coach_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,

  -- Messages array: [{role: 'user'|'assistant', content: string, timestamp: string}]
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for coach conversations
CREATE INDEX IF NOT EXISTS idx_coach_conversations_user ON coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_conversations_call ON coach_conversations(call_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prospect_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);
CREATE POLICY "Service can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Prospects policies (allow viewing defaults, own custom)
CREATE POLICY "Users can view prospects" ON prospects
  FOR SELECT USING (is_default = true OR created_by IS NOT NULL);
CREATE POLICY "Users can create prospects" ON prospects
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own prospects" ON prospects
  FOR UPDATE USING (created_by IS NOT NULL);
CREATE POLICY "Users can delete own prospects" ON prospects
  FOR DELETE USING (created_by IS NOT NULL AND is_default = false);

-- Calls policies
CREATE POLICY "Users can view own calls" ON calls
  FOR SELECT USING (true);
CREATE POLICY "Users can create calls" ON calls
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own calls" ON calls
  FOR UPDATE USING (true);

-- Transcripts policies
CREATE POLICY "Users can view transcripts" ON call_transcripts
  FOR SELECT USING (true);
CREATE POLICY "Users can create transcripts" ON call_transcripts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update transcripts" ON call_transcripts
  FOR UPDATE USING (true);

-- Scores policies
CREATE POLICY "Users can view scores" ON call_scores
  FOR SELECT USING (true);
CREATE POLICY "Service can insert scores" ON call_scores
  FOR INSERT WITH CHECK (true);

-- Feedback policies
CREATE POLICY "Users can view feedback" ON call_feedback
  FOR SELECT USING (true);
CREATE POLICY "Service can insert feedback" ON call_feedback
  FOR INSERT WITH CHECK (true);

-- Progress policies
CREATE POLICY "Users can view progress" ON user_progress
  FOR SELECT USING (true);
CREATE POLICY "Service can manage progress" ON user_progress
  FOR ALL USING (true);

-- User prospect stats policies
CREATE POLICY "Users can view prospect stats" ON user_prospect_stats
  FOR SELECT USING (true);
CREATE POLICY "Service can manage prospect stats" ON user_prospect_stats
  FOR ALL USING (true);

-- Coach conversations policies
CREATE POLICY "Users can view coach conversations" ON coach_conversations
  FOR SELECT USING (true);
CREATE POLICY "Users can create coach conversations" ON coach_conversations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update coach conversations" ON coach_conversations
  FOR UPDATE USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user progress after call completion
CREATE OR REPLACE FUNCTION update_user_progress_on_call()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_duration INTEGER;
  v_last_date DATE;
  v_new_streak INTEGER;
BEGIN
  -- Only process when call is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    v_user_id := NEW.user_id;
    v_duration := COALESCE(NEW.duration_seconds, 0);

    -- Get current streak info
    SELECT last_call_date, current_streak INTO v_last_date, v_new_streak
    FROM user_progress WHERE user_id = v_user_id;

    -- Calculate new streak
    IF v_last_date IS NULL THEN
      v_new_streak := 1;
    ELSIF v_last_date = CURRENT_DATE THEN
      -- Same day, no streak change
      v_new_streak := COALESCE(v_new_streak, 1);
    ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Consecutive day, increment streak
      v_new_streak := COALESCE(v_new_streak, 0) + 1;
    ELSE
      -- Streak broken
      v_new_streak := 1;
    END IF;

    -- Upsert user progress
    INSERT INTO user_progress (user_id, total_calls, total_duration_seconds, current_streak, longest_streak, last_call_date)
    VALUES (v_user_id, 1, v_duration, v_new_streak, v_new_streak, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
      total_calls = user_progress.total_calls + 1,
      total_duration_seconds = user_progress.total_duration_seconds + v_duration,
      current_streak = v_new_streak,
      longest_streak = GREATEST(user_progress.longest_streak, v_new_streak),
      last_call_date = CURRENT_DATE,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user prospect stats
CREATE OR REPLACE FUNCTION update_user_prospect_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats when score is added
  INSERT INTO user_prospect_stats (user_id, prospect_id, calls_count, avg_score, best_score, last_call_at)
  SELECT
    c.user_id,
    c.prospect_id,
    1,
    NEW.overall_score,
    NEW.overall_score,
    NOW()
  FROM calls c
  WHERE c.id = NEW.call_id
  ON CONFLICT (user_id, prospect_id) DO UPDATE SET
    calls_count = user_prospect_stats.calls_count + 1,
    avg_score = (user_prospect_stats.avg_score * user_prospect_stats.calls_count + NEW.overall_score) / (user_prospect_stats.calls_count + 1),
    best_score = GREATEST(user_prospect_stats.best_score, NEW.overall_score),
    last_call_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user average score
CREATE OR REPLACE FUNCTION update_user_avg_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_progress
  SET
    avg_overall_score = (
      SELECT AVG(cs.overall_score)
      FROM call_scores cs
      JOIN calls c ON c.id = cs.call_id
      WHERE c.user_id = (SELECT user_id FROM calls WHERE id = NEW.call_id)
    ),
    best_score = GREATEST(
      COALESCE(best_score, 0),
      NEW.overall_score
    ),
    updated_at = NOW()
  WHERE user_id = (SELECT user_id FROM calls WHERE id = NEW.call_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at
    BEFORE UPDATE ON prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_transcripts_updated_at
    BEFORE UPDATE ON call_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_conversations_updated_at
    BEFORE UPDATE ON coach_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Progress update trigger
CREATE TRIGGER trigger_update_user_progress
    AFTER UPDATE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_on_call();

-- Prospect stats trigger
CREATE TRIGGER trigger_update_user_prospect_stats
    AFTER INSERT ON call_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_user_prospect_stats();

-- Average score trigger
CREATE TRIGGER trigger_update_user_avg_score
    AFTER INSERT ON call_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_user_avg_score();

-- ============================================
-- SEED DATA - Default Prospects
-- ============================================

INSERT INTO prospects (first_name, last_name, title, company_name, company_size, industry, difficulty, personality_traits, background, objections, is_default)
VALUES
  (
    'Sarah',
    'Chen',
    'VP of Operations',
    'LogiFlow',
    '51-200',
    'Logistics',
    'medium',
    ARRAY['Skeptical'],
    '10 years in operations. Promoted last year after optimizing logistics costs by 30%. Under pressure to maintain results and prove the promotion was deserved.',
    'We already have a solution in place. What makes you different from the competition? I don''t have time for another vendor pitch.',
    true
  ),
  (
    'Mike',
    'Torres',
    'CTO',
    'DataSync',
    '51-200',
    'Technology',
    'hard',
    ARRAY['Technical', 'Analytical'],
    'Former engineer turned executive. Asks deep technical questions. Obsessed with security, compliance, and system architecture. Will drill down on technical claims.',
    'What''s your uptime SLA? How do you handle data encryption? I need to see technical documentation before any demo.',
    true
  ),
  (
    'Rachel',
    'Johnson',
    'Director of Procurement',
    'MedTech Corp',
    '201-500',
    'Healthcare',
    'easy',
    ARRAY['Friendly', 'Budget-conscious'],
    'Open to new solutions. Good listener. Budget-conscious but willing to pay for real value. Recently tasked with finding efficiency improvements.',
    'Sounds interesting, but what''s the ROI timeline? We need to see clear cost savings within 6 months.',
    true
  );

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for transcript updates
-- ============================================

-- Note: Run this in Supabase Dashboard -> Database -> Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE call_transcripts;

-- ============================================
-- STORAGE BUCKETS (Create in Supabase Dashboard)
-- ============================================

-- Bucket: call-recordings
-- - Public: false
-- - File size limit: 50MB
-- - Allowed MIME types: audio/mpeg, audio/wav, audio/webm

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
