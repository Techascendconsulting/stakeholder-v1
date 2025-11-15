-- Create practice_progress table to track user progress through practice modules
CREATE TABLE IF NOT EXISTS public.practice_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_practice_progress_user_id ON public.practice_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_progress_practice_id ON public.practice_progress(practice_id);

-- Enable RLS
ALTER TABLE public.practice_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own progress
CREATE POLICY "Users can view their own practice progress"
  ON public.practice_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own practice progress"
  ON public.practice_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own practice progress"
  ON public.practice_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_practice_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_practice_progress_timestamp
  BEFORE UPDATE ON public.practice_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_progress_updated_at();

