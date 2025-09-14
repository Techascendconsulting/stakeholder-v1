-- Create Admin User Script
-- This script allows you to create a new admin user or promote an existing user to admin

-- Method 1: Create a new admin user (if they don't exist yet)
-- Replace 'newadmin@example.com' with the actual email
-- Replace 'New Admin Name' with the actual display name

-- First, check if user exists in auth.users
DO $$
DECLARE
    user_email TEXT := 'newadmin@example.com'; -- CHANGE THIS EMAIL
    user_display_name TEXT := 'New Admin Name'; -- CHANGE THIS NAME
    user_uuid UUID;
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_uuid IS NOT NULL THEN
        user_exists := TRUE;
        RAISE NOTICE 'User % already exists with ID: %', user_email, user_uuid;
    ELSE
        RAISE NOTICE 'User % does not exist in auth.users. Please create the user account first through the signup process.', user_email;
        RETURN;
    END IF;
    
    -- If user exists, make them an admin
    IF user_exists THEN
        -- Insert or update user_profiles
        INSERT INTO user_profiles (
            user_id, 
            display_name, 
            is_admin, 
            created_at, 
            updated_at
        ) VALUES (
            user_uuid, 
            user_display_name, 
            TRUE, 
            NOW(), 
            NOW()
        ) ON CONFLICT (user_id) 
        DO UPDATE SET 
            is_admin = TRUE,
            display_name = user_display_name,
            updated_at = NOW();
        
        -- Insert into user_admin_roles (if the table exists)
        INSERT INTO user_admin_roles (user_id, role_id, assigned_at)
        SELECT 
            user_uuid,
            ar.id,
            NOW()
        FROM admin_roles ar 
        WHERE ar.role_name = 'super_admin'
        ON CONFLICT (user_id, role_id) DO NOTHING;
        
        RAISE NOTICE 'Successfully promoted % to admin with ID: %', user_email, user_uuid;
    END IF;
END $$;

-- Method 2: Promote an existing user to admin (if you know their email)
-- Uncomment and modify the email below:

/*
DO $$
DECLARE
    existing_user_email TEXT := 'existing@example.com'; -- CHANGE THIS EMAIL
    user_uuid UUID;
BEGIN
    -- Find the user
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = existing_user_email;
    
    IF user_uuid IS NULL THEN
        RAISE NOTICE 'User % not found in auth.users', existing_user_email;
        RETURN;
    END IF;
    
    -- Make them an admin
    UPDATE user_profiles 
    SET is_admin = TRUE, updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Add admin role
    INSERT INTO user_admin_roles (user_id, role_id, assigned_at)
    SELECT 
        user_uuid,
        ar.id,
        NOW()
    FROM admin_roles ar 
    WHERE ar.role_name = 'super_admin'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Successfully promoted % to admin', existing_user_email;
END $$;
*/

-- Method 3: List all current admin users
SELECT 
    au.email,
    up.display_name,
    up.is_admin,
    up.created_at,
    up.updated_at
FROM auth.users au
JOIN user_profiles up ON au.id = up.user_id
WHERE up.is_admin = TRUE
ORDER BY up.created_at DESC;