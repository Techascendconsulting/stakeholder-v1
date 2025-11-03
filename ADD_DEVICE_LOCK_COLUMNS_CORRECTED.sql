-- Add device lock columns to the correct user table
-- This script works with Supabase's standard setup

-- Option 1: If you have a 'profiles' table (most common Supabase pattern)
-- Uncomment the lines below if you have a profiles table

-- ALTER TABLE profiles 
-- ADD COLUMN IF NOT EXISTS registered_device TEXT;

-- ALTER TABLE profiles 
-- ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false;

-- CREATE INDEX IF NOT EXISTS idx_profiles_registered_device ON profiles(registered_device);
-- CREATE INDEX IF NOT EXISTS idx_profiles_locked ON profiles(locked);

-- UPDATE profiles SET locked = false WHERE locked IS NULL;

-- Option 2: If you need to create a profiles table first
-- Uncomment the lines below if you don't have a profiles table

-- CREATE TABLE IF NOT EXISTS profiles (
--   id UUID REFERENCES auth.users(id) PRIMARY KEY,
--   email TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   registered_device TEXT,
--   locked BOOLEAN DEFAULT false
-- );

-- CREATE INDEX IF NOT EXISTS idx_profiles_registered_device ON profiles(registered_device);
-- CREATE INDEX IF NOT EXISTS idx_profiles_locked ON profiles(locked);

-- Option 3: If you have a custom 'users' table in public schema
-- Uncomment the lines below if you have a public.users table

-- ALTER TABLE public.users 
-- ADD COLUMN IF NOT EXISTS registered_device TEXT;

-- ALTER TABLE public.users 
-- ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false;

-- CREATE INDEX IF NOT EXISTS idx_users_registered_device ON public.users(registered_device);
-- CREATE INDEX IF NOT EXISTS idx_users_locked ON public.users(locked);

-- UPDATE public.users SET locked = false WHERE locked IS NULL;

-- Add comments
-- COMMENT ON COLUMN profiles.registered_device IS 'FingerprintJS device ID for device lock functionality';
-- COMMENT ON COLUMN profiles.locked IS 'Whether the account is locked due to device mismatch';













