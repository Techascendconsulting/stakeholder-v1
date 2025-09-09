-- Migration: Project Metadata - Ultra Simple Version (FIXED)
-- Description: Safely adds missing columns to existing projects table

-- Add type column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'training';

-- Add description column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;

-- Add category column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'training';

-- Add stages_completed column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stages_completed JSONB DEFAULT '[]';

-- Add deliverables_count column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deliverables_count JSONB DEFAULT '{}';

-- Add is_active column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add created_by column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add updated_at column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- Enable RLS if not already enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can view projects they created') THEN
        CREATE POLICY "Users can view projects they created" ON projects
            FOR SELECT USING (auth.uid() = created_by);
    END IF;
END $$;

-- Create simple progress summary view
DROP VIEW IF EXISTS project_progress_summary;
CREATE VIEW project_progress_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COALESCE(p.type, 'training') as project_type,
    COALESCE(p.category, 'training') as category,
    COALESCE(p.stages_completed, '[]') as stages_completed,
    COALESCE(p.deliverables_count, '{}') as deliverables_count,
    'problem_exploration' as current_stage,
    '{}' as progress_data,
    false as training_active,
    0 as total_deliverables,
    0 as completed_deliverables,
    p.created_at,
    p.created_at as last_activity
FROM projects p;

-- Grant access to the view
GRANT SELECT ON project_progress_summary TO authenticated;



