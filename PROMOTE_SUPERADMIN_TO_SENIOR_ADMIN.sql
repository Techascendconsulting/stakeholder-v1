-- Promote superadmin@test.com to Senior Admin (middle tier)
-- This will give them the ability to promote students to Regular Admin

-- First, check if the user exists
DO $$
DECLARE
  user_exists BOOLEAN;
  target_user_id UUID;
BEGIN
  -- Check if the user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'superadmin@test.com') INTO user_exists;
  
  IF user_exists THEN
    -- Get the user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'superadmin@test.com';
    
    -- Update user_profiles to make them a Senior Admin
    UPDATE user_profiles 
    SET 
      is_admin = TRUE,
      is_senior_admin = TRUE,
      is_super_admin = FALSE,
      blocked = FALSE,
      locked = FALSE
    WHERE user_id = target_user_id;
    
    RAISE NOTICE 'Successfully promoted superadmin@test.com to Senior Admin';
    RAISE NOTICE 'They can now promote students to Regular Admin and manage Regular Admins';
  ELSE
    RAISE NOTICE 'User superadmin@test.com not found in auth.users. Please create the account first.';
  END IF;
END $$;














