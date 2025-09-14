-- Unlock the superadmin user from device lock
-- Run this in Supabase SQL Editor

-- Unlock the superadmin user
UPDATE user_profiles 
SET locked = FALSE, registered_device = NULL
WHERE user_id = '564c6bf8-f067-4819-900e-f3322d402258';

-- Verify the unlock
SELECT user_id, locked, registered_device, is_admin, display_name 
FROM user_profiles 
WHERE user_id = '564c6bf8-f067-4819-900e-f3322d402258';

