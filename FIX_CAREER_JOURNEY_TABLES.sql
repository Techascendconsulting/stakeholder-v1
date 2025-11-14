-- ====================================================================
-- FIX CAREER JOURNEY TABLES - Run in Supabase SQL Editor
-- This script creates the missing tables causing 404/406 errors
-- ====================================================================

-- 1. Create career_journey_progress table
CREATE TABLE IF NOT EXISTS public.career_journey_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_topics TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per phase
  UNIQUE(user_id, phase_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_career_journey_user ON public.career_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_career_journey_status ON public.career_journey_progress(status);

-- Enable RLS
ALTER TABLE public.career_journey_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own career journey progress" ON public.career_journey_progress;
DROP POLICY IF EXISTS "Users can insert their own career journey progress" ON public.career_journey_progress;
DROP POLICY IF EXISTS "Users can update their own career journey progress" ON public.career_journey_progress;

-- RLS Policies
CREATE POLICY "Users can view their own career journey progress"
  ON public.career_journey_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career journey progress"
  ON public.career_journey_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career journey progress"
  ON public.career_journey_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Create user_onboarding table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_onboarding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    onboarding_stage TEXT DEFAULT 'in_progress',
    experience_level TEXT CHECK (experience_level IN ('new', 'trained_but_no_job', 'starting_project', 'working_ba')),
    intent TEXT CHECK (intent IN ('learn_basics', 'practice_skills', 'start_real_project', 'get_project_help')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one onboarding record per user
CREATE UNIQUE INDEX IF NOT EXISTS user_onboarding_user_id_idx ON public.user_onboarding(user_id);

-- Enable RLS
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can delete own onboarding data" ON public.user_onboarding;

-- RLS Policies
CREATE POLICY "Users can view own onboarding data" ON public.user_onboarding
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding data" ON public.user_onboarding
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data" ON public.user_onboarding
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding data" ON public.user_onboarding
    FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_onboarding
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at ON public.user_onboarding;
CREATE TRIGGER update_user_onboarding_updated_at 
    BEFORE UPDATE ON public.user_onboarding 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Create helper functions for career journey
CREATE OR REPLACE FUNCTION initialize_career_journey_phase(
  p_user_id UUID,
  p_phase_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress_id UUID;
BEGIN
  -- Insert or get existing progress record
  INSERT INTO public.career_journey_progress (
    user_id,
    phase_id,
    status,
    started_at
  )
  VALUES (
    p_user_id,
    p_phase_id,
    'in_progress',
    NOW()
  )
  ON CONFLICT (user_id, phase_id)
  DO UPDATE SET
    status = CASE 
      WHEN public.career_journey_progress.status = 'not_started' THEN 'in_progress'
      ELSE public.career_journey_progress.status
    END,
    started_at = COALESCE(public.career_journey_progress.started_at, NOW()),
    updated_at = NOW()
  RETURNING id INTO v_progress_id;

  RETURN v_progress_id;
END;
$$;

CREATE OR REPLACE FUNCTION complete_career_journey_topic(
  p_user_id UUID,
  p_phase_id TEXT,
  p_topic_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add topic to completed_topics array if not already there
  UPDATE public.career_journey_progress
  SET 
    completed_topics = array_append(completed_topics, p_topic_id),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND phase_id = p_phase_id
    AND NOT (p_topic_id = ANY(completed_topics));

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION complete_career_journey_phase(
  p_user_id UUID,
  p_phase_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.career_journey_progress
  SET 
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND phase_id = p_phase_id;

  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION initialize_career_journey_phase TO authenticated;
GRANT EXECUTE ON FUNCTION complete_career_journey_topic TO authenticated;
GRANT EXECUTE ON FUNCTION complete_career_journey_phase TO authenticated;

-- Verify tables were created
SELECT 
  'career_journey_progress' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'career_journey_progress') as exists
UNION ALL
SELECT 
  'user_onboarding' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_onboarding') as exists;

