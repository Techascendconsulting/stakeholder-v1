-- Migration: Project Metadata Table
-- Description: Tracks project information, progress, and deliverable statistics

-- Check if projects table exists and add missing columns
DO $$ 
BEGIN
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'type') THEN
        ALTER TABLE projects ADD COLUMN type VARCHAR(100) DEFAULT 'training';
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'created_by') THEN
        ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category') THEN
        ALTER TABLE projects ADD COLUMN category VARCHAR(50) DEFAULT 'training';
    END IF;
    
    -- Add stages_completed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'stages_completed') THEN
        ALTER TABLE projects ADD COLUMN stages_completed JSONB DEFAULT '[]';
    END IF;
    
    -- Add deliverables_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deliverables_count') THEN
        ALTER TABLE projects ADD COLUMN deliverables_count JSONB DEFAULT '{}';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_active') THEN
        ALTER TABLE projects ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view projects they created" ON projects
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample projects will be inserted after user authentication is set up
-- For now, we'll create the tables without sample data to avoid foreign key issues

-- Add foreign key constraints to existing tables (only if they don't exist)
DO $$
BEGIN
    -- Add foreign key constraint for project_deliverables if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_project_deliverables_project_id'
    ) THEN
        ALTER TABLE project_deliverables 
            ADD CONSTRAINT fk_project_deliverables_project_id 
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key constraint for project_training_sessions if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_project_training_sessions_project_id'
    ) THEN
        ALTER TABLE project_training_sessions 
            ADD CONSTRAINT fk_project_training_sessions_project_id 
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create a view for project progress summary
CREATE OR REPLACE VIEW project_progress_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.type as project_type,
    p.category,
    p.stages_completed,
    p.deliverables_count,
    pts.current_stage,
    pts.progress_data,
    pts.is_active as training_active,
    COUNT(pd.id) as total_deliverables,
    COUNT(CASE WHEN pd.status = 'completed' THEN 1 END) as completed_deliverables,
    p.created_at,
    pts.last_activity
FROM projects p
LEFT JOIN project_training_sessions pts ON p.id = pts.project_id AND pts.is_active = true
LEFT JOIN project_deliverables pd ON p.id = pd.project_id
GROUP BY p.id, p.name, p.type, p.category, p.stages_completed, p.deliverables_count, pts.current_stage, pts.progress_data, pts.is_active, p.created_at, pts.last_activity;

-- Grant access to the view
GRANT SELECT ON project_progress_summary TO authenticated;
