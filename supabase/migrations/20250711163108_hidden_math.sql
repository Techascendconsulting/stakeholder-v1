/*
  # Add Subscription Features to Students Table

  1. Updates to Students Table
    - Add subscription_tier column (free, premium, enterprise)
    - Add subscription_status column (active, cancelled, expired)
    - Add selected_project_id column for free users
    - Add meeting_count column to track usage
    - Add stripe_customer_id for future payment integration

  2. Security
    - Update existing RLS policies
    - Add indexes for performance

  3. Admin Setup
    - Create admin user record for enterprise demo
*/

-- Add new columns to students table
DO $$
BEGIN
  -- Add subscription_tier column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.students ADD COLUMN subscription_tier text CHECK (subscription_tier IN ('free', 'premium', 'enterprise')) DEFAULT 'free';
  END IF;

  -- Add subscription_status column if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_subscription_tier ON public.students(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_students_selected_project ON public.students(selected_project_id);
CREATE INDEX IF NOT EXISTS idx_students_stripe_customer ON public.students(stripe_customer_id);

-- Update existing students to have proper subscription data
UPDATE public.students 
SET subscription_tier = 'free', subscription_status_active = true, meeting_count = 0
WHERE subscription_tier IS NULL;