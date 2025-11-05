-- Create Super Admin User and Assign Role
-- This script creates superadmin@test.com as a super admin
-- Your current email remains as a regular student

-- 1. Create the superadmin user in auth.users
-- Note: We'll use a different approach since direct auth.users insertion is restricted
-- This script will prepare everything for manual user creation

-- First, let's create a function to handle user creation
CREATE OR REPLACE FUNCTION create_superadmin_user()
RETURNS TEXT AS $$
DECLARE
  admin_user_id UUID;
  super_admin_role_id UUID;
BEGIN
  -- Check if superadmin@test.com already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'superadmin@test.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- User exists, assign super admin role
    SELECT id INTO super_admin_role_id FROM admin_roles WHERE name = 'super_admin';
    
    -- Assign super admin role
    INSERT INTO user_admin_roles (user_id, role_id, assigned_by, assigned_at)
    VALUES (admin_user_id, super_admin_role_id, admin_user_id, NOW())
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Create/update user profile
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
      admin_user_id,
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
      
    RETURN 'Super admin role assigned to existing user: ' || admin_user_id;
  ELSE
    RETURN 'User superadmin@test.com not found. Please create the user first.';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Run the function
SELECT create_superadmin_user();

-- 3. Alternative: If you want to create the user manually first, run this:
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Email: superadmin@test.com
-- Password: SuperAdmin123!
-- Then run the function above

-- 4. Verify the setup
SELECT 
  '🎉 SUPERADMIN SETUP STATUS' as status,
  u.email,
  CASE 
    WHEN uar.user_id IS NOT NULL THEN '✅ Super Admin'
    ELSE '❌ Regular User'
  END as admin_status,
  ar.name as role_name,
  up.is_admin,
  up.display_name
FROM auth.users u
LEFT JOIN user_admin_roles uar ON u.id = uar.user_id
LEFT JOIN admin_roles ar ON uar.role_id = ar.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email IN ('superadmin@test.com', 'admin@batraining.com')
ORDER BY u.email;

-- 5. Show instructions
SELECT 
  '📋 NEXT STEPS:' as instruction,
  '1. Go to Supabase Dashboard → Authentication → Users → Add User' as step1,
  '2. Email: superadmin@test.com' as step2,
  '3. Password: SuperAdmin123!' as step3,
  '4. Run this script again to assign admin role' as step4,
  '5. Sign in with superadmin@test.com to access admin dashboard' as step5;















