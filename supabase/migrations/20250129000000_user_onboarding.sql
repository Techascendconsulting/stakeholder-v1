-- Create user_onboarding table for onboarding flow persistence
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

-- Add RLS policies
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Users can only see their own onboarding data
CREATE POLICY "Users can view own onboarding data" ON public.user_onboarding
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own onboarding data
CREATE POLICY "Users can insert own onboarding data" ON public.user_onboarding
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboarding data
CREATE POLICY "Users can update own onboarding data" ON public.user_onboarding
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own onboarding data
CREATE POLICY "Users can delete own onboarding data" ON public.user_onboarding
    FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_onboarding_updated_at 
    BEFORE UPDATE ON public.user_onboarding 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add onboarding columns to existing user_profiles table for backward compatibility
-- Note: user_profiles already has 'experience_level' field (beginner/intermediate/advanced/expert)
-- We use 'onboarding_experience_level' with our onboarding-specific values
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_experience_level TEXT CHECK (onboarding_experience_level IN ('new', 'trained_but_no_job', 'starting_project', 'working_ba')),
ADD COLUMN IF NOT EXISTS onboarding_starting_intent TEXT CHECK (onboarding_starting_intent IN ('learn_basics', 'practice_skills', 'start_real_project', 'get_project_help')),
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create a view to easily access onboarding data
CREATE OR REPLACE VIEW public.user_onboarding_summary AS
SELECT 
    up.user_id,
    up.has_completed_onboarding,
    up.onboarding_experience_level,
    up.onboarding_starting_intent,
    up.onboarding_completed_at,
    uo.onboarding_stage,
    uo.created_at as onboarding_created_at,
    uo.updated_at as onboarding_updated_at
FROM public.user_profiles up
LEFT JOIN public.user_onboarding uo ON up.user_id = uo.user_id;
