-- ====================================================================
-- SIMPLE ADMIN FIX - Quick and Easy Admin Setup
-- Run this in your Supabase SQL Editor to fix admin authentication
-- ====================================================================

-- 1. Show all current users and their admin status
SELECT 
  au.id,
  au.email,
  au.created_at,
  up.display_name,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

-- 2. Create a simple function to promote any user to super admin by email
CREATE OR REPLACE FUNCTION public.make_super_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Update or insert user profile with super admin privileges
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    is_admin,
    is_super_admin,
    is_senior_admin,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    'Super Admin',
    true,
    true,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    is_admin = true,
    is_super_admin = true,
    is_senior_admin = true,
    updated_at = NOW();
  
  RETURN 'Successfully promoted ' || user_email || ' to Super Admin';
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.make_super_admin(TEXT) TO authenticated;

-- 4. Instructions for you to run:
-- Replace 'your-email@example.com' with your actual email and run:
-- SELECT public.make_super_admin('your-email@example.com');

-- 5. After promoting yourself, check the admin status:
-- SELECT 
--   au.email,
--   up.is_admin,
--   up.is_super_admin,
--   up.is_senior_admin
-- FROM auth.users au
-- LEFT JOIN public.user_profiles up ON au.id = up.user_id
-- WHERE au.email = 'your-email@example.com';

SELECT 'Simple admin fix ready! Use the make_super_admin function with your email.' as status;








