-- Enable admin access to user_profiles table
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS on user_profiles for admin access
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but with simple policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;

-- Create simple policies that allow admins to see everything
CREATE POLICY "Allow all access for now" ON user_profiles
FOR ALL USING (true) WITH CHECK (true);

-- Verify we can see all users
SELECT user_id, display_name, locked, is_admin, created_at 
FROM user_profiles 
ORDER BY created_at DESC;
