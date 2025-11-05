-- ======================================
-- Create MVP Flows Table
-- ======================================
create table if not exists mvp_flows (
  id uuid primary key default gen_random_uuid(),
  project_id uuid, -- null for training mode, set for real projects
  epic_id uuid references epics(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  priority text check (priority in ('Must', 'Should', 'Could', 'Won''t')),
  in_mvp boolean default false,
  created_by uuid,
  created_at timestamp default now()
);

-- ======================================
-- Indexes for performance
-- ======================================
create index if not exists idx_mvp_flows_project on mvp_flows(project_id);
create index if not exists idx_mvp_flows_epic on mvp_flows(epic_id);
create index if not exists idx_mvp_flows_story on mvp_flows(story_id);

-- ======================================
-- RLS Policies for MVP Flows
-- ======================================
ALTER TABLE public.mvp_flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view mvp flows in their projects" ON public.mvp_flows;
CREATE POLICY "Users can view mvp flows in their projects" ON public.mvp_flows
  FOR SELECT USING (
    project_id IS NULL OR  -- Allow training flows (project_id = null)
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create mvp flows in their projects" ON public.mvp_flows;
CREATE POLICY "Users can create mvp flows in their projects" ON public.mvp_flows
  FOR INSERT WITH CHECK (
    (project_id IS NULL OR  -- Allow training flows
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )) AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update mvp flows in their projects" ON public.mvp_flows;
CREATE POLICY "Users can update mvp flows in their projects" ON public.mvp_flows
  FOR UPDATE USING (
    project_id IS NULL OR  -- Allow training flows
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete mvp flows in their projects" ON public.mvp_flows;
CREATE POLICY "Users can delete mvp flows in their projects" ON public.mvp_flows
  FOR DELETE USING (
    project_id IS NULL OR  -- Allow training flows
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );















