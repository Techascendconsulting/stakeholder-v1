-- Content Management Database Setup
-- This creates the tables needed for the Content Management system

-- 1. Learning Modules Table
CREATE TABLE IF NOT EXISTS learning_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  estimated_hours INTEGER DEFAULT 0,
  topics TEXT[] DEFAULT '{}',
  learning_outcomes TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  archived BOOLEAN DEFAULT FALSE
);

-- 2. Practice Scenarios Table
CREATE TABLE IF NOT EXISTS practice_scenarios (
  id TEXT PRIMARY KEY,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objective TEXT NOT NULL,
  success_criteria TEXT[] DEFAULT '{}',
  must_cover_areas JSONB DEFAULT '{}',
  example_questions TEXT[] DEFAULT '{}',
  techniques TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  archived BOOLEAN DEFAULT FALSE
);

-- 3. Assessment Questions Table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('case-study', 'assignment', 'quiz', 'essay')),
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time TEXT,
  questions JSONB DEFAULT '{}',
  correct_answers JSONB DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  archived BOOLEAN DEFAULT FALSE
);

-- 4. Epic Stories Table (for MVP Builder)
CREATE TABLE IF NOT EXISTS epic_stories (
  id TEXT PRIMARY KEY,
  epic_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  summary TEXT,
  acceptance_criteria TEXT[] DEFAULT '{}',
  moscow_priority TEXT CHECK (moscow_priority IN ('Must', 'Should', 'Could', 'Won\'t')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  archived BOOLEAN DEFAULT FALSE
);

-- 5. Content Categories Table
CREATE TABLE IF NOT EXISTS content_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id TEXT REFERENCES content_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO content_categories (id, name, description, sort_order) VALUES
  ('modules', 'Learning Modules', 'Educational content and lessons', 1),
  ('scenarios', 'Practice Scenarios', 'Training scenarios and exercises', 2),
  ('assessments', 'Assessments', 'Tests, quizzes, and evaluations', 3),
  ('epics', 'Epic Stories', 'MVP Builder epics and user stories', 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- Add RLS policies
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE epic_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_modules
CREATE POLICY "Anyone can view active learning modules" ON learning_modules
  FOR SELECT USING (status = 'active' AND archived = FALSE);

CREATE POLICY "Admins can manage learning modules" ON learning_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON ar.id = uar.role_id
      WHERE uar.user_id = auth.uid() 
        AND uar.is_active = TRUE
        AND ar.name = 'admin'
    )
  );

-- RLS Policies for practice_scenarios
CREATE POLICY "Anyone can view active practice scenarios" ON practice_scenarios
  FOR SELECT USING (status = 'active' AND archived = FALSE);

CREATE POLICY "Admins can manage practice scenarios" ON practice_scenarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON ar.id = uar.role_id
      WHERE uar.user_id = auth.uid() 
        AND uar.is_active = TRUE
        AND ar.name = 'admin'
    )
  );

-- RLS Policies for assessment_questions
CREATE POLICY "Anyone can view active assessment questions" ON assessment_questions
  FOR SELECT USING (status = 'active' AND archived = FALSE);

CREATE POLICY "Admins can manage assessment questions" ON assessment_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON ar.id = uar.role_id
      WHERE uar.user_id = auth.uid() 
        AND uar.is_active = TRUE
        AND ar.name = 'admin'
    )
  );

-- RLS Policies for epic_stories
CREATE POLICY "Anyone can view active epic stories" ON epic_stories
  FOR SELECT USING (status = 'active' AND archived = FALSE);

CREATE POLICY "Admins can manage epic stories" ON epic_stories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON ar.id = uar.role_id
      WHERE uar.user_id = auth.uid() 
        AND uar.is_active = TRUE
        AND ar.name = 'admin'
    )
  );

-- RLS Policies for content_categories
CREATE POLICY "Anyone can view content categories" ON content_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage content categories" ON content_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_admin_roles uar
      JOIN admin_roles ar ON ar.id = uar.role_id
      WHERE uar.user_id = auth.uid() 
        AND uar.is_active = TRUE
        AND ar.name = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_modules_status ON learning_modules(status);
