-- Fix user_profiles table for Community Chat
-- Ensure the table exists with the correct schema

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  skills TEXT[], -- Array of skills
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_public BOOLEAN DEFAULT TRUE,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_read_public" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.user_profiles;

-- Create RLS Policies for user_profiles
CREATE POLICY "profiles_read_public" ON public.user_profiles FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
CREATE POLICY "profiles_insert" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete" ON public.user_profiles FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cohort_id ON public.user_profiles(cohort_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON public.user_profiles(is_public, experience_level);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS user_profiles_fts_idx ON public.user_profiles USING gin (to_tsvector('english', display_name || ' ' || COALESCE(bio, '') || ' ' || COALESCE(title, '') || ' ' || COALESCE(company, '')));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();








