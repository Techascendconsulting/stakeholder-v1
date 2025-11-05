-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create project_progress table for tracking Hands-On Project journey
CREATE TABLE IF NOT EXISTS project_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_module_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS project_progress_user_id_idx ON project_progress(user_id);
CREATE INDEX IF NOT EXISTS project_progress_module_id_idx ON project_progress(project_module_id);

-- Enable RLS
ALTER TABLE project_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own project progress
CREATE POLICY "Users can view own project progress" ON project_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own project progress
CREATE POLICY "Users can insert own project progress" ON project_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own project progress
CREATE POLICY "Users can update own project progress" ON project_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER project_progress_updated_at
  BEFORE UPDATE ON project_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress_updated_at();














