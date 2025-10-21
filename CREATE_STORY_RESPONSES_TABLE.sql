-- Create table for BA Thinking Framework responses
CREATE TABLE IF NOT EXISTS story_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  response_text TEXT NOT NULL,
  reflection_choice TEXT, -- 'Very close', 'Somewhat', 'Not close'
  score INTEGER, -- AI score 1-5
  ai_feedback TEXT, -- AI coaching feedback
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Composite unique constraint: one response per user per rule
  UNIQUE(user_id, rule_name)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_story_responses_user_id ON story_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_story_responses_rule_name ON story_responses(rule_name);

-- Enable RLS
ALTER TABLE story_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see and edit their own responses
CREATE POLICY "Users can view own responses"
  ON story_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses"
  ON story_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses"
  ON story_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own responses"
  ON story_responses FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all responses"
  ON story_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND (is_admin = true OR is_senior_admin = true OR is_super_admin = true)
    )
  );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_story_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER story_responses_updated_at
  BEFORE UPDATE ON story_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_story_responses_updated_at();

-- Success message
SELECT 'story_responses table created successfully!' as message;

