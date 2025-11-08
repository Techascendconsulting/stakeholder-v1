-- Verify Super Admin Access
-- Run this to check if superadmin@test.com has proper admin access

-- 1. Check if user exists and has admin role
SELECT 
  '🔍 USER CHECK' as check_type,
  u.email,
  u.id as user_id,
  up.is_admin,
  up.locked,
  up.registered_device,
  CASE 
    WHEN uar.user_id IS NOT NULL THEN '✅ Has Admin Role'
    ELSE '❌ No Admin Role'
  END as admin_role_status,
  ar.name as role_name,
  ar.permissions
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_admin_roles uar ON u.id = uar.user_id
LEFT JOIN admin_roles ar ON uar.role_id = ar.id
WHERE u.email = 'superadmin@test.com';

-- 2. Check admin roles table
SELECT 
  '🔍 ADMIN ROLES' as check_type,
  name,
  description,
  permissions
FROM admin_roles
ORDER BY name;

-- 3. Check user admin roles table
SELECT 
  '🔍 USER ADMIN ROLES' as check_type,
  u.email,
  ar.name as role_name,
  uar.is_active,
  uar.assigned_at
FROM user_admin_roles uar
JOIN auth.users u ON uar.user_id = u.id
JOIN admin_roles ar ON uar.role_id = ar.id
WHERE u.email = 'superadmin@test.com';

-- 4. Test the admin permission function
SELECT 
  '🔍 PERMISSION TEST' as check_type,
  check_admin_permission('564c6bf8-f067-4819-900e-f3322d402258', 'user_management') as user_management,
  check_admin_permission('564c6bf8-f067-4819-900e-f3322d402258', 'device_unlock') as device_unlock,
  check_admin_permission('564c6bf8-f067-4819-900e-f3322d402258', 'admin_management') as admin_management;

-- 5. Test the get user admin roles function
SELECT 
  '🔍 USER ROLES FUNCTION' as check_type,
  get_user_admin_roles('564c6bf8-f067-4819-900e-f3322d402258') as admin_roles;
















