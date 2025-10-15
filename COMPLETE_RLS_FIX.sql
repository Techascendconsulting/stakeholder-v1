-- COMPLETE RLS FIX - Disable RLS temporarily for admin tables
-- Run this in Supabase SQL Editor

-- First, disable RLS on all admin-related tables
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view admin roles" ON user_admin_roles;
DROP POLICY IF EXISTS "Admins can manage admin roles" ON user_admin_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON admin_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON admin_roles;
DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can view user admin roles" ON user_admin_roles;
DROP POLICY IF EXISTS "Admins can manage user admin roles" ON user_admin_roles;

-- Create simple, non-recursive policies for user_profiles only
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to view all profiles (simple check)
CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.is_admin = TRUE
  )
);

-- Allow admins to update profiles (simple check)
CREATE POLICY "Admins can update profiles" ON user_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.is_admin = TRUE
  )
);

-- Ensure superadmin is unlocked and has admin status
UPDATE user_profiles 
SET locked = FALSE, registered_device = NULL, is_admin = TRUE
WHERE user_id = '564c6bf8-f067-4819-900e-f3322d402258';

-- Verify the fix
SELECT 
  user_id, 
  locked, 
  registered_device, 
  is_admin, 
  display_name 
FROM user_profiles 
WHERE user_id = '564c6bf8-f067-4819-900e-f3322d402258';





