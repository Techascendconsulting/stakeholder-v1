-- Fix Community Hub RLS policies so admins can create/manage groups and memberships
-- Run this in Supabase SQL editor

-- Enable RLS (idempotent)
ALTER TABLE IF EXISTS public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.buddy_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('groups','group_members','buddy_pairs','training_sessions')
  ) LOOP
    EXECUTE FORMAT('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END$$;

-- Helper predicate: current user is any admin
-- We inline the predicate in USING/WITH CHECK to avoid dependency on a function

-- Groups policies
CREATE POLICY groups_admin_all
ON public.groups FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR p.is_admin = true OR p.is_super_admin = true OR p.is_senior_admin = true
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR p.is_admin = true OR p.is_super_admin = true OR p.is_senior_admin = true
      )
  )
);

CREATE POLICY groups_read_members
ON public.groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
  )
);

-- Group members policies
CREATE POLICY group_members_admin_all
ON public.group_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR p.is_admin = true OR p.is_super_admin = true OR p.is_senior_admin = true
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR p.is_admin = true OR p.is_super_admin = true OR p.is_senior_admin = true
      )
  )
);

CREATE POLICY group_members_read_own
ON public.group_members FOR SELECT
USING (user_id = auth.uid());

-- Buddy pairs policies
CREATE POLICY buddy_pairs_admin_all
ON public.buddy_pairs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR p.is_admin = true OR p.is_super_admin = true OR p.is_senior_admin = true
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR p.is_admin = true OR p.is_super_admin = true OR p.is_senior_admin = true
      )
  )
);

CREATE POLICY buddy_pairs_read_own
ON public.buddy_pairs FOR SELECT
USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Training sessions policies
CREATE POLICY training_sessions_admin_all
ON public.training_sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR p.is_admin = true OR p.is_super_admin = true OR p.is_senior_admin = true
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' OR p.is_admin = true OR p.is_super_admin = true OR p.is_senior_admin = true
      )
  )
);

CREATE POLICY training_sessions_read_any
ON public.training_sessions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Sanity check queries (run manually after):
-- SELECT * FROM public.groups LIMIT 1;
-- SELECT * FROM public.group_members LIMIT 1;

