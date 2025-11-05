-- ====================================================================
-- SIMPLE RLS FIX - Quick fix for admin dashboard
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Temporarily disable RLS to test admin access
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs DISABLE ROW LEVEL SECURITY;

-- 2. Check what users exist in the system
SELECT 'All users in auth.users:' as info, id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Check what user profiles exist
SELECT 'All user profiles:' as info, user_id, display_name, is_admin, locked, created_at
FROM public.user_profiles 
ORDER BY created_at DESC;

-- 4. Test admin access by trying to read all profiles
SELECT 'Testing admin access to all profiles:' as test;
SELECT 
  user_id,
  display_name,
  is_admin,
  is_super_admin,
  is_senior_admin,
  locked,
  registered_device
FROM public.user_profiles;

-- 5. Show the current admin user
SELECT 'Current admin user:' as info;
SELECT 
  au.email,
  up.display_name,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.locked
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'techascendconsulting1@gmail.com';















