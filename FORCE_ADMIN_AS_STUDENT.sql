-- Force admin@batraining.com to be a regular student with device lock
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID for admin@batraining.com
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'admin@batraining.com';
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User admin@batraining.com not found';
        RETURN;
    END IF;
    
    -- Ensure user_profiles record exists
    INSERT INTO user_profiles (user_id, display_name, is_admin, is_super_admin, is_senior_admin, blocked, locked, registered_device, created_at)
    VALUES (target_user_id, 'Admin Student', FALSE, FALSE, FALSE, FALSE, TRUE, 'test-device-123', now())
    ON CONFLICT (user_id) DO UPDATE SET
        is_admin = FALSE,
        is_super_admin = FALSE,
        is_senior_admin = FALSE,
        blocked = FALSE,
        locked = TRUE,
        registered_device = 'test-device-123';
    
    RAISE NOTICE 'Updated admin@batraining.com to be a regular locked student with device';
END $$;





