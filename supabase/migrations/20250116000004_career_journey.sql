-- Career Journey Progress Tracking
-- Tracks user progress through the Career Simulation Journey

CREATE TABLE IF NOT EXISTS career_journey_progress (
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_career_journey_user ON career_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_career_journey_status ON career_journey_progress(status);

-- Enable RLS
ALTER TABLE career_journey_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own career journey progress"
  ON career_journey_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career journey progress"
  ON career_journey_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career journey progress"
  ON career_journey_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to initialize career journey progress for a phase
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
  INSERT INTO career_journey_progress (
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
      WHEN career_journey_progress.status = 'not_started' THEN 'in_progress'
      ELSE career_journey_progress.status
    END,
    started_at = COALESCE(career_journey_progress.started_at, NOW()),
    updated_at = NOW()
  RETURNING id INTO v_progress_id;

  RETURN v_progress_id;
END;
$$;

-- Function to mark a topic as completed
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
  UPDATE career_journey_progress
  SET 
    completed_topics = array_append(completed_topics, p_topic_id),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND phase_id = p_phase_id
    AND NOT (p_topic_id = ANY(completed_topics));

  RETURN FOUND;
END;
$$;

-- Function to mark a phase as completed
CREATE OR REPLACE FUNCTION complete_career_journey_phase(
  p_user_id UUID,
  p_phase_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE career_journey_progress
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














