-- Add blocked column to user_profiles table
-- This allows admins to block/unblock users for security or payment issues

-- Add the blocked column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE;

-- Add an index for better performance when filtering blocked users
CREATE INDEX IF NOT EXISTS idx_user_profiles_blocked 
ON user_profiles(blocked);

-- Add a comment to document the column purpose
COMMENT ON COLUMN user_profiles.blocked IS 'Indicates if the user account is blocked by admin (for security, non-payment, etc.)';

-- Drop the existing function first (since we're changing the return type)
DROP FUNCTION IF EXISTS get_user_details_with_emails();

-- Recreate the get_user_details_with_emails function to include blocked status
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
    up.blocked
  FROM user_profiles up
  ORDER BY up.created_at DESC;
END;
$$;
