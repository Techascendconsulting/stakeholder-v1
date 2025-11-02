-- ====================================================================
-- FIX ADMIN AUTHENTICATION - Create Admin Users and Fix Authentication
-- Run this in your Supabase SQL Editor to fix admin login issues
-- ====================================================================

-- 1. First, let's check what users exist and their admin status
SELECT 
  au.id,
  au.email,
  up.display_name,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC
LIMIT 10;

-- 2. Create a super admin user (replace with your email)
-- You'll need to replace 'your-email@example.com' with your actual email
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  is_admin,
  is_super_admin,
  is_senior_admin,
  created_at,
  updated_at
) 
SELECT 
  au.id,
  'Super Admin',
  true,
  true,
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'your-email@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  is_admin = true,
  is_super_admin = true,
  is_senior_admin = true,
  updated_at = NOW();

-- 3. Create a function to promote any user to super admin
CREATE OR REPLACE FUNCTION public.promote_to_super_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  result_message TEXT;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Update or insert user profile with super admin privileges
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    is_admin,
    is_super_admin,
    is_senior_admin,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    'Super Admin',
    true,
    true,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    is_admin = true,
    is_super_admin = true,
    is_senior_admin = true,
    updated_at = NOW();
  
  RETURN 'Successfully promoted ' || user_email || ' to Super Admin';
END;
$$;

-- 4. Create a function to check admin status
CREATE OR REPLACE FUNCTION public.check_admin_status(user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN,
  is_senior_admin BOOLEAN,
  admin_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    COALESCE(up.display_name::TEXT, 'No Profile'),
    COALESCE(up.is_admin, false),
    COALESCE(up.is_super_admin, false),
    COALESCE(up.is_senior_admin, false),
    CASE 
      WHEN COALESCE(up.is_super_admin, false) THEN 'Super Admin'
      WHEN COALESCE(up.is_senior_admin, false) THEN 'Senior Admin'
      WHEN COALESCE(up.is_admin, false) THEN 'Admin'
      ELSE 'Student'
    END as admin_level
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE (user_id_param IS NULL OR au.id = user_id_param)
  ORDER BY au.created_at DESC;
END;
$$;

-- 5. Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.promote_to_super_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_status(UUID) TO authenticated;

-- 6. Create a simple admin setup function
CREATE OR REPLACE FUNCTION public.setup_admin_system()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count INTEGER;
  result_message TEXT;
BEGIN
  -- Count existing admins
  SELECT COUNT(*) INTO admin_count
  FROM public.user_profiles
  WHERE is_admin = true;
  
  result_message := 'Admin system setup complete. Found ' || admin_count || ' existing admin users.';
  
  -- If no admins exist, create a default super admin for the first user
  IF admin_count = 0 THEN
    -- Get the first user and make them super admin
    UPDATE public.user_profiles
    SET 
      is_admin = true,
      is_super_admin = true,
      is_senior_admin = true,
      updated_at = NOW()
    WHERE user_id = (
        SELECT id FROM auth.users 
        ORDER BY created_at ASC 
        LIMIT 1
      );
    
    result_message := result_message || ' Created default super admin for first user.';
  END IF;
  
  RETURN result_message;
END;
$$;

-- 7. Run the admin setup
SELECT public.setup_admin_system();

-- 8. Show current admin status
SELECT * FROM public.check_admin_status();

-- 9. Create a function to easily promote users to different admin levels
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(
  user_email TEXT,
  admin_level TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  result_message TEXT;
BEGIN
  -- Validate admin level
  IF admin_level NOT IN ('admin', 'senior_admin', 'super_admin') THEN
    RETURN 'Invalid admin level. Must be: admin, senior_admin, or super_admin';
  END IF;
  
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Update user profile based on admin level
  CASE admin_level
    WHEN 'admin' THEN
      INSERT INTO public.user_profiles (
        user_id, display_name, is_admin, is_super_admin, is_senior_admin, created_at, updated_at
      ) VALUES (
        target_user_id, 'Admin', true, false, false, NOW(), NOW()
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        is_admin = true,
        is_super_admin = false,
        is_senior_admin = false,
        updated_at = NOW();
        
    WHEN 'senior_admin' THEN
      INSERT INTO public.user_profiles (
        user_id, display_name, is_admin, is_super_admin, is_senior_admin, created_at, updated_at
      ) VALUES (
        target_user_id, 'Senior Admin', true, false, true, NOW(), NOW()
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        is_admin = true,
        is_super_admin = false,
        is_senior_admin = true,
        updated_at = NOW();
        
    WHEN 'super_admin' THEN
      INSERT INTO public.user_profiles (
        user_id, display_name, is_admin, is_super_admin, is_senior_admin, created_at, updated_at
      ) VALUES (
        target_user_id, 'Super Admin', true, true, true, NOW(), NOW()
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        is_admin = true,
        is_super_admin = true,
        is_senior_admin = true,
        updated_at = NOW();
  END CASE;
  
  RETURN 'Successfully promoted ' || user_email || ' to ' || admin_level;
END;
$$;

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(TEXT, TEXT) TO authenticated;

-- Success message
SELECT 'Admin authentication system fixed! You can now use the promote functions to set up admin users.' as status;
