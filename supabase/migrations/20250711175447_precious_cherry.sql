/*
  # Create Students Table with Subscription Features

  1. New Tables
    - `students` - Store student subscription information
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, student name)
      - `email` (text, student email)
      - `subscription_tier` (text, subscription level)
      - `subscription_status_active` (boolean, subscription status)
      - `selected_project_id` (text, selected project for free users)
      - `meeting_count` (integer, number of meetings conducted)
      - `stripe_customer_id` (text, Stripe customer reference)
      - `subscription_expires_at` (timestamptz, subscription expiry)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)

  2. Security
    - Enable RLS on students table
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add performance indexes for common queries
*/

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  subscription_tier text CHECK (subscription_tier IN ('free', 'premium', 'enterprise')) DEFAULT 'free',
  subscription_status_active boolean DEFAULT true,
  selected_project_id text,
  meeting_count integer DEFAULT 0,
  stripe_customer_id text,
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for students
CREATE POLICY "Users can manage their own student data"
  ON public.students
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_subscription_tier ON public.students(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_students_selected_project ON public.students(selected_project_id);
CREATE INDEX IF NOT EXISTS idx_students_stripe_customer ON public.students(stripe_customer_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_students
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();