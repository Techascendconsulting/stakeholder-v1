-- Create function to get user details with emails
-- This function combines user_profiles with auth.users to get complete user information

CREATE OR REPLACE FUNCTION get_user_details_with_emails()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  locked boolean,
  registered_device text,
  is_admin boolean,
  is_super_admin boolean,
  is_senior_admin boolean,
  blocked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
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

















