/*
  # Fix All Database Schema Issues

  1. Schema Fixes
    - Ensure students table has all required columns
    - Fix project_id data types to be consistent (text, not uuid)
    - Clean up duplicate user_projects entries
    - Add proper constraints and indexes

  2. Data Type Corrections
    - Ensure project_id columns are text type across all tables
    - Fix any UUID constraints that should be text

  3. Missing Columns
    - Add all missing columns to students table
    - Ensure proper defaults and constraints
*/

-- First, let's ensure the students table has all required columns
DO $$
BEGIN
  -- Add subscription_tier column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.students ADD COLUMN subscription_tier text CHECK (subscription_tier IN ('free', 'premium', 'enterprise')) DEFAULT 'free';
  END IF;

  -- Add subscription_status_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'subscription_status_active'
  ) THEN
    ALTER TABLE public.students ADD COLUMN subscription_status_active boolean DEFAULT true;
  END IF;

  -- Add selected_project_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'selected_project_id'
  ) THEN
    ALTER TABLE public.students ADD COLUMN selected_project_id text;
  END IF;

  -- Add meeting_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'meeting_count'
  ) THEN
    ALTER TABLE public.students ADD COLUMN meeting_count integer DEFAULT 0;
  END IF;

  -- Add stripe_customer_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.students ADD COLUMN stripe_customer_id text;
  END IF;

  -- Add subscription_expires_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE public.students ADD COLUMN subscription_expires_at timestamptz;
  END IF;
END $$;

-- Clean up duplicate user_projects entries (keep most recent)
DELETE FROM public.user_projects 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, project_id) id
  FROM public.user_projects
  ORDER BY user_id, project_id, created_at DESC
);

-- Add unique constraint to prevent future duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_projects_user_id_project_id_key'
  ) THEN
    ALTER TABLE public.user_projects 
    ADD CONSTRAINT user_projects_user_id_project_id_key 
    UNIQUE (user_id, project_id);
  END IF;
END $$;

-- Ensure project_id columns are text type (not uuid)
-- Check if meetings table exists and fix project_id type
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings') THEN
    -- Check if project_id is uuid type and convert to text
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'meetings' AND column_name = 'project_id' AND data_type = 'uuid'
    ) THEN
      ALTER TABLE public.meetings ALTER COLUMN project_id TYPE text;
    END IF;
  END IF;
END $$;

-- Update existing students to have proper subscription data
UPDATE public.students 
SET 
  subscription_tier = COALESCE(subscription_tier, 'free'),
  subscription_status_active = COALESCE(subscription_status_active, true),
  meeting_count = COALESCE(meeting_count, 0)
WHERE subscription_tier IS NULL OR subscription_status_active IS NULL OR meeting_count IS NULL;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_students_subscription_tier ON public.students(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_students_selected_project ON public.students(selected_project_id);
CREATE INDEX IF NOT EXISTS idx_students_stripe_customer ON public.students(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_project_composite ON public.user_projects(user_id, project_id);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';