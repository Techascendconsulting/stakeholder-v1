-- Add missing write policies for cohort_students and cohort_live_sessions
-- These were missing from the original migration, preventing admin operations

-- Policy for cohort_students: allow admins and coaches to manage students
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
    AND tablename='cohort_students' 
    AND policyname='cohort_students_write_admin_or_coach'
  ) THEN
    CREATE POLICY "cohort_students_write_admin_or_coach" 
    ON public.cohort_students 
    FOR ALL
    USING (
      -- Allow if user is admin/super_admin/senior_admin
      EXISTS (
        SELECT 1 FROM public.user_profiles up 
        WHERE up.user_id = auth.uid() 
        AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
      )
      OR
      -- Allow if user is the coach for this cohort
      EXISTS (
        SELECT 1 FROM public.cohorts c 
        WHERE c.id = cohort_students.cohort_id 
        AND c.coach_user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_profiles up 
        WHERE up.user_id = auth.uid() 
        AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
      )
      OR
      EXISTS (
        SELECT 1 FROM public.cohorts c 
        WHERE c.id = cohort_students.cohort_id 
        AND c.coach_user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Policy for cohort_live_sessions: allow admins and coaches to manage sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
    AND tablename='cohort_live_sessions' 
    AND policyname='cohort_live_sessions_write_admin_or_coach'
  ) THEN
    CREATE POLICY "cohort_live_sessions_write_admin_or_coach" 
    ON public.cohort_live_sessions 
    FOR ALL
    USING (
      -- Allow if user is admin/super_admin/senior_admin
      EXISTS (
        SELECT 1 FROM public.user_profiles up 
        WHERE up.user_id = auth.uid() 
        AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
      )
      OR
      -- Allow if user is the coach for this cohort
      EXISTS (
        SELECT 1 FROM public.cohorts c 
        WHERE c.id = cohort_live_sessions.cohort_id 
        AND c.coach_user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_profiles up 
        WHERE up.user_id = auth.uid() 
        AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
      )
      OR
      EXISTS (
        SELECT 1 FROM public.cohorts c 
        WHERE c.id = cohort_live_sessions.cohort_id 
        AND c.coach_user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Also update the cohorts write policy to include is_senior_admin
DO $$
BEGIN
  -- Drop old policy if exists
  DROP POLICY IF EXISTS "cohorts_write_admin_or_coach" ON public.cohorts;
  
  -- Create new policy with is_senior_admin included
  CREATE POLICY "cohorts_write_admin_or_coach" 
  ON public.cohorts 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
    )
    OR coach_user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
    )
    OR coach_user_id = auth.uid()
  );
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Cohort write policies added successfully - admins can now manage students and sessions';
END $$;


