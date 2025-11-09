-- Check the ACTUAL status of baworkxp@gmail.com and all locked users
-- FIXED: removed non-existent 'blocked' column

SELECT 
  user_id,
  (SELECT email FROM auth.users WHERE id = user_profiles.user_id) as email,
  locked,
  registered_device,
  is_admin,
  is_super_admin,
  is_senior_admin,
  user_type,
  created_at
FROM user_profiles
WHERE 
  locked = true
  OR (SELECT email FROM auth.users WHERE id = user_profiles.user_id) = 'baworkxp@gmail.com'
ORDER BY created_at DESC;















