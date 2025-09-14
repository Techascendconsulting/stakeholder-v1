-- Admin System Database Schema
-- Run this in your Supabase SQL editor

-- 1. Create admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user admin roles junction table
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

-- 3. Create admin activity logs table
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

-- 4. Insert default admin roles
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

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_user_id ON user_admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_role_id ON user_admin_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_active ON user_admin_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user_id ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);

-- 6. Add RLS policies
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin roles policies (only admins can read)
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

-- User admin roles policies
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

-- Admin activity logs policies
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

-- 7. Create function to check admin permissions
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

-- 8. Create function to get user admin roles
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
