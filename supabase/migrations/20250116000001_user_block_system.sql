-- ========================================
-- USER BLOCK SYSTEM
-- Add block functionality with tracking
-- ========================================

-- Add block-related columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS block_reason text,
ADD COLUMN IF NOT EXISTS blocked_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS blocked_at timestamptz;

-- Create index for faster blocked user queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_blocked ON public.user_profiles(blocked) WHERE blocked = true;

-- Update RLS policies to block access for blocked users
-- This is a global policy that applies to all tables

-- User profiles: Blocked users can only read their own profile (to see they're blocked)
DROP POLICY IF EXISTS "blocked_users_read_only" ON public.user_profiles;
CREATE POLICY "blocked_users_read_only" ON public.user_profiles
FOR SELECT
USING (
  user_id = auth.uid() OR 
  NOT COALESCE((SELECT blocked FROM public.user_profiles WHERE user_id = auth.uid()), false)
);

-- User profiles: Blocked users cannot update anything
DROP POLICY IF EXISTS "blocked_users_no_update" ON public.user_profiles;
CREATE POLICY "blocked_users_no_update" ON public.user_profiles
FOR UPDATE
USING (
  NOT COALESCE((SELECT blocked FROM public.user_profiles WHERE user_id = auth.uid()), false)
);

-- Function to check if user is blocked (can be used in other RLS policies)
CREATE OR REPLACE FUNCTION public.is_user_blocked(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT blocked FROM public.user_profiles WHERE user_id = check_user_id),
    false
  );
END;
$$;

-- Function to block a user (only callable by admins)
CREATE OR REPLACE FUNCTION public.block_user(
  target_user_id uuid,
  reason text DEFAULT 'Policy violation'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT COALESCE(is_admin, false) OR COALESCE(is_senior_admin, false) OR COALESCE(is_super_admin, false)
  INTO is_admin
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can block users';
  END IF;
  
  -- Block the user
  UPDATE public.user_profiles
  SET 
    blocked = true,
    block_reason = reason,
    blocked_by = auth.uid(),
    blocked_at = NOW()
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Function to unblock a user (only callable by admins)
CREATE OR REPLACE FUNCTION public.unblock_user(
  target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT COALESCE(is_admin, false) OR COALESCE(is_senior_admin, false) OR COALESCE(is_super_admin, false)
  INTO is_admin
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can unblock users';
  END IF;
  
  -- Unblock the user
  UPDATE public.user_profiles
  SET 
    blocked = false,
    block_reason = NULL,
    blocked_by = NULL,
    blocked_at = NULL
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Add RLS policies for other critical tables to block access for blocked users
-- Example for user_meetings (repeat pattern for other tables as needed)

-- Meetings: Blocked users cannot access meetings
DROP POLICY IF EXISTS "blocked_users_no_meetings" ON public.user_meetings;
CREATE POLICY "blocked_users_no_meetings" ON public.user_meetings
FOR ALL
USING (
  NOT public.is_user_blocked(auth.uid())
);

-- Projects: Blocked users cannot access projects  
DROP POLICY IF EXISTS "blocked_users_no_projects" ON public.user_projects;
CREATE POLICY "blocked_users_no_projects" ON public.user_projects
FOR ALL
USING (
  NOT public.is_user_blocked(auth.uid())
);

-- Deliverables: Blocked users cannot access deliverables
DROP POLICY IF EXISTS "blocked_users_no_deliverables" ON public.user_deliverables;
CREATE POLICY "blocked_users_no_deliverables" ON public.user_deliverables
FOR ALL
USING (
  NOT public.is_user_blocked(auth.uid())
);

-- Progress: Blocked users cannot access progress
DROP POLICY IF EXISTS "blocked_users_no_progress" ON public.user_progress;
CREATE POLICY "blocked_users_no_progress" ON public.user_progress
FOR ALL
USING (
  NOT public.is_user_blocked(auth.uid())
);

-- Learning progress: Blocked users cannot access learning progress
DROP POLICY IF EXISTS "blocked_users_no_learning" ON public.learning_progress;
CREATE POLICY "blocked_users_no_learning" ON public.learning_progress
FOR ALL
USING (
  NOT public.is_user_blocked(auth.uid())
);

-- Practice progress: Blocked users cannot access practice progress
DROP POLICY IF EXISTS "blocked_users_no_practice" ON public.practice_progress;
CREATE POLICY "blocked_users_no_practice" ON public.practice_progress
FOR ALL
USING (
  NOT public.is_user_blocked(auth.uid())
);

-- Project progress: Blocked users cannot access project progress
DROP POLICY IF EXISTS "blocked_users_no_project_progress" ON public.project_progress;
CREATE POLICY "blocked_users_no_project_progress" ON public.project_progress
FOR ALL
USING (
  NOT public.is_user_blocked(auth.uid())
);

COMMENT ON COLUMN public.user_profiles.blocked IS 'Whether the user account is blocked from accessing the platform';
COMMENT ON COLUMN public.user_profiles.block_reason IS 'Reason for blocking the user account';
COMMENT ON COLUMN public.user_profiles.blocked_by IS 'Admin user ID who blocked this account';
COMMENT ON COLUMN public.user_profiles.blocked_at IS 'Timestamp when the account was blocked';










