-- MVP Builder Schema Migration - FIXED VERSION
-- Handles existing policies and tables gracefully

-- 1. Epics Table (if not exists)
CREATE TABLE IF NOT EXISTS public.epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for epics (drop existing first)
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view epics in their projects" ON public.epics;
CREATE POLICY "Users can view epics in their projects" ON public.epics
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create epics in their projects" ON public.epics;
CREATE POLICY "Users can create epics in their projects" ON public.epics
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    ) AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update epics in their projects" ON public.epics;
CREATE POLICY "Users can update epics in their projects" ON public.epics
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete epics in their projects" ON public.epics;
CREATE POLICY "Users can delete epics in their projects" ON public.epics
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

-- 2. Create Stories Table (separate from agile_tickets for MVP Builder)
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  description TEXT,
  moscow TEXT CHECK (moscow IN ('Must', 'Should', 'Could', 'Won''t')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for stories (drop existing first)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view stories in their epics" ON public.stories;
CREATE POLICY "Users can view stories in their epics" ON public.stories
  FOR SELECT USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create stories in their epics" ON public.stories;
CREATE POLICY "Users can create stories in their epics" ON public.stories
  FOR INSERT WITH CHECK (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    ) AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update stories in their epics" ON public.stories;
CREATE POLICY "Users can update stories in their epics" ON public.stories
  FOR UPDATE USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete stories in their epics" ON public.stories;
CREATE POLICY "Users can delete stories in their epics" ON public.stories
  FOR DELETE USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

-- 3. Acceptance Criteria Table
CREATE TABLE IF NOT EXISTS public.acceptance_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for acceptance_criteria (drop existing first)
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view AC for their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can view AC for their stories" ON public.acceptance_criteria
  FOR SELECT USING (
    story_id IN (
      SELECT id FROM public.stories 
      WHERE epic_id IN (
        SELECT id FROM public.epics 
        WHERE project_id IN (
          SELECT id FROM public.projects 
          WHERE created_by = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create AC for their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can create AC for their stories" ON public.acceptance_criteria
  FOR INSERT WITH CHECK (
    story_id IN (
      SELECT id FROM public.stories 
      WHERE epic_id IN (
        SELECT id FROM public.epics 
        WHERE project_id IN (
          SELECT id FROM public.projects 
          WHERE created_by = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update AC for their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can update AC for their stories" ON public.acceptance_criteria
  FOR UPDATE USING (
    story_id IN (
      SELECT id FROM public.stories 
      WHERE epic_id IN (
        SELECT id FROM public.epics 
        WHERE project_id IN (
          SELECT id FROM public.projects 
          WHERE created_by = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete AC for their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can delete AC for their stories" ON public.acceptance_criteria
  FOR DELETE USING (
    story_id IN (
      SELECT id FROM public.stories 
      WHERE epic_id IN (
        SELECT id FROM public.epics 
        WHERE project_id IN (
          SELECT id FROM public.projects 
          WHERE created_by = auth.uid()
        )
      )
    )
  );

-- 4. MVP Flows Table
CREATE TABLE IF NOT EXISTS public.mvp_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE,
  story_ids UUID[] NOT NULL, -- ordered list of story IDs
  flow_order INT[] NOT NULL, -- matches story_ids order
  validated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for mvp_flows (drop existing first)
ALTER TABLE public.mvp_flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view MVP flows for their epics" ON public.mvp_flows;
CREATE POLICY "Users can view MVP flows for their epics" ON public.mvp_flows
  FOR SELECT USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create MVP flows for their epics" ON public.mvp_flows;
CREATE POLICY "Users can create MVP flows for their epics" ON public.mvp_flows
  FOR INSERT WITH CHECK (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    ) AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update MVP flows for their epics" ON public.mvp_flows;
CREATE POLICY "Users can update MVP flows for their epics" ON public.mvp_flows
  FOR UPDATE USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete MVP flows for their epics" ON public.mvp_flows;
CREATE POLICY "Users can delete MVP flows for their epics" ON public.mvp_flows
  FOR DELETE USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

-- 5. Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_epics_project_id ON public.epics(project_id);
CREATE INDEX IF NOT EXISTS idx_epics_created_by ON public.epics(created_by);
CREATE INDEX IF NOT EXISTS idx_stories_epic_id ON public.stories(epic_id);
CREATE INDEX IF NOT EXISTS idx_stories_moscow ON public.stories(moscow);
CREATE INDEX IF NOT EXISTS idx_acceptance_criteria_story_id ON public.acceptance_criteria(story_id);
CREATE INDEX IF NOT EXISTS idx_mvp_flows_epic_id ON public.mvp_flows(epic_id);
CREATE INDEX IF NOT EXISTS idx_mvp_flows_created_by ON public.mvp_flows(created_by);

-- 6. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Add updated_at triggers (drop existing first)
DROP TRIGGER IF EXISTS update_epics_updated_at ON public.epics;
CREATE TRIGGER update_epics_updated_at 
  BEFORE UPDATE ON public.epics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON public.stories;
CREATE TRIGGER update_stories_updated_at 
  BEFORE UPDATE ON public.stories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_acceptance_criteria_updated_at ON public.acceptance_criteria;
CREATE TRIGGER update_acceptance_criteria_updated_at 
  BEFORE UPDATE ON public.acceptance_criteria 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mvp_flows_updated_at ON public.mvp_flows;
CREATE TRIGGER update_mvp_flows_updated_at 
  BEFORE UPDATE ON public.mvp_flows 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Create helper functions for MVP Builder (replace existing)
CREATE OR REPLACE FUNCTION get_epic_stories(epic_uuid UUID)
RETURNS TABLE (
  id UUID,
  summary TEXT,
  description TEXT,
  moscow TEXT,
  acceptance_criteria JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.summary,
    s.description,
    s.moscow,
    COALESCE(
      (
        SELECT json_agg(ac.description)
        FROM public.acceptance_criteria ac
        WHERE ac.story_id = s.id
      ),
      '[]'::json
    ) as acceptance_criteria
  FROM public.stories s
  WHERE s.epic_id = epic_uuid
  ORDER BY s.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to save MVP flow (replace existing)
CREATE OR REPLACE FUNCTION save_mvp_flow(
  epic_uuid UUID,
  story_uuids UUID[],
  flow_order_array INT[],
  user_uuid UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
  flow_id UUID;
BEGIN
  -- Insert or update MVP flow
  INSERT INTO public.mvp_flows (epic_id, story_ids, flow_order, created_by)
  VALUES (epic_uuid, story_uuids, flow_order_array, user_uuid)
  ON CONFLICT (epic_id) 
  DO UPDATE SET 
    story_ids = EXCLUDED.story_ids,
    flow_order = EXCLUDED.flow_order,
    updated_at = NOW()
  RETURNING id INTO flow_id;
  
  RETURN flow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.epics TO authenticated;
GRANT ALL ON public.stories TO authenticated;
GRANT ALL ON public.acceptance_criteria TO authenticated;
GRANT ALL ON public.mvp_flows TO authenticated;
GRANT EXECUTE ON FUNCTION get_epic_stories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_mvp_flow(UUID, UUID[], INT[], UUID) TO authenticated;

