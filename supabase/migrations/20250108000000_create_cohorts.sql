-- ====================================================================
-- COHORTS FEATURE - Database Schema
-- Creates tables for cohort management with coaches and scheduled sessions
-- ====================================================================

-- 1. Create cohorts table
CREATE TABLE IF NOT EXISTS public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  coach_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visibility_scope TEXT NOT NULL DEFAULT 'public' CHECK (visibility_scope IN ('public', 'private', 'draft')),
  description TEXT,
  max_capacity INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'upcoming', 'completed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create cohort_students junction table
CREATE TABLE IF NOT EXISTS public.cohort_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed')),
  notes TEXT,
  UNIQUE(cohort_id, user_id) -- One student per cohort (prevent duplicates)
);

-- 3. Create cohort_sessions table
CREATE TABLE IF NOT EXISTS public.cohort_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  session_end_time TIMESTAMPTZ,
  meeting_link TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cohorts_status ON public.cohorts(status);
CREATE INDEX IF NOT EXISTS idx_cohorts_coach ON public.cohorts(coach_user_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_created_by ON public.cohorts(created_by);

CREATE INDEX IF NOT EXISTS idx_cohort_students_cohort ON public.cohort_students(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_students_user ON public.cohort_students(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_students_status ON public.cohort_students(status);

CREATE INDEX IF NOT EXISTS idx_cohort_sessions_cohort ON public.cohort_sessions(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_sessions_date ON public.cohort_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_cohort_sessions_status ON public.cohort_sessions(status);

-- 5. Enable Row Level Security
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_sessions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for cohorts table
-- Admins can do everything
CREATE POLICY "cohorts_admin_all" ON public.cohorts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_super_admin = true OR user_profiles.is_senior_admin = true)
    )
  );

-- Coaches can read and update their own cohorts
CREATE POLICY "cohorts_coach_read" ON public.cohorts
  FOR SELECT
  TO authenticated
  USING (coach_user_id = auth.uid());

CREATE POLICY "cohorts_coach_update" ON public.cohorts
  FOR UPDATE
  TO authenticated
  USING (coach_user_id = auth.uid())
  WITH CHECK (coach_user_id = auth.uid());

-- Students can read cohorts they're assigned to
CREATE POLICY "cohorts_student_read" ON public.cohorts
  FOR SELECT
  TO authenticated
  USING (
    visibility_scope = 'public' 
    OR id IN (
      SELECT cohort_id FROM public.cohort_students
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 7. RLS Policies for cohort_students table
-- Admins can do everything
CREATE POLICY "cohort_students_admin_all" ON public.cohort_students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_super_admin = true OR user_profiles.is_senior_admin = true)
    )
  );

-- Coaches can manage students in their cohorts
CREATE POLICY "cohort_students_coach_all" ON public.cohort_students
  FOR ALL
  TO authenticated
  USING (
    cohort_id IN (
      SELECT id FROM public.cohorts WHERE coach_user_id = auth.uid()
    )
  );

-- Students can read their own cohort assignments
CREATE POLICY "cohort_students_read_own" ON public.cohort_students
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 8. RLS Policies for cohort_sessions table
-- Admins can do everything
CREATE POLICY "cohort_sessions_admin_all" ON public.cohort_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_super_admin = true OR user_profiles.is_senior_admin = true)
    )
  );

-- Coaches can CRUD sessions for their cohorts
CREATE POLICY "cohort_sessions_coach_all" ON public.cohort_sessions
  FOR ALL
  TO authenticated
  USING (
    cohort_id IN (
      SELECT id FROM public.cohorts WHERE coach_user_id = auth.uid()
    )
  );

-- Students can read sessions for their cohorts
CREATE POLICY "cohort_sessions_student_read" ON public.cohort_sessions
  FOR SELECT
  TO authenticated
  USING (
    cohort_id IN (
      SELECT cohort_id FROM public.cohort_students
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 9. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Apply updated_at triggers
DROP TRIGGER IF EXISTS update_cohorts_updated_at ON public.cohorts;
CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cohort_sessions_updated_at ON public.cohort_sessions;
CREATE TRIGGER update_cohort_sessions_updated_at
  BEFORE UPDATE ON public.cohort_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Grant access to authenticated users
GRANT SELECT ON public.cohorts TO authenticated;
GRANT SELECT ON public.cohort_students TO authenticated;
GRANT SELECT ON public.cohort_sessions TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Cohorts feature tables created successfully';
END $$;




