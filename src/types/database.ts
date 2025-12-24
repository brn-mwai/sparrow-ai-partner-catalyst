// ============================================
// SPARROW AI - Database Types (Supabase)
// Sales Training Platform Schema
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// -------------------- Enums --------------------

export type CallType = 'cold_call' | 'discovery' | 'objection_gauntlet';
export type CallStatus = 'ready' | 'active' | 'completed' | 'abandoned';
export type CallOutcome = 'meeting_booked' | 'callback' | 'rejected' | 'no_decision';
export type PersonalityType = 'skeptical' | 'busy' | 'friendly' | 'technical';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'brutal';
export type FeedbackType = 'positive' | 'negative' | 'missed_opportunity';
// Note: Database uses 'objection' and 'communication' as enum values
// The API layer maps 'objection_handling' -> 'objection' and 'call_control' -> 'communication'
export type FeedbackCategory = 'opening' | 'discovery' | 'objection' | 'communication' | 'closing';
export type UserPlan = 'free' | 'starter' | 'pro';
export type UserRole = 'sdr' | 'ae' | 'manager' | 'founder';

// -------------------- Database Schema --------------------

export type Database = {
  public: {
    Tables: {
      // Users table (synced from Clerk)
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string | null;
          role: UserRole | null;
          industry: string | null;
          company: string | null;
          preferences: Json;
          onboarding_completed: boolean;
          plan: UserPlan;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          role?: UserRole | null;
          industry?: string | null;
          company?: string | null;
          preferences?: Json;
          onboarding_completed?: boolean;
          plan?: UserPlan;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string | null;
          role?: UserRole | null;
          industry?: string | null;
          company?: string | null;
          preferences?: Json;
          onboarding_completed?: boolean;
          plan?: UserPlan;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Calls table
      calls: {
        Row: {
          id: string;
          user_id: string;
          type: CallType;
          persona_config: Json;
          status: CallStatus;
          duration_seconds: number | null;
          recording_url: string | null;
          elevenlabs_conversation_id: string | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: CallType;
          persona_config: Json;
          status?: CallStatus;
          duration_seconds?: number | null;
          recording_url?: string | null;
          elevenlabs_conversation_id?: string | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: CallType;
          persona_config?: Json;
          status?: CallStatus;
          duration_seconds?: number | null;
          recording_url?: string | null;
          elevenlabs_conversation_id?: string | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };

      // Call transcripts
      call_transcripts: {
        Row: {
          id: string;
          call_id: string;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          call_id: string;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          call_id?: string;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Call scores
      call_scores: {
        Row: {
          id: string;
          call_id: string;
          overall_score: number;
          opening_score: number;
          discovery_score: number;
          objection_score: number;
          control_score: number;
          closing_score: number;
          outcome: CallOutcome;
          scoring_metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          call_id: string;
          overall_score: number;
          opening_score: number;
          discovery_score: number;
          objection_score: number;
          control_score: number;
          closing_score: number;
          outcome: CallOutcome;
          scoring_metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          call_id?: string;
          overall_score?: number;
          opening_score?: number;
          discovery_score?: number;
          objection_score?: number;
          control_score?: number;
          closing_score?: number;
          outcome?: CallOutcome;
          scoring_metadata?: Json;
          created_at?: string;
        };
      };

      // Call feedback (timestamped moments)
      call_feedback: {
        Row: {
          id: string;
          call_id: string;
          category: FeedbackCategory;
          timestamp_ms: number;
          feedback_type: FeedbackType;
          content: string;
          suggestion: string | null;
          transcript_excerpt: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          call_id: string;
          category: FeedbackCategory;
          timestamp_ms: number;
          feedback_type: FeedbackType;
          content: string;
          suggestion?: string | null;
          transcript_excerpt?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          call_id?: string;
          category?: FeedbackCategory;
          timestamp_ms?: number;
          feedback_type?: FeedbackType;
          content?: string;
          suggestion?: string | null;
          transcript_excerpt?: string | null;
          created_at?: string;
        };
      };

      // User progress (aggregated stats)
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          total_calls: number;
          total_duration_seconds: number;
          current_streak: number;
          longest_streak: number;
          last_call_date: string | null;
          avg_overall_score: number | null;
          skill_scores: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_calls?: number;
          total_duration_seconds?: number;
          current_streak?: number;
          longest_streak?: number;
          last_call_date?: string | null;
          avg_overall_score?: number | null;
          skill_scores?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_calls?: number;
          total_duration_seconds?: number;
          current_streak?: number;
          longest_streak?: number;
          last_call_date?: string | null;
          avg_overall_score?: number | null;
          skill_scores?: Json;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      call_type: CallType;
      call_status: CallStatus;
      call_outcome: CallOutcome;
      personality_type: PersonalityType;
      difficulty_level: DifficultyLevel;
      feedback_type: FeedbackType;
      feedback_category: FeedbackCategory;
      user_plan: UserPlan;
      user_role: UserRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// -------------------- Helper Types --------------------

// User type
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// Call type
export type Call = Database['public']['Tables']['calls']['Row'];
export type CallInsert = Database['public']['Tables']['calls']['Insert'];
export type CallUpdate = Database['public']['Tables']['calls']['Update'];

// Call transcript type
export type CallTranscript = Database['public']['Tables']['call_transcripts']['Row'];
export type CallTranscriptInsert = Database['public']['Tables']['call_transcripts']['Insert'];
export type CallTranscriptUpdate = Database['public']['Tables']['call_transcripts']['Update'];

// Call score type
export type CallScore = Database['public']['Tables']['call_scores']['Row'];
export type CallScoreInsert = Database['public']['Tables']['call_scores']['Insert'];
export type CallScoreUpdate = Database['public']['Tables']['call_scores']['Update'];

// Call feedback type
export type CallFeedback = Database['public']['Tables']['call_feedback']['Row'];
export type CallFeedbackInsert = Database['public']['Tables']['call_feedback']['Insert'];
export type CallFeedbackUpdate = Database['public']['Tables']['call_feedback']['Update'];

// User progress type
export type UserProgress = Database['public']['Tables']['user_progress']['Row'];
export type UserProgressInsert = Database['public']['Tables']['user_progress']['Insert'];
export type UserProgressUpdate = Database['public']['Tables']['user_progress']['Update'];

// -------------------- Persona Config Type --------------------

export interface PersonaConfig {
  name: string;
  gender?: 'male' | 'female';
  title: string;
  company: string;
  company_size: string;
  industry: string;
  tenure_months?: number;
  background: string;
  current_challenges?: string[];
  personality: PersonalityType;
  communication_style?: string;
  difficulty: DifficultyLevel;
  hidden_pain_points: string[];
  objections: string[];
  buying_signals?: string[];
  triggers: {
    positive: string[];
    negative: string[];
  };
  decision_criteria?: string[];
  competitors_mentioned?: string[];
  budget_situation?: string;
  timeline_urgency?: 'low' | 'medium' | 'high';
  goal_for_rep: string;
  opening_mood?: string;
  first_response?: string;
  voice_description?: string;
}

// -------------------- Transcript Message Type --------------------

export interface TranscriptMessage {
  speaker: 'user' | 'prospect';
  content: string;
  timestamp_ms: number;
}

// -------------------- User Preferences Type --------------------

export interface UserPreferences {
  default_difficulty?: DifficultyLevel;
  default_call_type?: CallType;
  default_industry?: string;
  voice_style?: 'professional' | 'casual';
  coaching_tips_enabled?: boolean;
}

// -------------------- Skill Scores Type --------------------

export interface SkillScores {
  opening: number | null;
  discovery: number | null;
  objection_handling: number | null;
  call_control: number | null;
  closing: number | null;
}

// -------------------- Call with Relations --------------------

export interface CallWithRelations extends Call {
  transcript?: CallTranscript;
  scores?: CallScore;
  feedback?: CallFeedback[];
  persona?: PersonaConfig;
}

// -------------------- Scoring Metadata --------------------

export interface ScoringMetadata {
  provider: 'gemini' | 'groq';
  model: string;
  latency_ms: number;
  quick_score_used: boolean;
}

// -------------------- Score Result (API Response) --------------------

export interface ScoreResult {
  overall: number;
  categories: {
    opening: number;
    discovery: number;
    objection_handling: number;
    call_control: number;
    closing: number;
  };
  outcome: CallOutcome;
  confidence: number;
}

// -------------------- Deep Analysis Result --------------------

export interface DeepAnalysisResult {
  scores: ScoreResult;
  feedback: Array<{
    category: FeedbackCategory;
    timestamp_estimate: string;
    type: FeedbackType;
    content: string;
    suggestion?: string;
    excerpt?: string;
  }>;
  summary: string;
  key_strengths: string[];
  areas_for_improvement: string[];
}
