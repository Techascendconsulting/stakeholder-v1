-- Create practice_progress table
CREATE TABLE IF NOT EXISTS practice_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS practice_progress_user_id_idx ON practice_progress(user_id);
CREATE INDEX IF NOT EXISTS practice_progress_practice_id_idx ON practice_progress(practice_id);

-- Enable RLS
ALTER TABLE practice_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own practice progress
CREATE POLICY "Users can view own practice progress" ON practice_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own practice progress
CREATE POLICY "Users can insert own practice progress" ON practice_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own practice progress
CREATE POLICY "Users can update own practice progress" ON practice_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_practice_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER practice_progress_updated_at
  BEFORE UPDATE ON practice_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_progress_updated_at();

