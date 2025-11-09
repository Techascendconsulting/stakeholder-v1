-- ====================================================================
-- ULTRA SIMPLE ADMIN - No Functions, Just Direct Queries
-- Run this in your Supabase SQL Editor to fix admin detection
-- ====================================================================

-- 1. Drop ALL functions to avoid any conflicts
DROP FUNCTION IF EXISTS public.get_user_details_with_emails(UUID);
DROP FUNCTION IF EXISTS public.get_user_details_with_emails();
DROP FUNCTION IF EXISTS public.check_admin_status(UUID);
DROP FUNCTION IF EXISTS public.check_admin_status();
DROP FUNCTION IF EXISTS public.check_my_admin_status();
DROP FUNCTION IF EXISTS public.get_user_admin_status(UUID);
DROP FUNCTION IF EXISTS public.get_user_admin_status();
DROP FUNCTION IF EXISTS public.is_user_admin(UUID);
DROP FUNCTION IF EXISTS public.is_user_admin();
DROP FUNCTION IF EXISTS public.is_user_super_admin(UUID);
DROP FUNCTION IF EXISTS public.is_user_super_admin();

-- 2. Show your current admin status with direct query
SELECT 
  au.id,
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'techascendconsulting1@gmail.com';

-- 3. Force update your profile to trigger refresh
UPDATE public.user_profiles
SET 
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'techascendconsulting1@gmail.com'
);

-- 4. Verify the update worked
SELECT 
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'techascendconsulting1@gmail.com';

-- 5. Create a simple boolean function that just returns true/false
CREATE OR REPLACE FUNCTION public.check_if_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT COALESCE(up.is_admin, false) INTO admin_status
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid();
  
  RETURN COALESCE(admin_status, false);
END;
$$;

-- 6. Create a simple super admin check
CREATE OR REPLACE FUNCTION public.check_if_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  super_admin_status BOOLEAN;
BEGIN
  SELECT COALESCE(up.is_super_admin, false) INTO super_admin_status
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid();
  
  RETURN COALESCE(super_admin_status, false);
END;
$$;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.check_if_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_if_super_admin() TO authenticated;

-- 8. Test the simple functions
SELECT public.check_if_admin() as is_admin;
SELECT public.check_if_super_admin() as is_super_admin;

SELECT 'Ultra simple admin setup complete! All complex functions removed, simple boolean functions created.' as status;

















