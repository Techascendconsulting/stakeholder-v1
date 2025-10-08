-- Add user_type field to user_profiles table
-- 'new' = Learning Journey with sequential completion
-- 'existing' = Free access to all learning pages

-- Step 1: Add column with temporary default
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('new', 'existing'));

-- Step 2: Set ALL existing users to 'existing' (they've been using the app already)
UPDATE public.user_profiles
SET user_type = 'existing'
WHERE user_type IS NULL;

-- Step 3: Now set NOT NULL constraint with 'new' default for future signups
ALTER TABLE public.user_profiles
ALTER COLUMN user_type SET NOT NULL,
ALTER COLUMN user_type SET DEFAULT 'new';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);

-- Add comment
COMMENT ON COLUMN public.user_profiles.user_type IS 'User learning access type: new (Learning Journey) or existing (free access). Existing users grandfathered in, new signups start with Learning Journey.';
