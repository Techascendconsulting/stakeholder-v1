-- ====================================================================
-- FIX UNLOCK FUNCTIONALITY - Ensure locked field exists and has proper permissions
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Check if the locked field exists in user_profiles
SELECT 'Checking user_profiles structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add locked field if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false;

-- 3. Add registered_device field if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS registered_device TEXT;

-- 4. Update existing users to have locked = false if NULL
UPDATE public.user_profiles 
SET locked = false 
WHERE locked IS NULL;

-- 5. Create a simple unlock function for admins
CREATE OR REPLACE FUNCTION public.unlock_user_account(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_email TEXT;
  target_user_email TEXT;
BEGIN
  -- Get current user email
  SELECT au.email INTO current_user_email
  FROM auth.users au
  WHERE au.id = auth.uid();
  
  -- Force admin access for your email
  IF current_user_email != 'techascendconsulting1@gmail.com' THEN
    -- Check if current user is admin
    IF NOT EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
    ) THEN
      RETURN 'ERROR: Only admins can unlock accounts';
    END IF;
  END IF;
  
  -- Get target user email for logging
  SELECT au.email INTO target_user_email
  FROM auth.users au
  WHERE au.id = target_user_id;
  
  -- Unlock the account
  UPDATE public.user_profiles 
  SET locked = false, updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Check if update was successful
  IF FOUND THEN
    RETURN 'SUCCESS: Account unlocked for ' || COALESCE(target_user_email, 'unknown user');
  ELSE
    RETURN 'ERROR: User not found or already unlocked';
  END IF;
END;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.unlock_user_account(UUID) TO authenticated;

-- 7. Test the unlock function
SELECT 'Testing unlock function:' as info;
SELECT public.unlock_user_account(
  (SELECT id FROM auth.users WHERE email = 'admin@batraining.com' LIMIT 1)
) as result;

-- 8. Show current user status
SELECT 'Current user status:' as info;
SELECT 
  au.email,
  up.display_name,
  up.locked,
  up.registered_device,
  CASE 
    WHEN up.locked = true THEN 'LOCKED'
    WHEN up.locked = false THEN 'UNLOCKED'
    WHEN up.locked IS NULL THEN 'NULL'
    ELSE 'UNKNOWN'
  END as lock_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;



















