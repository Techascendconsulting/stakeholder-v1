-- =========================================
-- Table: learning_assignments
-- Stores user assignment submissions and AI feedback
-- =========================================

CREATE TABLE IF NOT EXISTS public.learning_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id text NOT NULL,
  submission text NOT NULL,
  feedback text,
  score integer,
  status text CHECK (status IN ('submitted', 'reviewed', 'needs_revision')) DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Allow multiple submissions per module (for revisions)
  -- But track them all for learning analytics
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100)
);

-- =========================================
-- Indexes for performance
-- =========================================
CREATE INDEX IF NOT EXISTS idx_learning_assignments_user_id ON public.learning_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_assignments_module_id ON public.learning_assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_assignments_user_module ON public.learning_assignments(user_id, module_id);

-- =========================================
-- Row Level Security (RLS)
-- =========================================
ALTER TABLE public.learning_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can manage their own assignments" ON public.learning_assignments;

-- Allow users to read and write only their own assignments
CREATE POLICY "Users can manage their own assignments"
ON public.learning_assignments
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

