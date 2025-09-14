-- Make existing user a super admin
-- Replace 'admin@batraining.com' with the email of the user you want to make admin

-- 1. Get the user ID
SELECT id, email FROM auth.users WHERE email = 'admin@batraining.com';

-- 2. Assign super admin role (replace USER_ID with the ID from step 1)
INSERT INTO user_admin_roles (user_id, role_id, assigned_by, assigned_at)
SELECT 
  'USER_ID_HERE'::uuid,  -- Replace with actual user ID
  ar.id,
  'USER_ID_HERE'::uuid,  -- Replace with actual user ID
  NOW()
FROM admin_roles ar 
WHERE ar.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 3. Update user profile to mark as admin
UPDATE user_profiles 
SET is_admin = true
WHERE user_id = 'USER_ID_HERE'::uuid;  -- Replace with actual user ID

-- 4. Verify the admin role was assigned
SELECT 
  u.email,
  ar.name as role_name,
  ar.permissions,
  uar.assigned_at,
  uar.is_active,
  up.is_admin
FROM auth.users u
JOIN user_admin_roles uar ON u.id = uar.user_id
JOIN admin_roles ar ON uar.role_id = ar.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'admin@batraining.com';
