-- ====================================================================
-- LOCK TEST USER - Lock the second user for testing
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Lock the second user (admin@batraining.com) for testing
UPDATE public.user_profiles 
SET 
  locked = true,
  registered_device = 'test-device-12345',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@batraining.com'
);

-- 2. Show the updated user status
SELECT 'Updated user status:' as info;
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

-- 3. Test the admin function to see locked users
SELECT 'Testing admin function with locked user:' as test;
SELECT * FROM public.get_user_details_with_emails();

-- 4. Show locked users specifically
SELECT 'Locked users:' as info;
SELECT 
  au.email,
  up.display_name,
  up.locked,
  up.registered_device
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.locked = true;



















