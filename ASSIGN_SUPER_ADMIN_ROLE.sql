-- Assign Super Admin Role to superadmin@test.com
-- User ID: 564c6bf8-f067-4819-900e-f3322d402258

-- 1. Assign super admin role
INSERT INTO user_admin_roles (user_id, role_id, assigned_by, assigned_at)
SELECT 
  '564c6bf8-f067-4819-900e-f3322d402258'::uuid,
  ar.id,
  '564c6bf8-f067-4819-900e-f3322d402258'::uuid,
  NOW()
FROM admin_roles ar 
WHERE ar.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 2. Create/update user profile with admin privileges
INSERT INTO user_profiles (
  user_id,
  display_name,
  bio,
  title,
  company,
  is_public,
  has_completed_onboarding,
  is_admin
) VALUES (
  '564c6bf8-f067-4819-900e-f3322d402258'::uuid,
  'Super Administrator',
  'Super Administrator with full system access',
  'System Admin',
  'Your Company',
  false,
  true,
  true
) ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  is_public = EXCLUDED.is_public,
  has_completed_onboarding = EXCLUDED.has_completed_onboarding,
  is_admin = EXCLUDED.is_admin;

-- 3. Verify the admin role was assigned
SELECT 
  '🎉 SUPERADMIN SETUP COMPLETE!' as status,
  u.email,
  CASE 
    WHEN uar.user_id IS NOT NULL THEN '✅ Super Admin'
    ELSE '❌ Regular User'
  END as admin_status,
  ar.name as role_name,
  ar.permissions,
  up.is_admin,
  up.display_name
FROM auth.users u
LEFT JOIN user_admin_roles uar ON u.id = uar.user_id
LEFT JOIN admin_roles ar ON uar.role_id = ar.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.id = '564c6bf8-f067-4819-900e-f3322d402258';

-- 4. Show next steps
SELECT 
  '📋 NEXT STEPS:' as instruction,
  '1. Sign out and sign back in with superadmin@test.com' as step1,
  '2. You should now see admin privileges' as step2,
  '3. Access admin dashboard to manage users' as step3,
  '4. Unlock your main account (admin@batraining.com) if needed' as step4;







