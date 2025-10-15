-- Check if the admin accounts exist and their current status

-- Check if accounts exist in auth.users
SELECT 
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users 
WHERE email IN ('techascendconsulting@gmail.com', 'obyj1st@gmail.com', 'superadmin@test.com', 'admin@batraining.com')
ORDER BY email;

-- Check their admin roles in user_profiles
SELECT 
  up.user_id,
  au.email,
  up.is_super_admin,
  up.is_senior_admin, 
  up.is_admin,
  up.blocked,
  up.locked
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('techascendconsulting@gmail.com', 'obyj1st@gmail.com', 'superadmin@test.com', 'admin@batraining.com')
ORDER BY au.email;





