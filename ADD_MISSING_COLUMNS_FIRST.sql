-- ======================================
-- ADD MISSING COLUMNS FIRST
-- Add project_id and other missing columns to existing tables
-- ======================================

-- 1. Add missing columns to epics table
ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS project_id UUID;

ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add missing columns to stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS project_id UUID;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Create MVP flows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mvp_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  in_mvp BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on all tables
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_flows ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies (drop existing first)
DROP POLICY IF EXISTS "Users can view epics in their projects" ON public.epics;
DROP POLICY IF EXISTS "Users can create epics in their projects" ON public.epics;
DROP POLICY IF EXISTS "Users can view stories in their projects" ON public.stories;
DROP POLICY IF EXISTS "Users can create stories in their projects" ON public.stories;
DROP POLICY IF EXISTS "Users can view acceptance criteria in their stories" ON public.acceptance_criteria;
DROP POLICY IF EXISTS "Users can create acceptance criteria in their stories" ON public.acceptance_criteria;
DROP POLICY IF EXISTS "Users can view mvp flows in their projects" ON public.mvp_flows;
DROP POLICY IF EXISTS "Users can create mvp flows in their projects" ON public.mvp_flows;

-- Epics RLS - Allow all for training mode
CREATE POLICY "Users can view epics in their projects" ON public.epics
  FOR SELECT USING (true);

CREATE POLICY "Users can create epics in their projects" ON public.epics
  FOR INSERT WITH CHECK (true);

-- Stories RLS - Allow all for training mode
CREATE POLICY "Users can view stories in their projects" ON public.stories
  FOR SELECT USING (true);

CREATE POLICY "Users can create stories in their projects" ON public.stories
  FOR INSERT WITH CHECK (true);

-- Acceptance Criteria RLS - Allow all for training mode
CREATE POLICY "Users can view acceptance criteria in their stories" ON public.acceptance_criteria
  FOR SELECT USING (true);

CREATE POLICY "Users can create acceptance criteria in their stories" ON public.acceptance_criteria
  FOR INSERT WITH CHECK (true);

-- MVP Flows RLS - Allow all for training mode
CREATE POLICY "Users can view mvp flows in their projects" ON public.mvp_flows
  FOR SELECT USING (true);

CREATE POLICY "Users can create mvp flows in their projects" ON public.mvp_flows
  FOR INSERT WITH CHECK (true);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_epics_project_id ON public.epics(project_id);
CREATE INDEX IF NOT EXISTS idx_stories_epic_id ON public.stories(epic_id);
CREATE INDEX IF NOT EXISTS idx_stories_project_id ON public.stories(project_id);
CREATE INDEX IF NOT EXISTS idx_acceptance_criteria_story_id ON public.acceptance_criteria(story_id);
CREATE INDEX IF NOT EXISTS idx_mvp_flows_project_id ON public.mvp_flows(project_id);
CREATE INDEX IF NOT EXISTS idx_mvp_flows_story_id ON public.mvp_flows(story_id);

-- 7. Verification
SELECT '=== COLUMNS ADDED SUCCESSFULLY ===' as status;
SELECT 'Epics table columns:' as info, COUNT(*) as count FROM information_schema.columns WHERE table_name = 'epics' AND table_schema = 'public';
SELECT 'Stories table columns:' as info, COUNT(*) as count FROM information_schema.columns WHERE table_name = 'stories' AND table_schema = 'public';
SELECT 'MVP flows table created:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_name = 'mvp_flows' AND table_schema = 'public';














