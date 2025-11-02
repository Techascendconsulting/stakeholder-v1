-- ====================================================================
-- DEBUG LOCKED USERS - Check what the function returns
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Check what the function returns
SELECT 'Function output:' as info;
SELECT * FROM public.get_user_details_with_emails();

-- 2. Check user profiles directly
SELECT 'Direct user profiles:' as info;
SELECT 
  user_id,
  display_name,
  locked,
  registered_device,
  is_admin,
  is_super_admin,
  is_senior_admin
FROM public.user_profiles
ORDER BY created_at DESC;

-- 3. Check if the locked field exists and has the right values
SELECT 'Locked field analysis:' as info;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN locked = true THEN 1 END) as locked_users,
  COUNT(CASE WHEN locked = false THEN 1 END) as unlocked_users,
  COUNT(CASE WHEN locked IS NULL THEN 1 END) as null_locked
FROM public.user_profiles;

-- 4. Show the exact locked status
SELECT 'User lock status:' as info;
SELECT 
  au.email,
  up.display_name,
  up.locked,
  up.registered_device,
  CASE 
    WHEN up.locked = true THEN 'LOCKED'
    WHEN up.locked = false THEN 'UNLOCKED'
    WHEN up.locked IS NULL THEN 'NULL'
    ELSE 'UNKNOWN'
  END as lock_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;








