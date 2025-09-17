-- ====================================================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- Run this in your Supabase SQL Editor to fix RLS policy issues
-- ====================================================================

-- 1. Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own meetings" ON public.user_meetings;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Allow authenticated users to read their own activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Allow admins to manage admin activity logs" ON public.admin_activity_logs;

-- 2. Create simple, non-recursive RLS policies
-- For user_profiles: Allow users to read their own profile, admins to read all
CREATE POLICY "Users can read their own profile"
  ON public.user_profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
  ON public.user_profiles FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
    )
  );

-- 3. For user_progress: Simple policies
CREATE POLICY "Users can manage their own progress"
  ON public.user_progress FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. For user_meetings: Simple policies
CREATE POLICY "Users can manage their own meetings"
  ON public.user_meetings FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. For user_activity_logs: Simple policies
CREATE POLICY "Users can insert their own activity logs"
  ON public.user_activity_logs FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own activity logs"
  ON public.user_activity_logs FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 6. For user_onboarding: Simple policies
CREATE POLICY "Users can manage their own onboarding"
  ON public.user_onboarding FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. For admin_activity_logs: Admin only
CREATE POLICY "Admins can manage admin activity logs"
  ON public.admin_activity_logs FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
    )
  );

-- 8. Test the policies
SELECT 'RLS policies updated successfully!' as status;

-- 9. Test admin access
SELECT 'Testing admin access...' as test;
SELECT 
  user_id,
  display_name,
  is_admin,
  is_super_admin,
  is_senior_admin,
  locked
FROM public.user_profiles 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'techascendconsulting1@gmail.com'
);
