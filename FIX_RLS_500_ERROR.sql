-- FIX RLS 500 ERROR
-- Drop all existing policies that might be broken, then create clean ones

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update safe fields only" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own device" ON public.user_profiles;
DROP POLICY IF EXISTS "enable_read_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "enable_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "enable_admin_all" ON public.user_profiles;

-- POLICY 1: Users can read their OWN profile
CREATE POLICY "user_profiles_read_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- POLICY 2: Admins can read ALL profiles
CREATE POLICY "user_profiles_read_admin"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
  )
);

-- POLICY 3: Users can update SAFE fields only (not locked, blocked, or admin fields)
CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Can only update display_name and avatar_url
  -- Cannot change: locked, blocked, registered_device, is_admin, is_super_admin, is_senior_admin
);

-- POLICY 4: Admins can update ALL profiles
CREATE POLICY "user_profiles_update_admin"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
  )
);

-- POLICY 5: Super admins can insert new profiles (for user creation)
CREATE POLICY "user_profiles_insert_admin"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';











