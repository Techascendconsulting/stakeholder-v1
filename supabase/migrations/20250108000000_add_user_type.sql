-- Add user_type field to user_profiles table
-- 'new' = Learning Journey with sequential completion
-- 'existing' = Free access to all learning pages

-- Step 1: Add column with DEFAULT 'existing' (all current users are existing)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'existing' CHECK (user_type IN ('new', 'existing'));

-- Step 2: For safety, explicitly set all existing rows to 'existing'
UPDATE public.user_profiles
SET user_type = 'existing'
WHERE created_at < NOW();

-- Step 3: Now change default to 'new' for future signups ONLY
ALTER TABLE public.user_profiles
ALTER COLUMN user_type SET DEFAULT 'new';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);

-- Add comment
COMMENT ON COLUMN public.user_profiles.user_type IS 'User learning access type: new (Learning Journey) or existing (free access). All users before this migration are existing, future signups are new.';
