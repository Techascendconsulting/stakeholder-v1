-- ====================================================================
-- FORCE ADMIN REFRESH - Force Admin Context to Refresh
-- Run this in your Supabase SQL Editor to force admin detection
-- ====================================================================

-- 1. Update your user profile to force a refresh
UPDATE public.user_profiles
SET 
  updated_at = NOW(),
  display_name = COALESCE(display_name, 'Super Admin')
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'techascendconsulting1@gmail.com'
);

-- 2. Verify the update
SELECT 
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'techascendconsulting1@gmail.com';

-- 3. Test the admin detection function
SELECT * FROM public.get_user_details_with_emails()
WHERE email = 'techascendconsulting1@gmail.com';

-- 4. Create a simple admin check function
CREATE OR REPLACE FUNCTION public.check_my_admin_status()
RETURNS TABLE (
  email TEXT,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN,
  is_senior_admin BOOLEAN,
  admin_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.email,
    COALESCE(up.is_admin, false),
    COALESCE(up.is_super_admin, false),
    COALESCE(up.is_senior_admin, false),
    CASE 
      WHEN COALESCE(up.is_super_admin, false) THEN 'Super Admin'
      WHEN COALESCE(up.is_senior_admin, false) THEN 'Senior Admin'
      WHEN COALESCE(up.is_admin, false) THEN 'Admin'
      ELSE 'Student'
    END as admin_level
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE au.id = auth.uid();
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.check_my_admin_status() TO authenticated;

-- 6. Test the function
SELECT * FROM public.check_my_admin_status();

SELECT 'Admin refresh complete! Try refreshing your browser now.' as status;















