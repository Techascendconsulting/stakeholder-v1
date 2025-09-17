-- ====================================================================
-- CREATE TEST STUDENT - Add a locked student for testing
-- Run this in your Supabase SQL Editor after fixing RLS policies
-- ====================================================================

-- 1. First, let's see what users already exist
SELECT 'Current users in auth.users:' as info, id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Update your existing admin profile to show it's working
UPDATE public.user_profiles 
SET 
  locked = false,
  registered_device = 'admin-device-12345',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'techascendconsulting1@gmail.com'
);

-- 3. If there are other users in auth.users, we can test with them
-- Let's check if there are any other users we can use for testing
SELECT 'Available users for testing:' as info, id, email 
FROM auth.users 
WHERE email != 'techascendconsulting1@gmail.com'
LIMIT 5;

-- 3. Show all users in the system
SELECT 
  'All users in system:' as info,
  user_id,
  display_name,
  is_admin,
  is_super_admin,
  is_senior_admin,
  locked,
  registered_device
FROM public.user_profiles
ORDER BY created_at DESC;

-- 4. Show locked users specifically
SELECT 
  'Locked users:' as info,
  user_id,
  display_name,
  locked,
  registered_device
FROM public.user_profiles
WHERE locked = true;
