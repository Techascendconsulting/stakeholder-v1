-- ====================================================================
-- FINAL ADMIN FIX - Comprehensive Solution to Force Admin Access
-- Run this in your Supabase SQL Editor to fix admin access permanently
-- ====================================================================

-- 1. Force create/update your user profile as super admin
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  is_admin,
  is_super_admin,
  is_senior_admin,
  created_at,
  updated_at
) 
SELECT 
  au.id,
  'Super Admin',
  true,
  true,
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'techascendconsulting1@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  is_admin = true,
  is_super_admin = true,
  is_senior_admin = true,
  display_name = 'Super Admin',
  updated_at = NOW();

-- 2. Verify the update worked
SELECT 
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.display_name,
  up.updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'techascendconsulting1@gmail.com';

-- 3. Create a simple function that always returns true for admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Always return true for your email
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'techascendconsulting1@gmail.com' 
    AND id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  -- Check database for other users
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
  );
END;
$$;

-- 4. Create a function that always returns super admin for your email
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Always return true for your email
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'techascendconsulting1@gmail.com' 
    AND id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  -- Check database for other users
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND is_super_admin = true
  );
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin_user() TO authenticated;

-- 6. Test the functions
SELECT public.is_admin_user() as is_admin;
SELECT public.is_super_admin_user() as is_super_admin;

-- 7. Force update your profile one more time
UPDATE public.user_profiles
SET 
  is_admin = true,
  is_super_admin = true,
  is_senior_admin = true,
  display_name = 'Super Admin',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'techascendconsulting1@gmail.com'
);

-- 8. Final verification
SELECT 
  'FINAL CHECK' as status,
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.display_name
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'techascendconsulting1@gmail.com';

SELECT 'FINAL ADMIN FIX COMPLETE! Your account is now permanently set as super admin.' as result;


















