-- ====================================================================
-- SIMPLE ADMIN BYPASS - Bypass Complex Functions, Use Direct Queries
-- Run this in your Supabase SQL Editor to fix admin detection
-- ====================================================================

-- 1. Drop all problematic functions
DROP FUNCTION IF EXISTS public.get_user_details_with_emails(UUID);
DROP FUNCTION IF EXISTS public.get_user_details_with_emails();
DROP FUNCTION IF EXISTS public.check_admin_status(UUID);
DROP FUNCTION IF EXISTS public.check_admin_status();
DROP FUNCTION IF EXISTS public.check_my_admin_status();

-- 2. Create a simple function that just returns basic admin info
CREATE OR REPLACE FUNCTION public.get_user_admin_status(user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN,
  is_senior_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    COALESCE(up.is_admin, false),
    COALESCE(up.is_super_admin, false),
    COALESCE(up.is_senior_admin, false)
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE (user_id_param IS NULL OR au.id = user_id_param);
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_admin_status(UUID) TO authenticated;

-- 4. Test the simple function
SELECT * FROM public.get_user_admin_status();

-- 5. Test with your specific user
SELECT * FROM public.get_user_admin_status()
WHERE email = 'techascendconsulting1@gmail.com';

-- 6. Create a direct admin check function
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT COALESCE(up.is_admin, false) INTO admin_status
  FROM public.user_profiles up
  WHERE up.user_id = COALESCE(user_id_param, auth.uid());
  
  RETURN COALESCE(admin_status, false);
END;
$$;

-- 7. Create a super admin check function
CREATE OR REPLACE FUNCTION public.is_user_super_admin(user_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  super_admin_status BOOLEAN;
BEGIN
  SELECT COALESCE(up.is_super_admin, false) INTO super_admin_status
  FROM public.user_profiles up
  WHERE up.user_id = COALESCE(user_id_param, auth.uid());
  
  RETURN COALESCE(super_admin_status, false);
END;
$$;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_super_admin(UUID) TO authenticated;

-- 9. Test the functions
SELECT public.is_user_admin() as is_admin;
SELECT public.is_user_super_admin() as is_super_admin;

-- 10. Show your current admin status
SELECT 
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'techascendconsulting1@gmail.com';

-- 11. Force update your profile
UPDATE public.user_profiles
SET 
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'techascendconsulting1@gmail.com'
);

SELECT 'Simple admin bypass complete! The complex functions are removed and simple ones are created.' as status;


