/*
  # Agile Tickets Database Schema
  
  Creates tables for agile ticket management with proper persistence
  for drag and drop operations and ticket ordering.
*/

-- Create agile_tickets table
CREATE TABLE IF NOT EXISTS public.agile_tickets (
  id text PRIMARY KEY,
  ticket_number text NOT NULL,
  project_id text NOT NULL,
  project_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Story', 'Task', 'Bug', 'Spike')),
  title text NOT NULL,
  description text,
  acceptance_criteria text,
  priority text NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  status text NOT NULL CHECK (status IN ('Draft', 'Ready for Refinement', 'Refined', 'In Sprint', 'To Do', 'In Progress', 'In Test', 'Done')),
  story_points integer,
  sort_order integer DEFAULT 0, -- For drag and drop ordering
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  attachments jsonb DEFAULT '[]'::jsonb,
  comments jsonb DEFAULT '[]'::jsonb,
  refinement_score jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agile_tickets_user_id ON public.agile_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_agile_tickets_project_id ON public.agile_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_agile_tickets_status ON public.agile_tickets(status);
CREATE INDEX IF NOT EXISTS idx_agile_tickets_sort_order ON public.agile_tickets(sort_order);

-- Create RLS policies
ALTER TABLE public.agile_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tickets
CREATE POLICY "Users can view their own tickets" ON public.agile_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own tickets
CREATE POLICY "Users can insert their own tickets" ON public.agile_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tickets
CREATE POLICY "Users can update their own tickets" ON public.agile_tickets
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own tickets
CREATE POLICY "Users can delete their own tickets" ON public.agile_tickets
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agile_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_agile_tickets_updated_at
  BEFORE UPDATE ON public.agile_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_agile_tickets_updated_at();

-- Create sprint_planning_sessions table for sprint planning persistence
CREATE TABLE IF NOT EXISTS public.sprint_planning_sessions (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id text NOT NULL,
  project_name text NOT NULL,
  sprint_name text,
  backlog_stories jsonb DEFAULT '[]'::jsonb, -- Array of story IDs
  sprint_stories jsonb DEFAULT '[]'::jsonb,  -- Array of story IDs
  meeting_started boolean DEFAULT false,
  sprint_started boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create indexes for sprint planning sessions
CREATE INDEX IF NOT EXISTS idx_sprint_planning_sessions_user_id ON public.sprint_planning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sprint_planning_sessions_project_id ON public.sprint_planning_sessions(project_id);

-- Create RLS policies for sprint planning sessions
ALTER TABLE public.sprint_planning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sprint planning sessions" ON public.sprint_planning_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sprint planning sessions" ON public.sprint_planning_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sprint planning sessions" ON public.sprint_planning_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sprint planning sessions" ON public.sprint_planning_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update sprint planning sessions updated_at timestamp
CREATE OR REPLACE FUNCTION update_sprint_planning_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sprint planning sessions
CREATE TRIGGER update_sprint_planning_sessions_updated_at
  BEFORE UPDATE ON public.sprint_planning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sprint_planning_sessions_updated_at();




















