/*
  # Add Project Limits and Subscription Management
  
  1. Add subscription fields to user_profiles
  2. Set defaults for existing users
  3. Enable project limit enforcement
*/

-- Add subscription fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_tier text CHECK (subscription_tier IN ('free', 'premium', 'enterprise')) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS max_projects integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'expired', 'cancelled', 'trial')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

-- Set all existing users to 'free' tier with 1 project limit
UPDATE public.user_profiles
SET 
  subscription_tier = 'free',
  max_projects = 1,
  subscription_status = 'active'
WHERE subscription_tier IS NULL;

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription 
ON public.user_profiles(user_id, subscription_tier, subscription_status);

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.subscription_tier IS 'User subscription tier: free (1 project), premium (5 projects), enterprise (unlimited)';
COMMENT ON COLUMN public.user_profiles.max_projects IS 'Maximum number of projects user can select. Free=1, Premium=5, Enterprise=999';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Current subscription status';






