-- Migration: Project Deliverables Table (FIXED VERSION)
-- Description: Stores user deliverables for specific projects with stage-based access control

-- Create project_deliverables table
CREATE TABLE IF NOT EXISTS project_deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID NOT NULL, -- Will reference projects table when created
    type VARCHAR(50) NOT NULL CHECK (type IN ('problem_statement', 'process_map', 'stakeholder_notes', 'requirements_doc', 'user_stories')),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted', 'reviewed')),
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('problem_exploration', 'as_is', 'as_is_mapping', 'to_be', 'solution_design')),
    tags TEXT[], -- Array of tags for categorization
    attachments JSONB, -- Store file metadata and URLs
    metadata JSONB, -- Additional structured data like word count, complexity, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_deliverables_user_id ON project_deliverables(user_id);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_project_id ON project_deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_type ON project_deliverables(type);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_stage ON project_deliverables(stage);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_status ON project_deliverables(status);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_created_at ON project_deliverables(created_at);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_project_deliverables_user_project ON project_deliverables(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_project_stage ON project_deliverables(project_id, stage);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_user_type ON project_deliverables(user_id, type);

-- Enable Row Level Security (RLS)
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own deliverables" ON project_deliverables
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deliverables" ON project_deliverables
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliverables" ON project_deliverables
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deliverables" ON project_deliverables
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_deliverables_updated_at 
    BEFORE UPDATE ON project_deliverables 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data will be inserted after user authentication is set up
-- For now, we'll create the tables without sample data to avoid foreign key issues







