-- Set up obyj1st@gmail.com as Senior Admin (middle tier)
-- This will give them the ability to promote students to Regular Admin

-- First, check if the user exists
DO $$
DECLARE
  user_exists BOOLEAN;
  target_user_id UUID;
BEGIN
  -- Check if the user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'obyj1st@gmail.com') INTO user_exists;
  
  IF user_exists THEN
    -- Get the user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'obyj1st@gmail.com';
    
    -- Update or insert into user_profiles to make them a Senior Admin
    INSERT INTO user_profiles (user_id, is_super_admin, is_admin, is_senior_admin, blocked, locked)
    VALUES (target_user_id, FALSE, TRUE, TRUE, FALSE, FALSE)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_super_admin = FALSE,
      is_admin = TRUE, 
      is_senior_admin = TRUE,
      blocked = FALSE,
      locked = FALSE;
    
    RAISE NOTICE 'Successfully set up obyj1st@gmail.com as Senior Admin';
    RAISE NOTICE 'They can now promote students to Regular Admin and manage Regular Admins';
  ELSE
    RAISE NOTICE 'User obyj1st@gmail.com not found in auth.users. Please create the account first.';
  END IF;
END $$;
