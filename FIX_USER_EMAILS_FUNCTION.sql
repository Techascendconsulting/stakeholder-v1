-- Fix the get_user_details_with_emails function to properly include all admin role columns

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_user_details_with_emails();

-- Recreate the function with all necessary columns
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
    au.email,
    up.display_name,
    up.created_at,
    au.last_sign_in_at,
    up.locked,
    up.registered_device,
    up.is_admin,
    up.is_super_admin,
    up.is_senior_admin,
    up.blocked
  FROM user_profiles up
  LEFT JOIN auth.users au ON up.user_id = au.id
  ORDER BY up.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_details_with_emails() TO authenticated;
