-- Add device lock columns to users table
-- This script adds the necessary columns for device lock functionality

-- Add registered_device column to store FingerprintJS device ID
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS registered_device TEXT;

-- Add locked column to track if account is locked
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false;

-- Add index for better performance on device lookups
CREATE INDEX IF NOT EXISTS idx_users_registered_device ON users(registered_device);
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(locked);

-- Update existing users to have locked = false (they should be unlocked by default)
UPDATE users SET locked = false WHERE locked IS NULL;

-- Add comment to document the purpose
COMMENT ON COLUMN users.registered_device IS 'FingerprintJS device ID for device lock functionality';
COMMENT ON COLUMN users.locked IS 'Whether the account is locked due to device mismatch';







