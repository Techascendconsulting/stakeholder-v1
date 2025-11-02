-- Add device lock columns to user_profiles table
-- Run this in your Supabase SQL editor

-- Add the device lock columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS registered_device TEXT;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_registered_device ON user_profiles(registered_device);
CREATE INDEX IF NOT EXISTS idx_user_profiles_locked ON user_profiles(locked);

-- Set default values for existing users
UPDATE user_profiles SET locked = false WHERE locked IS NULL;

-- Add comments
COMMENT ON COLUMN user_profiles.registered_device IS 'FingerprintJS device ID for device lock functionality';
COMMENT ON COLUMN user_profiles.locked IS 'Whether the account is locked due to device mismatch';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name IN ('registered_device', 'locked')
ORDER BY column_name;
