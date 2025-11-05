-- Complete script to assign admin roles to the new test accounts
-- Run this once to set up both admin accounts

-- Make techascendconsulting2@gmail.com Super Admin
UPDATE user_profiles 
SET is_super_admin = TRUE, is_admin = TRUE, is_senior_admin = TRUE
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'techascendconsulting2@gmail.com');

-- Make obyj1st2@gmail.com Senior Admin
UPDATE user_profiles 
SET is_senior_admin = TRUE, is_admin = TRUE
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'obyj1st2@gmail.com');

-- Verify the roles were assigned correctly
SELECT 
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.blocked,
  up.locked
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('techascendconsulting2@gmail.com', 'obyj1st2@gmail.com')
ORDER BY au.email;














