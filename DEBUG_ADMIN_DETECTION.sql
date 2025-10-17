-- ====================================================================
-- DEBUG ADMIN DETECTION - Check and Fix Admin Status
-- Run this in your Supabase SQL Editor to debug admin issues
-- ====================================================================

-- 1. Check all users and their admin status
SELECT 
  au.id,
  au.email,
  au.created_at,
  up.display_name,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.created_at as profile_created_at,
  up.updated_at as profile_updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

-- 2. Check if the get_user_details_with_emails function works
-- Replace 'your-email@example.com' with your actual email
SELECT * FROM public.get_user_details_with_emails();

-- 3. Check specific user admin status
-- Replace 'your-email@example.com' with your actual email
SELECT 
  au.id,
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'your-email@example.com';

-- 4. Force update admin status for your user
-- Replace 'your-email@example.com' with your actual email
UPDATE public.user_profiles
SET 
  is_admin = true,
  is_super_admin = true,
  is_senior_admin = true,
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- 5. Verify the update worked
-- Replace 'your-email@example.com' with your actual email
SELECT 
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'your-email@example.com';

-- 6. Test the admin detection function
-- This should return your user with admin status
SELECT * FROM public.get_user_details_with_emails();

SELECT 'Admin detection debug complete! Check the results above.' as status;







