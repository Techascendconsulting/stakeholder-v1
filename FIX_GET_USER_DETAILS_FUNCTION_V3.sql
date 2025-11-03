-- ====================================================================
-- FIX GET_USER_DETAILS_FUNCTION V3 - Remove non-existent blocked column
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Drop ALL versions of the function (with different signatures)
DROP FUNCTION IF EXISTS public.get_user_details_with_emails();
DROP FUNCTION IF EXISTS public.get_user_details_with_emails(UUID);
DROP FUNCTION IF EXISTS public.get_user_details_with_emails(TEXT);

-- 2. Create the function with the locked field included (without blocked column)
CREATE OR REPLACE FUNCTION public.get_user_details_with_emails()
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
  updated_at TIMESTAMPTZ,
  locked BOOLEAN,
  registered_device TEXT,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    COALESCE(up.display_name, 'User')::TEXT,
    COALESCE(up.bio, '')::TEXT,
    COALESCE(up.avatar_url, '')::TEXT,
    COALESCE(up.title, '')::TEXT,
    COALESCE(up.company, '')::TEXT,
    COALESCE(up.location, '')::TEXT,
    COALESCE(up.website, '')::TEXT,
    COALESCE(up.linkedin_url, '')::TEXT,
    COALESCE(up.github_url, '')::TEXT,
    COALESCE(up.skills, ARRAY[]::TEXT[]),
    COALESCE(up.experience_level, '')::TEXT,
    COALESCE(up.is_admin, false),
    COALESCE(up.is_super_admin, false),
    COALESCE(up.is_senior_admin, false),
    up.created_at,
    up.updated_at,
    COALESCE(up.locked, false),
    COALESCE(up.registered_device, '')::TEXT,
    au.last_sign_in_at
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  ORDER BY au.created_at DESC;
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_details_with_emails() TO authenticated;

-- 4. Test the function
SELECT 'Testing updated function:' as info;
SELECT * FROM public.get_user_details_with_emails();

-- 5. Show the locked field specifically
SELECT 'Locked field analysis:' as info;
SELECT 
  email,
  display_name,
  locked,
  registered_device,
  CASE 
    WHEN locked = true THEN 'LOCKED'
    WHEN locked = false THEN 'UNLOCKED'
    WHEN locked IS NULL THEN 'NULL'
    ELSE 'UNKNOWN'
  END as lock_status
FROM public.get_user_details_with_emails()
ORDER BY created_at DESC;

-- 6. Count locked users
SELECT 'Locked user count:' as info;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN locked = true THEN 1 END) as locked_users,
  COUNT(CASE WHEN locked = false THEN 1 END) as unlocked_users
FROM public.get_user_details_with_emails();













