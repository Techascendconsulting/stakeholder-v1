/*
  # Create Students Table

  1. New Tables
    - `students`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, student's full name)
      - `email` (text, student's email address)
      - `subscription_status` (text, subscription tier)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `students` table
    - Add policy for students to read/update their own data
*/

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  subscription_status text CHECK (subscription_status IN ('free', 'premium', 'enterprise')) DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own data"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can update own data"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can insert own data"
  ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_subscription ON public.students(subscription_status);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_students
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();