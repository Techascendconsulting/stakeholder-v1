-- Fix cohorts table for Community Chat
-- Ensure the table exists with the correct schema

-- Create cohorts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
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

-- Create RLS Policies for cohorts
CREATE POLICY "cohorts_read_all" ON public.cohorts FOR SELECT USING (true);
CREATE POLICY "cohorts_insert_admin" ON public.cohorts FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.user_profiles WHERE is_admin = true));
CREATE POLICY "cohorts_update_admin" ON public.cohorts FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.user_profiles WHERE is_admin = true));
CREATE POLICY "cohorts_delete_admin" ON public.cohorts FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.user_profiles WHERE is_admin = true));

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
INSERT INTO public.cohorts (id, name, description) 
VALUES (
  'default-cohort-id',
  'August 2025 Cohort',
  'Default cohort for new users'
) ON CONFLICT (id) DO NOTHING;









