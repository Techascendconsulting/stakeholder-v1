-- ========================================
-- COMMUNITY CHAT FIXES - APPLY ALL MIGRATIONS
-- Run this in your Supabase SQL Editor to fix Community Chat
-- ========================================

-- ========================================
-- 1. FIX USER_PROFILES TABLE
-- ========================================

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
  cohort_id UUID,
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

-- ========================================
-- 2. FIX COHORTS TABLE
-- ========================================

-- Create cohorts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  syllabus_url TEXT,
  project_brief_url TEXT,
  deadlines_url TEXT,
  slack_channel_id TEXT,
  slack_workspace_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "cohorts_read_all" ON public.cohorts;
DROP POLICY IF EXISTS "cohorts_insert_admin" ON public.cohorts;
DROP POLICY IF EXISTS "cohorts_update_admin" ON public.cohorts;
DROP POLICY IF EXISTS "cohorts_delete_admin" ON public.cohorts;

-- Create RLS Policies for cohorts (simplified for now)
CREATE POLICY "cohorts_read_all" ON public.cohorts FOR SELECT USING (true);
CREATE POLICY "cohorts_insert_admin" ON public.cohorts FOR INSERT WITH CHECK (true);
CREATE POLICY "cohorts_update_admin" ON public.cohorts FOR UPDATE USING (true);
CREATE POLICY "cohorts_delete_admin" ON public.cohorts FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cohorts_name ON public.cohorts(name);
CREATE INDEX IF NOT EXISTS idx_cohorts_created_at ON public.cohorts(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_cohorts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_cohorts_updated_at ON public.cohorts;
CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW
  EXECUTE FUNCTION update_cohorts_updated_at();

-- Insert a default cohort if none exists
INSERT INTO public.cohorts (id, name) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'August 2025 Cohort'
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. FIX COHORT_MESSAGES TABLE
-- ========================================

-- Create cohort_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cohort_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT,
  parent_message_id UUID REFERENCES public.cohort_messages(id) ON DELETE CASCADE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cohort_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "cohort_messages_read_cohort" ON public.cohort_messages;
DROP POLICY IF EXISTS "cohort_messages_insert_cohort" ON public.cohort_messages;
DROP POLICY IF EXISTS "cohort_messages_update_author" ON public.cohort_messages;
DROP POLICY IF EXISTS "cohort_messages_delete_author" ON public.cohort_messages;

-- Create RLS Policies for cohort_messages (simplified for now)
CREATE POLICY "cohort_messages_read_cohort" ON public.cohort_messages FOR SELECT USING (true);
CREATE POLICY "cohort_messages_insert_cohort" ON public.cohort_messages FOR INSERT WITH CHECK (author_user_id = auth.uid());
CREATE POLICY "cohort_messages_update_author" ON public.cohort_messages FOR UPDATE USING (author_user_id = auth.uid()) WITH CHECK (author_user_id = auth.uid());
CREATE POLICY "cohort_messages_delete_author" ON public.cohort_messages FOR DELETE USING (author_user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cohort_messages_cohort_id ON public.cohort_messages(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_messages_author_user_id ON public.cohort_messages(author_user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_messages_parent_message_id ON public.cohort_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_cohort_messages_created_at ON public.cohort_messages(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_cohort_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_cohort_messages_updated_at ON public.cohort_messages;
CREATE TRIGGER update_cohort_messages_updated_at
  BEFORE UPDATE ON public.cohort_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_cohort_messages_updated_at();

-- Enable Realtime for cohort_messages (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'cohort_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cohort_messages;
  END IF;
END $$;

-- ========================================
-- 4. ADD FOREIGN KEY CONSTRAINT TO USER_PROFILES
-- ========================================

-- Add foreign key constraint to user_profiles.cohort_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_cohort_id_fkey'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT user_profiles_cohort_id_fkey 
    FOREIGN KEY (cohort_id) REFERENCES public.cohorts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ========================================
-- 5. VERIFICATION QUERIES
-- ========================================

-- Check if tables were created successfully
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM public.user_profiles
UNION ALL
SELECT 'cohorts' as table_name, COUNT(*) as row_count FROM public.cohorts
UNION ALL
SELECT 'cohort_messages' as table_name, COUNT(*) as row_count FROM public.cohort_messages;

-- Check if default cohort exists
SELECT * FROM public.cohorts WHERE id = '00000000-0000-0000-0000-000000000001';
