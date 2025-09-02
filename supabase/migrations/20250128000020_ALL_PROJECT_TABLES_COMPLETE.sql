-- =====================================================
-- COMPLETE PROJECT DELIVERABLES MIGRATION
-- Run this single file to create all 3 tables
-- =====================================================

-- =====================================================
-- MIGRATION 1: Project Deliverables Table
-- =====================================================

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

-- Create RLS policies (handle existing policies by dropping and recreating)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own deliverables" ON project_deliverables;
    DROP POLICY IF EXISTS "Users can insert their own deliverables" ON project_deliverables;
    DROP POLICY IF EXISTS "Users can update their own deliverables" ON project_deliverables;
    DROP POLICY IF EXISTS "Users can delete their own deliverables" ON project_deliverables;
    
    -- Create new policies
    CREATE POLICY "Users can view their own deliverables" ON project_deliverables
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own deliverables" ON project_deliverables
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own deliverables" ON project_deliverables
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own deliverables" ON project_deliverables
        FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Create updated_at trigger (handle existing triggers)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_project_deliverables_updated_at ON project_deliverables;
    
    -- Create new trigger
    CREATE TRIGGER update_project_deliverables_updated_at 
        BEFORE UPDATE ON project_deliverables 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- =====================================================
-- MIGRATION 2: Project Training Sessions Table
-- =====================================================

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

-- Create RLS policies (handle existing policies by dropping and recreating)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own training sessions" ON project_training_sessions;
    DROP POLICY IF EXISTS "Users can insert their own training sessions" ON project_training_sessions;
    DROP POLICY IF EXISTS "Users can update their own training sessions" ON project_training_sessions;
    DROP POLICY IF EXISTS "Users can delete their own training sessions" ON project_training_sessions;
    
    -- Create new policies
    CREATE POLICY "Users can view their own training sessions" ON project_training_sessions
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own training sessions" ON project_training_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own training sessions" ON project_training_sessions
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own training sessions" ON project_training_sessions
        FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Create updated_at trigger (handle existing triggers)
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_project_training_sessions_updated_at ON project_training_sessions;
    
    -- Create new trigger
    CREATE TRIGGER update_project_training_sessions_updated_at 
        BEFORE UPDATE ON project_training_sessions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- =====================================================
-- MIGRATION 3: Update Projects Table & Create View
-- =====================================================

-- Add missing columns to existing projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'training';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'training';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stages_completed JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deliverables_count JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- Enable RLS if not already enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can view projects they created') THEN
        CREATE POLICY "Users can view projects they created" ON projects
            FOR SELECT USING (auth.uid() = created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can insert their own projects') THEN
        CREATE POLICY "Users can insert their own projects" ON projects
            FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can update their own projects') THEN
        CREATE POLICY "Users can update their own projects" ON projects
            FOR UPDATE USING (auth.uid() = created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can delete their own projects') THEN
        CREATE POLICY "Users can delete their own projects" ON projects
            FOR DELETE USING (auth.uid() = created_by);
    END IF;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at 
            BEFORE UPDATE ON projects 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add foreign key constraints
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

-- Create progress summary view
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
    COALESCE(p.created_at, NOW()) as created_at,
    COALESCE(pts.last_activity, COALESCE(p.created_at, NOW())) as last_activity
FROM projects p
LEFT JOIN project_training_sessions pts ON p.id = pts.project_id AND pts.is_active = true
LEFT JOIN project_deliverables pd ON p.id = pd.project_id
GROUP BY p.id, p.name, p.type, p.category, p.stages_completed, p.deliverables_count, pts.current_stage, pts.progress_data, pts.is_active, p.created_at, pts.last_activity;

-- Grant access to the view
GRANT SELECT ON project_progress_summary TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'All project tables created successfully!';
    RAISE NOTICE 'Tables created: project_deliverables, project_training_sessions';
    RAISE NOTICE 'Projects table updated with new columns';
    RAISE NOTICE 'Progress summary view created';
    RAISE NOTICE 'All RLS policies and indexes configured';
END $$;
