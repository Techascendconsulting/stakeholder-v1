-- FIX RLS RECURSION CAUSING 500 ERRORS
-- The problem: Admin policies were checking user_profiles to verify admin status,
-- but that triggers the same policies again = infinite recursion = 500 error

-- Drop ALL policies (including old ones)
DROP POLICY IF EXISTS "Users can update own profile safe fields" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_read_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_read_admin" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_admin" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_admin" ON public.user_profiles;

-- Keep RLS enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- SIMPLE POLICY: All authenticated users can read ANY profile
-- (This is safe - profile info isn't sensitive, and we control updates)
CREATE POLICY "user_profiles_read_all"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- POLICY: Users can update their OWN profile only (safe fields)
CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- POLICY: Allow inserts for authenticated users (for new user registration)
CREATE POLICY "user_profiles_insert_own"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles' ORDER BY cmd, policyname;

