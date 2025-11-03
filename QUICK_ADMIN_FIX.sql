-- ====================================================================
-- QUICK ADMIN FIX - Show both users to admin
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. First, let's see both users in auth.users
SELECT 'All users in auth.users:' as info, id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Check what user profiles exist
SELECT 'All user profiles:' as info, user_id, display_name, is_admin, locked, created_at
FROM public.user_profiles 
ORDER BY created_at DESC;

-- 3. Create user profiles for any missing users
-- This will create profiles for users who don't have them yet
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  is_admin,
  is_super_admin,
  is_senior_admin,
  locked,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.email, 'User'),
  false, -- Not admin by default
  false,
  false,
  false, -- Not locked by default
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. Now show all users with their profiles
SELECT 'All users with profiles:' as info;
SELECT 
  au.email,
  up.display_name,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.locked,
  up.registered_device
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

-- 5. Test the get_user_details_with_emails function
SELECT 'Testing get_user_details_with_emails function:' as test;
SELECT * FROM public.get_user_details_with_emails();













