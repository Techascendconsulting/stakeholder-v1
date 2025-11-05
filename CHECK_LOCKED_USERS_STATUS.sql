-- Check the ACTUAL status of baworkxp@gmail.com and all locked users
-- Run this in Supabase SQL Editor to see the truth

SELECT 
  user_id,
  -- Get email from auth.users
  (SELECT email FROM auth.users WHERE id = user_profiles.user_id) as email,
  locked,
  blocked,
  registered_device,
  is_admin,
  is_super_admin,
  is_senior_admin,
  user_type,
  created_at
FROM user_profiles
WHERE 
  locked = true
  OR blocked = true
  OR (SELECT email FROM auth.users WHERE id = user_profiles.user_id) = 'baworkxp@gmail.com'
ORDER BY created_at DESC;

-- Also check if the RPC function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'register_user_device';


