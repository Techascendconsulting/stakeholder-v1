/*
  # Add Missing Columns to Students Table

  1. Table Updates
    - Add missing columns to students table if they don't exist:
      - subscription_tier (text with check constraint)
      - subscription_status_active (boolean)
      - selected_project_id (text)
      - meeting_count (integer)
      - stripe_customer_id (text)
      - subscription_expires_at (timestamptz)

  2. Data Migration
    - Set default values for existing records

  3. Indexes
    - Add performance indexes for new columns
*/

-- Add missing columns to students table
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