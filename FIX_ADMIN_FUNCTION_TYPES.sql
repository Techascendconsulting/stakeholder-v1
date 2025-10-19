-- ====================================================================
-- FIX ADMIN FUNCTION TYPES - Fix Data Type Mismatches
-- Run this in your Supabase SQL Editor to fix the function type issues
-- ====================================================================

-- 1. Drop and recreate the get_user_details_with_emails function with proper types
DROP FUNCTION IF EXISTS public.get_user_details_with_emails(UUID);
DROP FUNCTION IF EXISTS public.get_user_details_with_emails();

CREATE OR REPLACE FUNCTION public.get_user_details_with_emails(user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  skills TEXT[],
  experience_level TEXT,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN,
  is_senior_admin BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    au.email,
    up.display_name::TEXT,
    up.bio::TEXT,
    up.avatar_url::TEXT,
    up.title::TEXT,
    up.company::TEXT,
    up.location::TEXT,
    up.website::TEXT,
    up.linkedin_url::TEXT,
    up.github_url::TEXT,
    up.skills,
    up.experience_level::TEXT,
    up.is_admin,
    up.is_super_admin,
    up.is_senior_admin,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  JOIN auth.users au ON up.user_id = au.id
  WHERE (user_id_param IS NULL OR up.user_id = user_id_param)
  ORDER BY up.created_at DESC;
END;
$$;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_details_with_emails(UUID) TO authenticated;

-- 3. Test the function
SELECT * FROM public.get_user_details_with_emails();

-- 4. Test with your specific user
SELECT * FROM public.get_user_details_with_emails()
WHERE email = 'techascendconsulting1@gmail.com';

-- 5. Create a simple admin check function that definitely works
CREATE OR REPLACE FUNCTION public.check_admin_status_simple()
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
  WHERE au.id = auth.uid();
END;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.check_admin_status_simple() TO authenticated;

-- 7. Test the simple function
SELECT * FROM public.check_admin_status_simple();

-- 8. Force update your user profile to trigger refresh
UPDATE public.user_profiles
SET 
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'techascendconsulting1@gmail.com'
);

SELECT 'Admin function types fixed! Try refreshing your browser now.' as status;








