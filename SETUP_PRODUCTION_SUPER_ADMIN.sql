-- Complete setup for production Super Admin
-- This script adds all necessary columns and sets up your business email as Super Admin

-- Step 1: Add the blocked column (if not already added)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE;

-- Step 2: Add the three-tier admin system columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_senior_admin BOOLEAN DEFAULT FALSE;

-- Step 3: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_blocked 
ON user_profiles(blocked);

CREATE INDEX IF NOT EXISTS idx_user_profiles_super_admin 
ON user_profiles(is_super_admin);

CREATE INDEX IF NOT EXISTS idx_user_profiles_senior_admin 
ON user_profiles(is_senior_admin);

-- Step 4: Add comments to document the columns
COMMENT ON COLUMN user_profiles.blocked IS 'Indicates if the user account is blocked by admin (for security, non-payment, etc.)';
COMMENT ON COLUMN user_profiles.is_super_admin IS 'Indicates if the user is a Super Admin (highest level, can manage all other admins)';
COMMENT ON COLUMN user_profiles.is_senior_admin IS 'Indicates if the user is a Senior Admin (middle level, can manage regular admins and students)';

-- Step 5: Drop and recreate the function with all new columns
DROP FUNCTION IF EXISTS get_user_details_with_emails();

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

-- Step 6: Set up your business email as Super Admin
-- First, check if the user exists in auth.users
DO $$
DECLARE
  user_exists BOOLEAN;
  user_id UUID;
BEGIN
  -- Check if the user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'techascendconsulting@gmail.com') INTO user_exists;
  
  IF user_exists THEN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'techascendconsulting@gmail.com';
    
    -- Update or insert into user_profiles
    INSERT INTO user_profiles (user_id, is_super_admin, is_admin, is_senior_admin, blocked, locked)
    VALUES (user_id, TRUE, TRUE, TRUE, FALSE, FALSE)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_super_admin = TRUE,
      is_admin = TRUE, 
      is_senior_admin = TRUE,
      blocked = FALSE,
      locked = FALSE;
    
    RAISE NOTICE 'Successfully set up techascendconsulting@gmail.com as Super Admin';
  ELSE
    RAISE NOTICE 'User techascendconsulting@gmail.com not found in auth.users. Please create the account first.';
  END IF;
END $$;

-- Step 7: Create role management functions
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

CREATE OR REPLACE FUNCTION promote_user_to_senior_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles 
  SET is_admin = TRUE, is_senior_admin = TRUE
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION promote_user_to_super_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles 
  SET is_admin = TRUE, is_senior_admin = TRUE, is_super_admin = TRUE
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION demote_admin_to_user(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prevent demoting super admins (safety check)
  IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid AND is_super_admin = TRUE) THEN
    RETURN FALSE;
  END IF;
  
  UPDATE user_profiles 
  SET is_admin = FALSE, is_senior_admin = FALSE, is_super_admin = FALSE
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;
















