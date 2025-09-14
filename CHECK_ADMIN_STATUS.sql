-- Check the current status of admin@batraining.com
SELECT 
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.locked,
  up.registered_device,
  up.blocked
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email = 'admin@batraining.com';
