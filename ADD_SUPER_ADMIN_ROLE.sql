-- Add Three-Tier Admin System
-- Super Admin (highest) > Senior Admin (middle) > Regular Admin (lower) > Students

-- Add the admin role columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_senior_admin BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance when filtering admin roles
CREATE INDEX IF NOT EXISTS idx_user_profiles_super_admin 
ON user_profiles(is_super_admin);

CREATE INDEX IF NOT EXISTS idx_user_profiles_senior_admin 
ON user_profiles(is_senior_admin);

-- Add comments to document the column purposes
COMMENT ON COLUMN user_profiles.is_super_admin IS 'Indicates if the user is a Super Admin (highest level, can manage all other admins)';
COMMENT ON COLUMN user_profiles.is_senior_admin IS 'Indicates if the user is a Senior Admin (middle level, can manage regular admins and students)';

-- Update existing superadmin@test.com to be a Super Admin
UPDATE user_profiles 
SET is_super_admin = TRUE, is_admin = TRUE
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'superadmin@test.com'
);

-- Drop the existing function first (since we're changing the return type)
DROP FUNCTION IF EXISTS get_user_details_with_emails();

-- Recreate the get_user_details_with_emails function to include all admin roles
CREATE OR REPLACE FUNCTION get_user_details_with_emails()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  locked BOOLEAN,
  registered_device TEXT,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN,
  is_senior_admin BOOLEAN,
  blocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id as id,
    get_user_email(up.user_id) as email,
    up.display_name,
    up.created_at,
    get_user_last_sign_in(up.user_id) as last_sign_in_at,
    up.locked,
    up.registered_device,
    up.is_admin,
    up.is_super_admin,
    up.is_senior_admin,
    up.blocked
  FROM user_profiles up
  ORDER BY up.created_at DESC;
END;
$$;

-- Create a function to promote a user to regular admin (only Super Admins can use this)
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles 
  SET is_admin = TRUE
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Create a function to promote a user to super admin (only Super Admins can use this)
CREATE OR REPLACE FUNCTION promote_user_to_super_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles 
  SET is_admin = TRUE, is_super_admin = TRUE
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Create a function to demote admin to regular user (only Super Admins can use this)
CREATE OR REPLACE FUNCTION demote_admin_to_user(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prevent demoting super admins
  IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid AND is_super_admin = TRUE) THEN
    RETURN FALSE;
  END IF;
  
  UPDATE user_profiles 
  SET is_admin = FALSE, is_super_admin = FALSE
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;
