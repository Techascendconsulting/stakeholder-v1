-- SECURE RLS policies - Users CANNOT update registered_device or locked
-- Run this in Supabase SQL Editor

-- 1. Drop the insecure "Users can update own device" policy
DROP POLICY IF EXISTS "Users can update own device" ON public.user_profiles;

-- 2. Create secure policy - Users can ONLY update display_name and other safe fields
CREATE POLICY "Users can update own profile safe fields"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  -- CRITICAL: These fields MUST remain unchanged by users
  AND locked IS NOT DISTINCT FROM (SELECT locked FROM user_profiles WHERE user_id = auth.uid())
  AND registered_device IS NOT DISTINCT FROM (SELECT registered_device FROM user_profiles WHERE user_id = auth.uid())
  AND COALESCE(is_admin, false) = COALESCE((SELECT is_admin FROM user_profiles WHERE user_id = auth.uid()), false)
  AND COALESCE(is_super_admin, false) = COALESCE((SELECT is_super_admin FROM user_profiles WHERE user_id = auth.uid()), false)
  AND COALESCE(is_senior_admin, false) = COALESCE((SELECT is_senior_admin FROM user_profiles WHERE user_id = auth.uid()), false)
);

-- Verify policies
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'user_profiles';











