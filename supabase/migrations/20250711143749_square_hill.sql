/*
  # BA Training Platform Database Schema

  1. New Tables
    - `user_projects` - Track user progress through training projects
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_id` (text, references mock project IDs)
      - `status` (text, project completion status)
      - `started_at` (timestamptz, when project was started)
      - `completed_at` (timestamptz, when project was completed)
      - `current_step` (text, current view/step in project)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)

    - `user_meetings` - Store stakeholder meeting records
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_id` (text, associated project)
      - `stakeholder_ids` (text[], list of stakeholder IDs)
      - `transcript` (jsonb, meeting conversation transcript)
      - `status` (text, meeting status)
      - `meeting_type` (text, individual or group)
      - `duration` (integer, meeting duration in minutes)
      - `created_at` (timestamptz, meeting start time)
      - `completed_at` (timestamptz, meeting end time)

    - `user_deliverables` - Store created deliverables
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_id` (text, associated project)
      - `type` (text, deliverable type)
      - `title` (text, deliverable title)
      - `content` (text, deliverable content)
      - `created_at` (timestamptz, creation time)
      - `updated_at` (timestamptz, last update time)

    - `user_progress` - Track overall user progress and achievements
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total_projects_started` (integer, count of started projects)
      - `total_projects_completed` (integer, count of completed projects)
      - `total_meetings_conducted` (integer, count of completed meetings)
      - `total_deliverables_created` (integer, count of created deliverables)
      - `achievements` (text[], list of earned achievements)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure data isolation between users

  3. Indexes
    - Add performance indexes for common queries
    - Foreign key indexes for efficient joins
*/

-- Create user_projects table
CREATE TABLE IF NOT EXISTS public.user_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id text NOT NULL,
  status text CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  current_step text DEFAULT 'projects',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_meetings table
CREATE TABLE IF NOT EXISTS public.user_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id text NOT NULL,
  stakeholder_ids text[] NOT NULL DEFAULT '{}',
  transcript jsonb DEFAULT '[]'::jsonb,
  status text CHECK (status IN ('scheduled', 'in_progress', 'completed')) DEFAULT 'scheduled',
  meeting_type text CHECK (meeting_type IN ('individual', 'group')) NOT NULL,
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create user_deliverables table
CREATE TABLE IF NOT EXISTS public.user_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id text NOT NULL,
  type text CHECK (type IN ('goals', 'user-stories', 'acceptance-criteria', 'brd')) NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_projects_started integer DEFAULT 0,
  total_projects_completed integer DEFAULT 0,
  total_meetings_conducted integer DEFAULT 0,
  total_deliverables_created integer DEFAULT 0,
  achievements text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_projects
CREATE POLICY "Users can manage their own projects"
  ON public.user_projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_meetings
CREATE POLICY "Users can manage their own meetings"
  ON public.user_meetings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_deliverables
CREATE POLICY "Users can manage their own deliverables"
  ON public.user_deliverables
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_progress
CREATE POLICY "Users can manage their own progress"
  ON public.user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_project_id ON public.user_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON public.user_projects(status);

CREATE INDEX IF NOT EXISTS idx_user_meetings_user_id ON public.user_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meetings_project_id ON public.user_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_user_meetings_status ON public.user_meetings(status);

CREATE INDEX IF NOT EXISTS idx_user_deliverables_user_id ON public.user_deliverables(user_id);
CREATE INDEX IF NOT EXISTS idx_user_deliverables_project_id ON public.user_deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_user_deliverables_type ON public.user_deliverables(type);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_user_projects
  BEFORE UPDATE ON public.user_projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_deliverables
  BEFORE UPDATE ON public.user_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_progress
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();