-- Complete Admin System Migration
-- This script does EVERYTHING automatically
-- Run this in your Supabase SQL editor

-- 1. Create admin system tables (if not exists)
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert default admin roles
INSERT INTO admin_roles (name, description, permissions) VALUES
('super_admin', 'Super Administrator', '{
  "user_management": true,
  "device_unlock": true,
  "system_settings": true,
  "analytics": true,
  "admin_management": true,
  "audit_logs": true
}'),
('support_admin', 'Support Administrator', '{
  "user_management": true,
  "device_unlock": true,
  "analytics": true,
  "audit_logs": false,
  "system_settings": false,
  "admin_management": false
}'),
('analytics_admin', 'Analytics Administrator', '{
  "analytics": true,
  "user_management": false,
  "device_unlock": false,
  "system_settings": false,
  "admin_management": false,
  "audit_logs": false
}')
ON CONFLICT (name) DO NOTHING;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_user_id ON user_admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_role_id ON user_admin_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_active ON user_admin_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user_id ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);

-- 4. Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (drop if exists first)
DROP POLICY IF EXISTS "Admins can view roles" ON admin_roles;
CREATE POLICY "Admins can view roles" ON admin_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON uar.role_id = ar.id
      WHERE uar.user_id = auth.uid() 
      AND uar.is_active = true
      AND ar.name IN ('super_admin', 'support_admin')
    )
  );

DROP POLICY IF EXISTS "Users can view their own roles" ON user_admin_roles;
CREATE POLICY "Users can view their own roles" ON user_admin_roles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_admin_roles;
CREATE POLICY "Super admins can manage all roles" ON user_admin_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON uar.role_id = ar.id
      WHERE uar.user_id = auth.uid() 
      AND uar.is_active = true
      AND ar.name = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_logs;
CREATE POLICY "Admins can view activity logs" ON admin_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON uar.role_id = ar.id
      WHERE uar.user_id = auth.uid() 
      AND uar.is_active = true
      AND ar.name IN ('super_admin', 'support_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can insert activity logs" ON admin_activity_logs;
CREATE POLICY "Admins can insert activity logs" ON admin_activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON uar.role_id = ar.id
      WHERE uar.user_id = auth.uid() 
      AND uar.is_active = true
      AND ar.name IN ('super_admin', 'support_admin')
    )
  );

-- 6. Create functions
CREATE OR REPLACE FUNCTION check_admin_permission(
  user_uuid UUID,
  permission_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_admin_roles uar
    JOIN admin_roles ar ON uar.role_id = ar.id
    WHERE uar.user_id = user_uuid 
    AND uar.is_active = true
    AND (uar.expires_at IS NULL OR uar.expires_at > NOW())
    AND (ar.permissions->>permission_name)::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_admin_roles(user_uuid UUID)
RETURNS TABLE(role_name TEXT, permissions JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT ar.name, ar.permissions
  FROM user_admin_roles uar
  JOIN admin_roles ar ON uar.role_id = ar.id
  WHERE uar.user_id = user_uuid 
  AND uar.is_active = true
  AND (uar.expires_at IS NULL OR uar.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Make existing user a super admin (if they exist)
-- First, let's check if superadmin@test.com already exists
DO $$
DECLARE
  admin_user_id UUID;
  super_admin_role_id UUID;
BEGIN
  -- Check if superadmin@test.com exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'superadmin@test.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Get super admin role ID
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
      
    RAISE NOTICE 'Super admin role assigned to existing user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User superadmin@test.com not found. Please create the user first in Supabase Auth dashboard.';
  END IF;
END $$;

-- 8. Verify everything is set up
SELECT 
  '🎉 ADMIN SYSTEM SETUP COMPLETE!' as status,
  u.email,
  uar.is_active as admin_active,
  ar.name as role_name,
  up.display_name,
  up.is_admin
FROM auth.users u
LEFT JOIN user_admin_roles uar ON u.id = uar.user_id
LEFT JOIN admin_roles ar ON uar.role_id = ar.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'superadmin@test.com';

-- 9. Show all admin roles
SELECT 'Available Admin Roles:' as info;
SELECT name, description, permissions FROM admin_roles ORDER BY name;
