-- Create admin functions for user management
-- Run this in Supabase SQL Editor

-- Function to get user email by user_id
CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_uuid;
  
  RETURN COALESCE(user_email, 'unknown@example.com');
END;
$$;

-- Function to get user last sign in by user_id
CREATE OR REPLACE FUNCTION get_user_last_sign_in(user_uuid UUID)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_sign_in TIMESTAMPTZ;
BEGIN
  SELECT last_sign_in_at INTO last_sign_in 
  FROM auth.users 
  WHERE id = user_uuid;
  
  RETURN last_sign_in;
END;
$$;

-- Function to unlock a user account
CREATE OR REPLACE FUNCTION unlock_user_account(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles 
  SET locked = FALSE, registered_device = NULL
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Function to clear device binding
CREATE OR REPLACE FUNCTION clear_device_binding(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles 
  SET registered_device = NULL
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Function to get all user details with emails
CREATE OR REPLACE FUNCTION get_user_details_with_emails()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  locked BOOLEAN,
  registered_device TEXT,
  is_admin BOOLEAN
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
    up.is_admin
  FROM user_profiles up
  ORDER BY up.created_at DESC;
END;
$$;

-- Test the functions
SELECT * FROM get_user_details_with_emails();
