-- ============================================================================
-- ELICITATION PRACTICE SESSIONS TRACKING
-- ============================================================================
-- Purpose: Track user practice sessions for progressive unlock system
-- - Chat practice: Available after Module 3 completion (70%+)
-- - Voice practice: Unlocks after 3 qualifying sessions on 3 different days
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: elicitation_practice_sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.elicitation_practice_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session details
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  meeting_stage text NOT NULL, -- 'problem_exploration', 'as_is_mapping', etc.
  meeting_type text NOT NULL CHECK (meeting_type IN ('chat', 'voice')),
  
  -- Performance tracking
  ai_coach_score integer CHECK (ai_coach_score >= 0 AND ai_coach_score <= 100),
  interaction_count integer DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_practice_sessions_user_id ON public.elicitation_practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_user_date ON public.elicitation_practice_sessions(user_id, session_date);
CREATE INDEX idx_practice_sessions_qualifying ON public.elicitation_practice_sessions(user_id, ai_coach_score) 
  WHERE ai_coach_score >= 70;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.elicitation_practice_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own practice sessions"
  ON public.elicitation_practice_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own practice sessions"
  ON public.elicitation_practice_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own practice sessions"
  ON public.elicitation_practice_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTION: Get daily interaction count
-- ============================================================================
CREATE OR REPLACE FUNCTION get_daily_interaction_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COALESCE(SUM(interaction_count), 0)
  INTO v_count
  FROM public.elicitation_practice_sessions
  WHERE user_id = p_user_id
    AND session_date = CURRENT_DATE;
  
  RETURN v_count;
END;
$$;

-- ============================================================================
-- HELPER FUNCTION: Check voice unlock eligibility
-- ============================================================================
CREATE OR REPLACE FUNCTION check_voice_unlock_eligibility(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qualifying_count integer;
  v_unique_days integer;
  v_is_unlocked boolean;
BEGIN
  -- Count qualifying sessions (score >= 70%)
  SELECT COUNT(*), COUNT(DISTINCT session_date)
  INTO v_qualifying_count, v_unique_days
  FROM public.elicitation_practice_sessions
  WHERE user_id = p_user_id
    AND ai_coach_score >= 70;
  
  -- Voice unlocks when: 3+ sessions with 70%+ on 3+ different days
  v_is_unlocked := (v_qualifying_count >= 3 AND v_unique_days >= 3);
  
  RETURN jsonb_build_object(
    'isUnlocked', v_is_unlocked,
    'qualifyingSessions', v_qualifying_count,
    'uniqueDays', v_unique_days,
    'sessionsNeeded', GREATEST(0, 3 - v_qualifying_count),
    'daysNeeded', GREATEST(0, 3 - v_unique_days)
  );
END;
$$;

-- ============================================================================
-- TRIGGER: Update timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_practice_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_practice_session_timestamp
  BEFORE UPDATE ON public.elicitation_practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_session_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.elicitation_practice_sessions IS 
  'Tracks elicitation practice sessions for progressive unlock system';
COMMENT ON FUNCTION get_daily_interaction_count IS 
  'Returns total interactions for a user today (for 20/day limit)';
COMMENT ON FUNCTION check_voice_unlock_eligibility IS 
  'Checks if user has unlocked voice practice (3 sessions, 70%+, 3 different days)';
















