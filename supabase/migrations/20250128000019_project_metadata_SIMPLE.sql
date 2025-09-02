-- Migration: Project Metadata - Simple Version (FIXED)
-- Description: Safely adds missing columns to existing projects table and creates progress view

-- First, let's see what columns actually exist in the projects table
-- This will help us understand the current structure
DO $$
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE 'Current projects table columns:';
    FOR col IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % - Type: %', col.column_name, col.data_type;
    END LOOP;
END $$;

-- Add only the essential columns that are missing
DO $$ 
BEGIN
    -- Add type column if it doesn't exist (this was causing the error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'type') THEN
        ALTER TABLE projects ADD COLUMN type VARCHAR(100) DEFAULT 'training';
        RAISE NOTICE 'Added type column to projects table';
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'description') THEN
        ALTER TABLE projects ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to projects table';
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category') THEN
        ALTER TABLE projects ADD COLUMN category VARCHAR(50) DEFAULT 'training';
        RAISE NOTICE 'Added category column to projects table';
    END IF;
    
    -- Add stages_completed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'stages_completed') THEN
        ALTER TABLE projects ADD COLUMN stages_completed JSONB DEFAULT '[]';
        RAISE NOTICE 'Added stages_completed column to projects table';
    END IF;
    
    -- Add deliverables_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deliverables_count') THEN
        ALTER TABLE projects ADD COLUMN deliverables_count JSONB DEFAULT '{}';
        RAISE NOTICE 'Added deliverables_count column to projects table';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_active') THEN
        ALTER TABLE projects ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to projects table';
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'created_by') THEN
        ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added created_by column to projects table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to projects table';
    END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'idx_projects_type') THEN
        CREATE INDEX idx_projects_type ON projects(type);
        RAISE NOTICE 'Created index on projects.type';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'idx_projects_category') THEN
        CREATE INDEX idx_projects_category ON projects(category);
        RAISE NOTICE 'Created index on projects.category';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'projects' AND indexname = 'idx_projects_is_active') THEN
        CREATE INDEX idx_projects_is_active ON projects(is_active);
        RAISE NOTICE 'Created index on projects.is_active';
    END IF;
END $$;

-- Enable Row Level Security (RLS) if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'projects' AND rowsecurity = true) THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on projects table';
    END IF;
END $$;

-- Create RLS policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can view projects they created') THEN
        CREATE POLICY "Users can view projects they created" ON projects
            FOR SELECT USING (auth.uid() = created_by);
        RAISE NOTICE 'Created RLS policy for SELECT on projects';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can insert their own projects') THEN
        CREATE POLICY "Users can insert their own projects" ON projects
            FOR INSERT WITH CHECK (auth.uid() = created_by);
        RAISE NOTICE 'Created RLS policy for INSERT on projects';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can update their own projects') THEN
        CREATE POLICY "Users can update their own projects" ON projects
            FOR UPDATE USING (auth.uid() = created_by);
        RAISE NOTICE 'Created RLS policy for UPDATE on projects';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can delete their own projects') THEN
        CREATE POLICY "Users can delete their own projects" ON projects
            FOR DELETE USING (auth.uid() = created_by);
        RAISE NOTICE 'Created RLS policy for DELETE on projects';
    END IF;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at 
            BEFORE UPDATE ON projects 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created updated_at trigger on projects table';
    END IF;
END $$;

-- Create a simple progress summary view
DROP VIEW IF EXISTS project_progress_summary;
CREATE VIEW project_progress_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COALESCE(p.type, 'training') as project_type,
    COALESCE(p.category, 'training') as category,
    COALESCE(p.stages_completed, '[]') as stages_completed,
    COALESCE(p.deliverables_count, '{}') as deliverables_count,
    COALESCE(pts.current_stage, 'problem_exploration') as current_stage,
    COALESCE(pts.progress_data, '{}') as progress_data,
    COALESCE(pts.is_active, false) as training_active,
    COUNT(pd.id) as total_deliverables,
    COUNT(CASE WHEN pd.status = 'completed' THEN 1 END) as completed_deliverables,
    p.created_at,
    COALESCE(pts.last_activity, p.created_at) as last_activity
FROM projects p
LEFT JOIN project_training_sessions pts ON p.id = pts.project_id AND pts.is_active = true
LEFT JOIN project_deliverables pd ON p.id = pd.project_id
GROUP BY p.id, p.name, p.type, p.category, p.stages_completed, p.deliverables_count, pts.current_stage, pts.progress_data, pts.is_active, p.created_at, pts.last_activity;

-- Grant access to the view
GRANT SELECT ON project_progress_summary TO authenticated;

RAISE NOTICE 'Project metadata migration completed successfully!';
