-- URGENT: Fix RLS Policy Recursion Issues
-- Run this script in Supabase SQL Editor to fix the admin system

-- Drop all existing problematic RLS policies
DROP POLICY IF EXISTS "Admins can view admin roles" ON user_admin_roles;
DROP POLICY IF EXISTS "Admins can manage admin roles" ON user_admin_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON admin_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON admin_roles;
DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can view user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create simple, non-recursive RLS policies using is_admin flag
-- Policy for admin_roles table
CREATE POLICY "Admins can view roles" ON admin_roles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "Admins can manage roles" ON admin_roles
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Policy for user_admin_roles table
CREATE POLICY "Admins can view user admin roles" ON user_admin_roles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "Admins can manage user admin roles" ON user_admin_roles
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Policy for admin_activity_logs table
CREATE POLICY "Admins can view activity logs" ON admin_activity_logs
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "Admins can insert activity logs" ON admin_activity_logs
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Policy for user_profiles table (for admin management)
CREATE POLICY "Admins can view all user profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

CREATE POLICY "Admins can update user profiles" ON user_profiles
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Ensure non-admins can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Verify the superadmin user has is_admin = true
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE user_id = '564c6bf8-f067-4819-900e-f3322d402258';

-- Show the result
SELECT user_id, is_admin, display_name FROM user_profiles WHERE user_id = '564c6bf8-f067-4819-900e-f3322d402258';






