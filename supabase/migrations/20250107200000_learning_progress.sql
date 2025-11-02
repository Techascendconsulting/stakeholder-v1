-- =========================================
-- Table: learning_progress
-- Tracks user progress through learning modules
-- =========================================

CREATE TABLE IF NOT EXISTS public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id text NOT NULL,
  status text CHECK (status IN ('locked', 'unlocked', 'in_progress', 'completed')) DEFAULT 'locked',
  completed_lessons text[] DEFAULT ARRAY[]::text[],
  assignment_completed boolean DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one row per user per module
  UNIQUE(user_id, module_id)
);

-- =========================================
-- Indexes for performance
-- =========================================
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_status ON public.learning_progress(status);

-- =========================================
-- Row Level Security (RLS)
-- =========================================
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.learning_progress;

-- Allow users to read and update only their own progress
CREATE POLICY "Users can manage their own progress"
ON public.learning_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =========================================
-- Helper function to initialize user progress
-- =========================================
CREATE OR REPLACE FUNCTION initialize_learning_progress(p_user_id uuid, p_module_ids text[])
RETURNS void AS $$
BEGIN
  -- Insert progress records for all modules
  -- First module is unlocked, rest are locked
  INSERT INTO public.learning_progress (user_id, module_id, status)
  SELECT 
    p_user_id,
    unnest(p_module_ids),
    CASE 
      WHEN unnest = p_module_ids[1] THEN 'unlocked'
      ELSE 'locked'
    END
  ON CONFLICT (user_id, module_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