CREATE INDEX IF NOT EXISTS idx_learning_modules_difficulty ON learning_modules(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_modules_created_by ON learning_modules(created_by);

CREATE INDEX IF NOT EXISTS idx_practice_scenarios_stage_id ON practice_scenarios(stage_id);
CREATE INDEX IF NOT EXISTS idx_practice_scenarios_status ON practice_scenarios(status);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_type ON assessment_questions(type);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_difficulty ON assessment_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_status ON assessment_questions(status);

CREATE INDEX IF NOT EXISTS idx_epic_stories_epic_id ON epic_stories(epic_id);
CREATE INDEX IF NOT EXISTS idx_epic_stories_status ON epic_stories(status);

-- Insert some sample content for testing
INSERT INTO learning_modules (id, title, description, difficulty, estimated_hours, topics, learning_outcomes) VALUES
  ('ba-fundamentals', 'Business Analysis Fundamentals', 'Master core business analysis concepts and practices', 'Beginner', 8, 
   ARRAY['Business Analysis Definition', 'Requirements Elicitation Techniques', 'Organizational Structure Analysis'],
   ARRAY['Define business analysis and its role in organizations', 'Identify key stakeholders and their needs', 'Apply basic requirements elicitation techniques']),
  
  ('technical-analysis', 'Technical Analysis', 'Develop technical analysis competencies', 'Intermediate', 12,
   ARRAY['System Requirements', 'Integration Analysis', 'Technical Feasibility'],
   ARRAY['Analyze technical requirements', 'Design system integrations', 'Assess technical feasibility']),
   
  ('stakeholder-management', 'Stakeholder Management', 'Master stakeholder engagement and communication', 'Advanced', 10,
   ARRAY['Stakeholder Identification', 'Communication Planning', 'Conflict Resolution'],
   ARRAY['Identify all project stakeholders', 'Develop communication strategies', 'Resolve stakeholder conflicts'])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  estimated_hours = EXCLUDED.estimated_hours,
  topics = EXCLUDED.topics,
  learning_outcomes = EXCLUDED.learning_outcomes;

INSERT INTO practice_scenarios (id, stage_id, title, description, objective, success_criteria, must_cover_areas) VALUES
  ('healthcare-requirements', 'problem_exploration', 'Healthcare System Requirements', 'Practice elicitation with healthcare stakeholders', 
   'Understand current healthcare process issues',
   ARRAY['Identify pain points in current process', 'Understand stakeholder frustrations', 'Map current workflow'],
   '{"pain_points": "What''s frustrating or inefficient?", "blockers": "What slows things down?", "handoffs": "Where do things fall apart?"}'),
   
  ('retail-inventory', 'as_is', 'Retail Inventory Management', 'Analyze retail inventory process problems',
   'Map current inventory management process',
   ARRAY['Document current inventory flow', 'Identify inefficiencies', 'Understand stakeholder roles'],
   '{"current_process": "How does inventory flow work?", "inefficiencies": "Where are the bottlenecks?", "stakeholder_roles": "Who is involved?"}')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  objective = EXCLUDED.objective,
  success_criteria = EXCLUDED.success_criteria,
  must_cover_areas = EXCLUDED.must_cover_areas;

INSERT INTO assessment_questions (id, type, topic, title, description, difficulty, estimated_time, questions) VALUES
  ('cs-techcorp', 'case-study', 'Business Analysis Definition', 'TechCorp Process Improvement', 
   'Analyze a software company''s development process issues', 'intermediate', '30-45 minutes',
   '{"questions": ["What are the main process issues?", "How would you improve the workflow?", "What stakeholders are affected?"]}'),
   
  ('as-ba-concepts', 'assignment', 'Business Analysis Core Concepts', 'Core Concepts Application',
   'Apply BA core concepts to analyze scenarios', 'beginner', '20-30 minutes',
   '{"questions": ["What is the difference between a business need and requirement?", "How would you conduct current state analysis?"]}')
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  topic = EXCLUDED.topic,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  estimated_time = EXCLUDED.estimated_time,
  questions = EXCLUDED.questions;





