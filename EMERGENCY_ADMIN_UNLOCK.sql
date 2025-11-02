-- ====================================================================
-- EMERGENCY ADMIN UNLOCK - Force Admin Access and Unlock Account
-- Run this in your Supabase SQL Editor to unlock and restore admin access
-- ====================================================================

-- 1. Force unlock your account and set as super admin
UPDATE public.user_profiles
SET 
  is_admin = true,
  is_super_admin = true,
  is_senior_admin = true,
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'techascendconsulting1@gmail.com'
);

-- 2. If no profile exists, create one
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
WHERE au.email = 'techascendconsulting1@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  is_admin = true,
  is_super_admin = true,
  is_senior_admin = true,
  updated_at = NOW();

-- 3. Verify the update worked
SELECT 
  au.email,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email = 'techascendconsulting1@gmail.com';

-- 4. Create a simple admin bypass function
CREATE OR REPLACE FUNCTION public.force_admin_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Force update current user to super admin
  UPDATE public.user_profiles
  SET 
    is_admin = true,
    is_super_admin = true,
    is_senior_admin = true,
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  RETURN true;
END;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.force_admin_access() TO authenticated;

-- 7. Run the bypass function
SELECT public.force_admin_access();

SELECT 'Emergency admin unlock complete! Your account is now unlocked and set as super admin.' as status;
