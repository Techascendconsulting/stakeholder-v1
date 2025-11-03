-- Migration for coaching metadata (optional - for future use)
-- This allows trainers to edit coaching content without code changes

-- Create coaching metadata table
CREATE TABLE IF NOT EXISTS coaching_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cover_key TEXT NOT NULL UNIQUE,
  stage_id TEXT NOT NULL,
  coaching_tip TEXT NOT NULL,
  sample_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_coaching_metadata_cover_key ON coaching_metadata(cover_key);
CREATE INDEX IF NOT EXISTS idx_coaching_metadata_stage_id ON coaching_metadata(stage_id);

-- Insert coaching metadata for all stages
INSERT INTO coaching_metadata (cover_key, stage_id, coaching_tip, sample_questions) VALUES
-- Problem Exploration
('pain_points', 'problem_exploration', 'Understanding pain points helps identify the root causes of issues. This information is crucial for designing effective solutions that address real problems rather than symptoms.', 
 '["What are the biggest frustrations your team faces daily?", "What processes feel broken or inefficient?", "What complaints do you hear most often from stakeholders?"]'),

('blockers', 'problem_exploration', 'Identifying blockers reveals what''s preventing progress. This helps prioritize improvements and understand dependencies that could impact project success.',
 '["What typically slows down your work?", "What obstacles prevent you from meeting deadlines?", "What dependencies cause the most delays?"]'),

('handoffs', 'problem_exploration', 'Handoffs between teams are common failure points. Understanding these gaps helps design better integration and communication processes.',
 '["Where do things fall apart between teams?", "What information gets lost during handoffs?", "How do you ensure smooth transitions between departments?"]'),

('constraints', 'problem_exploration', 'Constraints (technical, budget, time, people) significantly impact what solutions are feasible. Understanding these early prevents unrealistic expectations.',
 '["What limitations should we keep in mind?", "What resources or time constraints affect this?", "What technical or business constraints exist?"]'),

('customer_impact', 'problem_exploration', 'Understanding how problems affect customers helps prioritize improvements and ensures solutions deliver real business value.',
 '["How do these issues affect your customers?", "What''s the business impact of these problems?", "How do customers experience these challenges?"]'),

-- As-Is Process
('current_process', 'as_is', 'Mapping current processes reveals inefficiencies and helps stakeholders see the full picture. This baseline is essential for designing improvements.',
 '["Can you walk me through your current process step by step?", "What does a typical day look like for your team?", "How do you currently handle this workflow?"]'),

('inefficiencies', 'as_is', 'Identifying inefficiencies helps quantify improvement opportunities and build a business case for change.',
 '["Where do you spend the most time unnecessarily?", "What tasks feel repetitive or manual?", "What processes take longer than they should?"]'),

('stakeholder_roles', 'as_is', 'Understanding who does what helps identify skill gaps, training needs, and opportunities for role optimization.',
 '["Who is responsible for each part of the process?", "What are the main responsibilities of each team member?", "How do roles and responsibilities overlap?"]'),

('system_gaps', 'as_is', 'System gaps reveal where technology isn''t supporting the business needs. This helps prioritize technical improvements.',
 '["What systems don''t work well together?", "Where do you need better tools or automation?", "What manual work could be automated?"]'),

-- To-Be Process
('future_state', 'to_be', 'Envisioning the future state helps stakeholders think beyond current limitations and identify what success looks like.',
 '["What would an ideal process look like?", "How would you like things to work in the future?", "What would success look like for this project?"]'),

('improvements', 'to_be', 'Identifying specific improvements helps prioritize changes and ensures the solution addresses real needs.',
 '["What specific changes would make the biggest difference?", "What improvements would have the most impact?", "What would you change if you could start over?"]'),

('requirements', 'to_be', 'Clear requirements ensure the solution meets business needs and helps prevent scope creep during implementation.',
 '["What must the solution do to be successful?", "What are the non-negotiable requirements?", "What features are essential vs. nice-to-have?"]'),

('success_criteria', 'to_be', 'Defining success criteria helps measure project success and ensures everyone has the same expectations.',
 '["How will we know this project is successful?", "What metrics would indicate improvement?", "What outcomes are you looking for?"]'),

('implementation_plan', 'to_be', 'Understanding implementation considerations helps create realistic timelines and identify potential risks.',
 '["What would be the best way to implement this?", "What phases or milestones should we consider?", "What resources would be needed for implementation?"]'),

-- Solution Design
('technical_requirements', 'solution_design', 'Technical requirements ensure the solution is feasible and can be properly implemented by the development team.',
 '["What technical capabilities are needed?", "What systems need to integrate with this solution?", "What are the performance requirements?"]'),

('architecture', 'solution_design', 'Understanding architectural needs helps design scalable, maintainable solutions that fit the existing technology landscape.',
 '["How should this solution fit into your current architecture?", "What architectural patterns should we follow?", "How will this scale as your business grows?"]'),

('data_models', 'solution_design', 'Data modeling ensures the solution can handle the required information and relationships effectively.',
 '["What data needs to be captured and stored?", "How should data flow between systems?", "What data relationships are important?"]'),

('integration_points', 'solution_design', 'Integration points are critical for ensuring the solution works with existing systems and processes.',
 '["What systems need to connect to this solution?", "How should data flow between different platforms?", "What APIs or interfaces are needed?"]'),

('deployment_plan', 'solution_design', 'Deployment planning ensures smooth rollout and minimizes disruption to ongoing operations.',
 '["How should we roll out this solution?", "What deployment strategy would work best?", "How can we minimize risk during implementation?"]')

ON CONFLICT (cover_key) DO UPDATE SET
  coaching_tip = EXCLUDED.coaching_tip,
  sample_questions = EXCLUDED.sample_questions,
  updated_at = NOW();

-- Add RLS policies
ALTER TABLE coaching_metadata ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON coaching_metadata
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users to modify coaching content
CREATE POLICY "Allow admin users to modify coaching" ON coaching_metadata
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to get coaching metadata by stage
CREATE OR REPLACE FUNCTION get_coaching_metadata_by_stage(stage_id_param TEXT)
RETURNS TABLE (
  cover_key TEXT,
  coaching_tip TEXT,
  sample_questions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.cover_key,
    cm.coaching_tip,
    cm.sample_questions
  FROM coaching_metadata cm
  WHERE cm.stage_id = stage_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_coaching_metadata_by_stage(TEXT) TO authenticated;


























