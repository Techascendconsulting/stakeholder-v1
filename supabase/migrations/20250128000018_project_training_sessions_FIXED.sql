-- Migration: Project Training Sessions Table (FIXED VERSION)
-- Description: Stores training session data, progress, and AI feedback for specific projects

-- Create project_training_sessions table
CREATE TABLE IF NOT EXISTS project_training_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID NOT NULL, -- Will reference projects table when created
    current_stage VARCHAR(50) DEFAULT 'problem_exploration' CHECK (current_stage IN ('problem_exploration', 'as_is', 'as_is_mapping', 'to_be', 'solution_design')),
    progress_data JSONB NOT NULL DEFAULT '{}', -- Store stage completion, question counts, etc.
    meeting_transcripts JSONB, -- Store meeting conversation data
    ai_feedback JSONB, -- Store AI coaching feedback and evaluations
    training_config JSONB, -- Store training session configuration
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_training_sessions_user_id ON project_training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_training_sessions_project_id ON project_training_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_training_sessions_current_stage ON project_training_sessions(current_stage);
CREATE INDEX IF NOT EXISTS idx_project_training_sessions_is_active ON project_training_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_project_training_sessions_started_at ON project_training_sessions(started_at);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_project_training_sessions_user_project ON project_training_sessions(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_project_training_sessions_user_active ON project_training_sessions(user_id, is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE project_training_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own training sessions" ON project_training_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training sessions" ON project_training_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training sessions" ON project_training_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training sessions" ON project_training_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_project_training_sessions_updated_at 
    BEFORE UPDATE ON project_training_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data will be inserted after user authentication is set up
-- For now, we'll create the tables without sample data to avoid foreign key issues


