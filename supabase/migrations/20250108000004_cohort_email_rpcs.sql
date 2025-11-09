-- Create RPC functions to get users and students with emails
-- Frontend can't access auth.users directly, so we need server-side functions

-- Function to get all users with their emails
CREATE OR REPLACE FUNCTION get_users_with_emails()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
    COALESCE(up.display_name, 'Unknown User') as display_name,
    au.email::TEXT as email
  FROM public.user_profiles up
  INNER JOIN auth.users au ON au.id = up.user_id
  WHERE au.email IS NOT NULL
  ORDER BY up.display_name;
END;
$$;

-- Function to get cohort students with their emails
CREATE OR REPLACE FUNCTION get_cohort_students_with_emails(p_cohort_id UUID)
RETURNS TABLE (
  cohort_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.cohort_id,
    cs.user_id,
    cs.role,
    cs.joined_at,
    au.email::TEXT as email
  FROM public.cohort_students cs
  INNER JOIN auth.users au ON au.id = cs.user_id
  WHERE cs.cohort_id = p_cohort_id
  ORDER BY cs.joined_at;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_users_with_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cohort_students_with_emails(UUID) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Email RPC functions created - student search will now work';
END $$;


