-- Fix RLS policies for device lock visibility
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.user_profiles;

-- 3. Users can read their OWN profile (including locked status)
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4. Users can update ONLY their registered_device (NOT locked, NOT admin flags)
CREATE POLICY "Users can update own device"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() 
  -- Only these fields can be changed by user:
  AND (
    -- Allow updating registered_device
    (registered_device IS DISTINCT FROM (SELECT registered_device FROM user_profiles WHERE user_id = auth.uid()))
    OR
    -- Allow updating other safe fields (display_name, etc)
    (display_name IS DISTINCT FROM (SELECT display_name FROM user_profiles WHERE user_id = auth.uid()))
  )
  -- Ensure these fields CANNOT be changed by user:
  AND locked = (SELECT locked FROM user_profiles WHERE user_id = auth.uid())
  AND COALESCE(is_admin, false) = COALESCE((SELECT is_admin FROM user_profiles WHERE user_id = auth.uid()), false)
  AND COALESCE(is_super_admin, false) = COALESCE((SELECT is_super_admin FROM user_profiles WHERE user_id = auth.uid()), false)
  AND COALESCE(is_senior_admin, false) = COALESCE((SELECT is_senior_admin FROM user_profiles WHERE user_id = auth.uid()), false)
);

-- 5. Admins can read ALL profiles
CREATE POLICY "Admins can read all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles admin_check
    WHERE admin_check.user_id = auth.uid()
    AND (
      admin_check.is_admin = true 
      OR admin_check.is_super_admin = true 
      OR admin_check.is_senior_admin = true
    )
  )
);

-- 6. Admins can update ALL profiles (including locked status)
CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles admin_check
    WHERE admin_check.user_id = auth.uid()
    AND (
      admin_check.is_admin = true 
      OR admin_check.is_super_admin = true 
      OR admin_check.is_senior_admin = true
    )
  )
)
WITH CHECK (true);

-- 7. Service role (backend/system) has full access
CREATE POLICY "Service role has full access"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';















