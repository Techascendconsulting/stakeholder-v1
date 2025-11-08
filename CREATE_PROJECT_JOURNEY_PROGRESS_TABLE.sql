-- Create project_journey_progress table
-- Tracks user progress through the Project Journey stages

CREATE TABLE IF NOT EXISTS project_journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one row per user per stage
  UNIQUE(user_id, stage_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_journey_progress_user_id ON project_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_project_journey_progress_stage_id ON project_journey_progress(stage_id);

-- Enable RLS
ALTER TABLE project_journey_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own progress
CREATE POLICY "Users can view own project journey progress"
  ON project_journey_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own project journey progress"
  ON project_journey_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own project journey progress"
  ON project_journey_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own project journey progress"
  ON project_journey_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all project journey progress"
  ON project_journey_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'senior_admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_journey_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_project_journey_progress_updated_at ON project_journey_progress;
CREATE TRIGGER update_project_journey_progress_updated_at
  BEFORE UPDATE ON project_journey_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_project_journey_progress_updated_at();

-- Grant permissions
GRANT ALL ON project_journey_progress TO authenticated;









