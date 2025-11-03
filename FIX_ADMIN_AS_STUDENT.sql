-- Fix admin@batraining.com to be a regular student (as requested repeatedly)

-- Update admin@batraining.com to be a regular student
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID for admin@batraining.com
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'admin@batraining.com';
    
    -- Update user_profiles to make them a regular student
    UPDATE user_profiles 
    SET 
        is_admin = FALSE,
        is_super_admin = FALSE,
        is_senior_admin = FALSE,
        locked = TRUE,  -- Make them locked so we can test unlock
        registered_device = 'test-device-123',  -- Give them a device so we can test reset
        blocked = FALSE
    WHERE user_id = target_user_id;
    
    RAISE NOTICE 'Updated admin@batraining.com to be a regular locked student with device';
END $$;

-- Verify the change
SELECT 
  up.user_id,
  au.email,
  up.display_name,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  up.locked,
  up.registered_device,
  up.blocked
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'admin@batraining.com';













