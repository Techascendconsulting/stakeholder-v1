-- ====================================================================
-- SUPABASE DATABASE FIX SCRIPT
-- Run this in your Supabase SQL Editor to fix all database issues
-- ====================================================================

-- 1. Ensure user_progress table has all required columns
DO $$
BEGIN
  -- Check if total_voice_meetings column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'total_voice_meetings'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN total_voice_meetings integer DEFAULT 0;
    RAISE NOTICE 'Added total_voice_meetings column';
  END IF;

  -- Check if total_transcript_meetings column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'total_transcript_meetings'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN total_transcript_meetings integer DEFAULT 0;
    RAISE NOTICE 'Added total_transcript_meetings column';
  END IF;
END $$;

-- 2. Fix any data type issues with user_progress table
DO $$
BEGIN
  -- Ensure achievements column is properly defined as text array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'achievements' AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE public.user_progress ALTER COLUMN achievements TYPE text[] USING achievements::text[];
    RAISE NOTICE 'Fixed achievements column type';
  END IF;
END $$;

-- 3. Ensure proper RLS policies exist for user_progress
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.user_progress;

CREATE POLICY "Users can manage their own progress"
  ON public.user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Create/recreate the user_progress table if it doesn't exist or has issues
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_projects_started integer DEFAULT 0,
  total_projects_completed integer DEFAULT 0,
  total_meetings_conducted integer DEFAULT 0,
  total_deliverables_created integer DEFAULT 0,
  total_voice_meetings integer DEFAULT 0,
  total_transcript_meetings integer DEFAULT 0,
  achievements text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Ensure RLS is enabled
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_meetings ON public.user_progress(total_meetings_conducted);

-- 7. Create/update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_user_progress ON public.user_progress;
CREATE TRIGGER set_updated_at_user_progress
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 8. Fix user_meetings table to ensure it has all required columns
DO $$
BEGIN
  -- Add missing columns to user_meetings if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'project_name'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN project_name text;
    RAISE NOTICE 'Added project_name column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'stakeholder_names'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN stakeholder_names text[] DEFAULT '{}';
    RAISE NOTICE 'Added stakeholder_names column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'stakeholder_roles'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN stakeholder_roles text[] DEFAULT '{}';
    RAISE NOTICE 'Added stakeholder_roles column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'total_messages'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN total_messages integer DEFAULT 0;
    RAISE NOTICE 'Added total_messages column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'user_messages'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN user_messages integer DEFAULT 0;
    RAISE NOTICE 'Added user_messages column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'ai_messages'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN ai_messages integer DEFAULT 0;
    RAISE NOTICE 'Added ai_messages column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'topics_discussed'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN topics_discussed text[] DEFAULT '{}';
    RAISE NOTICE 'Added topics_discussed column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'key_insights'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN key_insights text[] DEFAULT '{}';
    RAISE NOTICE 'Added key_insights column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'effectiveness_score'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN effectiveness_score integer;
    RAISE NOTICE 'Added effectiveness_score column to user_meetings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.user_meetings ADD COLUMN completed_at timestamptz;
    RAISE NOTICE 'Added completed_at column to user_meetings';
  END IF;
END $$;

-- 9. Ensure project_id is text type (not uuid) in user_meetings
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_meetings' AND column_name = 'project_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.user_meetings ALTER COLUMN project_id TYPE text USING project_id::text;
    RAISE NOTICE 'Converted project_id to text type in user_meetings';
  END IF;
END $$;

-- 10. Clean up any invalid data and set proper defaults
UPDATE public.user_progress 
SET 
  total_projects_started = COALESCE(total_projects_started, 0),
  total_projects_completed = COALESCE(total_projects_completed, 0),
  total_meetings_conducted = COALESCE(total_meetings_conducted, 0),
  total_deliverables_created = COALESCE(total_deliverables_created, 0),
  total_voice_meetings = COALESCE(total_voice_meetings, 0),
  total_transcript_meetings = COALESCE(total_transcript_meetings, 0),
  achievements = COALESCE(achievements, '{}')
WHERE 
  total_projects_started IS NULL OR 
  total_projects_completed IS NULL OR 
  total_meetings_conducted IS NULL OR 
  total_deliverables_created IS NULL OR
  total_voice_meetings IS NULL OR
  total_transcript_meetings IS NULL OR
  achievements IS NULL;

-- 11. Grant proper permissions
GRANT ALL ON public.user_progress TO authenticated;
GRANT ALL ON public.user_meetings TO authenticated;

-- 12. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- ====================================================================
-- VERIFICATION QUERIES (Run these after the above to verify success)
-- ====================================================================

-- Check user_progress table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_progress' 
ORDER BY ordinal_position;

-- Check user_meetings table structure  
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_meetings' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_progress', 'user_meetings');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'DATABASE FIX COMPLETE!';
  RAISE NOTICE '- user_progress table fixed with all required columns';
  RAISE NOTICE '- user_meetings table updated with missing columns';
  RAISE NOTICE '- RLS policies properly configured';
  RAISE NOTICE '- Data types corrected';
  RAISE NOTICE '- Indexes created for performance';
  RAISE NOTICE '====================================================================';
END $$;