-- Scoring System Database Migrations
-- Add these tables to Supabase for the dynamic scoring system

-- 1. Scoring Configuration Table
-- Stores per-stage scoring thresholds and weights
CREATE TABLE IF NOT EXISTS scoring_config (
  stage_id TEXT PRIMARY KEY REFERENCES stage_packs(id) ON DELETE CASCADE,
  cosine_threshold NUMERIC DEFAULT 0.32,
  bm25_gate NUMERIC DEFAULT 0.0,            -- if 0, compute dynamic gate
  practice_weights JSONB NOT NULL DEFAULT '{"coverage":0.6,"independence":0.2,"technique":0.2}',
  assess_weights JSONB NOT NULL DEFAULT '{"coverage":0.7,"independence":0.1,"technique":0.2}',
  pass_threshold NUMERIC DEFAULT 0.65,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Question Card Embeddings Table
-- Stores OpenAI embeddings for each question card
CREATE TABLE IF NOT EXISTS question_card_embeddings (
  card_id TEXT PRIMARY KEY REFERENCES question_cards(id) ON DELETE CASCADE,
  embedding VECTOR(1536),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hint Events Table
-- Tracks user interactions with coaching hints
CREATE TABLE IF NOT EXISTS hint_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_meetings(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  card_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('shown', 'clicked', 'edited', 'asked')),
  payload JSONB DEFAULT '{}'::jsonb,
  ts TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_hint_events_session_id ON hint_events(session_id);
CREATE INDEX IF NOT EXISTS idx_hint_events_stage_id ON hint_events(stage_id);
CREATE INDEX IF NOT EXISTS idx_hint_events_card_id ON hint_events(card_id);
CREATE INDEX IF NOT EXISTS idx_hint_events_ts ON hint_events(ts);

-- Add RLS policies (if using Row Level Security)
-- Note: Adjust these based on your authentication setup

-- Scoring config - readable by authenticated users, writable by admins
ALTER TABLE scoring_config ENABLE ROW LEVEL SECURITY;

-- Hint events - users can read/write their own events
ALTER TABLE hint_events ENABLE ROW LEVEL SECURITY;

-- Question card embeddings - readable by authenticated users, writable by system
ALTER TABLE question_card_embeddings ENABLE ROW LEVEL SECURITY;

-- Insert default scoring config for existing stages (if any)
-- You can run this after creating the table to set up defaults
-- INSERT INTO scoring_config (stage_id) 
-- SELECT id FROM stage_packs 
-- ON CONFLICT (stage_id) DO NOTHING;

-- ========================================
-- FOUNDATION TABLES FOR SCORING SYSTEM
-- ========================================

-- Table for training stages (Problem Exploration, As-Is Analysis, etc.)
CREATE TABLE IF NOT EXISTS stage_packs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  must_cover TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for question cards within each stage
CREATE TABLE IF NOT EXISTS question_cards (
  id TEXT PRIMARY KEY,
  stage_id TEXT NOT NULL REFERENCES stage_packs(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  text TEXT NOT NULL,
  tone_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default stages (matching your current training stages)
INSERT INTO stage_packs (id, name, objective, must_cover) VALUES
  ('problem_exploration', 'Problem Exploration', 'Uncover pain points and root causes', ARRAY['pain_points', 'blockers', 'handoffs', 'constraints', 'customer_impact']),
  ('as_is', 'As-Is Process/Analysis', 'Understand current processes and systems', ARRAY['current_process', 'pain_points', 'inefficiencies', 'stakeholder_roles', 'system_gaps']),
  ('to_be', 'To-Be Process', 'Design future state solutions', ARRAY['future_state', 'improvements', 'requirements', 'success_criteria', 'implementation_plan']),
  ('solution_design', 'Solution Design', 'Define technical requirements and implementation', ARRAY['technical_requirements', 'architecture', 'data_models', 'integration_points', 'deployment_plan'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  objective = EXCLUDED.objective,
  must_cover = EXCLUDED.must_cover,
  updated_at = NOW();

-- Insert sample question cards for each stage
INSERT INTO question_cards (id, stage_id, skill, text, tone_tags) VALUES
  -- Problem Exploration cards
  ('pe_001', 'problem_exploration', 'open_questioning', 'What are the biggest pain points in your current process?', ARRAY['professional', 'curious']),
  ('pe_002', 'problem_exploration', 'follow_up', 'Can you tell me more about that specific issue?', ARRAY['empathetic', 'focused']),
  ('pe_003', 'problem_exploration', 'root_cause', 'What do you think is causing this problem?', ARRAY['analytical', 'collaborative']),
  ('pe_004', 'problem_exploration', 'impact_assessment', 'How does this affect your team and customers?', ARRAY['concerned', 'thorough']),
  ('pe_005', 'problem_exploration', 'constraint_exploration', 'What''s preventing you from fixing this already?', ARRAY['understanding', 'supportive']),
  
  -- As-Is Analysis cards
  ('as_001', 'as_is', 'process_mapping', 'Can you walk me through the current process step by step?', ARRAY['methodical', 'patient']),
  ('as_002', 'as_is', 'stakeholder_identification', 'Who else is involved in this process?', ARRAY['inclusive', 'thorough']),
  ('as_003', 'as_is', 'system_investigation', 'What systems do you currently use?', ARRAY['technical', 'curious']),
  ('as_004', 'as_is', 'gap_analysis', 'Where do things typically break down?', ARRAY['analytical', 'focused']),
  ('as_005', 'as_is', 'data_understanding', 'What data do you track or wish you could track?', ARRAY['data_driven', 'forward_thinking']),
  
  -- To-Be Process cards
  ('tb_001', 'to_be', 'future_vision', 'What would an ideal process look like to you?', ARRAY['visionary', 'collaborative']),
  ('tb_002', 'to_be', 'requirement_gathering', 'What specific improvements would make the biggest difference?', ARRAY['prioritizing', 'focused']),
  ('tb_003', 'to_be', 'success_definition', 'How would you measure success for this improvement?', ARRAY['measurable', 'clear']),
  ('tb_004', 'to_be', 'constraint_consideration', 'What limitations should we keep in mind?', ARRAY['realistic', 'practical']),
  ('tb_005', 'to_be', 'implementation_planning', 'What would be the best way to implement these changes?', ARRAY['strategic', 'practical']),
  
  -- Solution Design cards
  ('sd_001', 'solution_design', 'technical_requirements', 'What technical capabilities do you need?', ARRAY['technical', 'specific']),
  ('sd_002', 'solution_design', 'integration_needs', 'How should this integrate with your existing systems?', ARRAY['architectural', 'holistic']),
  ('sd_003', 'solution_design', 'data_requirements', 'What data will this solution need to handle?', ARRAY['data_focused', 'detailed']),
  ('sd_004', 'solution_design', 'user_experience', 'How should users interact with this solution?', ARRAY['user_centered', 'empathic']),
  ('sd_005', 'solution_design', 'deployment_strategy', 'How should we roll this out to minimize disruption?', ARRAY['strategic', 'careful'])
ON CONFLICT (id) DO UPDATE SET
  stage_id = EXCLUDED.stage_id,
  skill = EXCLUDED.skill,
  text = EXCLUDED.text,
  tone_tags = EXCLUDED.tone_tags,
  updated_at = NOW();

-- ========================================
-- SCORING SYSTEM TABLES
-- ========================================

-- Table for stage-specific scoring configuration
CREATE TABLE IF NOT EXISTS scoring_config (
  stage_id TEXT PRIMARY KEY REFERENCES stage_packs(id) ON DELETE CASCADE,
  cosine_threshold NUMERIC DEFAULT 0.32,
  bm25_gate NUMERIC DEFAULT 0.0,            -- if 0, compute dynamic gate
  practice_weights JSONB NOT NULL DEFAULT '{"coverage":0.6,"independence":0.2,"technique":0.2}',
  assess_weights JSONB NOT NULL DEFAULT '{"coverage":0.7,"independence":0.1,"technique":0.2}',
  pass_threshold NUMERIC DEFAULT 0.65,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for caching question card embeddings
CREATE TABLE IF NOT EXISTS question_card_embeddings (
  card_id TEXT PRIMARY KEY REFERENCES question_cards(id) ON DELETE CASCADE,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking hint events during meetings
CREATE TABLE IF NOT EXISTS hint_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_meetings(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  card_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('shown', 'clicked', 'edited', 'asked')),
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_cards_stage_id ON question_cards(stage_id);
CREATE INDEX IF NOT EXISTS idx_question_cards_skill ON question_cards(skill);
CREATE INDEX IF NOT EXISTS idx_hint_events_session_id ON hint_events(session_id);
CREATE INDEX IF NOT EXISTS idx_hint_events_stage_id ON hint_events(stage_id);
CREATE INDEX IF NOT EXISTS idx_hint_events_card_id ON hint_events(card_id);
CREATE INDEX IF NOT EXISTS idx_hint_events_created_at ON hint_events(created_at);

-- Add RLS policies (adjust as needed for your auth setup)
ALTER TABLE stage_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_card_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hint_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may need to adjust these based on your auth setup)
CREATE POLICY "Allow read access to stage_packs" ON stage_packs FOR SELECT USING (true);
CREATE POLICY "Allow read access to question_cards" ON question_cards FOR SELECT USING (true);
CREATE POLICY "Allow read access to scoring_config" ON scoring_config FOR SELECT USING (true);
CREATE POLICY "Allow read access to question_card_embeddings" ON question_card_embeddings FOR SELECT USING (true);
CREATE POLICY "Allow read access to hint_events" ON hint_events FOR SELECT USING (true);
CREATE POLICY "Allow insert access to hint_events" ON hint_events FOR INSERT WITH CHECK (true);

-- Insert default scoring config for existing stages
INSERT INTO scoring_config (stage_id)
SELECT id FROM stage_packs 
ON CONFLICT (stage_id) DO NOTHING;
