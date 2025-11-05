-- CLEAN ADMIN SETUP - Works with any email seamlessly
-- This script creates a Super Admin user that can immediately access the admin panel

-- Step 1: Create the user in auth.users (if not exists)
-- Replace 'your-email@example.com' with the actual email you want to use
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  'your-email@example.com',  -- CHANGE THIS EMAIL
  crypt('admin123', gen_salt('bf')),  -- Password: admin123
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Step 2: Get the user ID for the email
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'your-email@example.com';  -- CHANGE THIS EMAIL
    
    -- Step 3: Create user_profiles record with Super Admin privileges
    INSERT INTO user_profiles (
        user_id,
        display_name,
        is_admin,
        is_super_admin,
        is_senior_admin,
        blocked,
        locked,
        created_at
    ) VALUES (
        target_user_id,
        'Super Admin',
        TRUE,
        TRUE,
        TRUE,
        FALSE,
        FALSE,
        now()
    ) ON CONFLICT (user_id) DO UPDATE SET
        is_admin = TRUE,
        is_super_admin = TRUE,
        is_senior_admin = TRUE,
        blocked = FALSE,
        locked = FALSE;
    
    RAISE NOTICE 'Super Admin created/updated for user: %', target_user_id;
END $$;

-- Step 4: Ensure the function works correctly
DROP FUNCTION IF EXISTS get_user_details_with_emails();

CREATE OR REPLACE FUNCTION get_user_details_with_emails()
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  display_name VARCHAR(255),
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  locked BOOLEAN,
  registered_device VARCHAR(255),
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
    au.email::VARCHAR(255),
    up.display_name::VARCHAR(255),
    up.created_at,
    au.last_sign_in_at,
    up.locked,
    up.registered_device::VARCHAR(255),
    up.is_admin,
    up.is_super_admin,
    up.is_senior_admin,
    up.blocked
  FROM user_profiles up
  LEFT JOIN auth.users au ON up.user_id = au.id
  ORDER BY up.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_details_with_emails() TO authenticated;

-- Step 5: Verify the setup
SELECT 
  up.user_id,
  au.email,
  up.display_name,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.blocked,
  up.locked
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'your-email@example.com';  -- CHANGE THIS EMAIL














