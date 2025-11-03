-- ======================================
-- COMPLETE PROJECT SETUP
-- Creates projects table and all MVP Builder tables with proper relationships
-- ======================================

-- 1. Create projects table first
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create MVP Builder tables with proper foreign keys
CREATE TABLE IF NOT EXISTS public.epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  description TEXT,
  moscow TEXT CHECK (moscow IN ('Must', 'Should', 'Could', 'Won''t')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.acceptance_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mvp_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  in_mvp BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_flows ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Projects RLS
DROP POLICY IF EXISTS "Users can view their projects" ON public.projects;
CREATE POLICY "Users can view their projects" ON public.projects
  FOR SELECT USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Epics RLS
DROP POLICY IF EXISTS "Users can view epics in their projects" ON public.epics;
CREATE POLICY "Users can view epics in their projects" ON public.epics
  FOR SELECT USING (
    project_id IS NULL OR  -- Allow training epics
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create epics in their projects" ON public.epics;
CREATE POLICY "Users can create epics in their projects" ON public.epics
  FOR INSERT WITH CHECK (
    (project_id IS NULL OR  -- Allow training epics
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )) AND created_by = auth.uid()
  );

-- Stories RLS
DROP POLICY IF EXISTS "Users can view stories in their projects" ON public.stories;
CREATE POLICY "Users can view stories in their projects" ON public.stories
  FOR SELECT USING (
    project_id IS NULL OR  -- Allow training stories
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create stories in their projects" ON public.stories;
CREATE POLICY "Users can create stories in their projects" ON public.stories
  FOR INSERT WITH CHECK (
    (project_id IS NULL OR  -- Allow training stories
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )) AND created_by = auth.uid()
  );

-- Acceptance Criteria RLS
DROP POLICY IF EXISTS "Users can view acceptance criteria in their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can view acceptance criteria in their stories" ON public.acceptance_criteria
  FOR SELECT USING (
    story_id IN (
      SELECT id FROM public.stories 
      WHERE project_id IS NULL OR  -- Allow training stories
      project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create acceptance criteria in their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can create acceptance criteria in their stories" ON public.acceptance_criteria
  FOR INSERT WITH CHECK (
    story_id IN (
      SELECT id FROM public.stories 
      WHERE project_id IS NULL OR  -- Allow training stories
      project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

-- MVP Flows RLS
DROP POLICY IF EXISTS "Users can view mvp flows in their projects" ON public.mvp_flows;
CREATE POLICY "Users can view mvp flows in their projects" ON public.mvp_flows
  FOR SELECT USING (
    project_id IS NULL OR  -- Allow training flows
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

-- 5. Insert Training Seed Data
-- EPIC 1: Tenant Repair Management
INSERT INTO public.epics (id, project_id, title, description, created_by)
VALUES ('11111111-1111-1111-1111-111111111111', null, 'Tenant Repair Management', 'As a tenant, I want to raise and manage repair requests so that issues in my property are resolved quickly.', null)
ON CONFLICT (id) DO NOTHING;

-- Stories for Epic 1
INSERT INTO public.stories (id, epic_id, project_id, summary, description, moscow, created_by)
VALUES 
  ('11111111-aaaa-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 
   'Submit a Repair Request',
   'As a tenant, I want to submit a repair request online so that I do not need to phone customer service.',
   'Must', null),
  ('11111111-bbbb-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 
   'Choose a Repair Appointment Slot',
   'As a tenant, I want to select a preferred appointment date and time so that an engineer can visit when I am available.',
   'Must', null),
  ('11111111-cccc-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 
   'Track Repair Status',
   'As a tenant, I want to see the status of my repair request so that I know whether it has been scheduled, in progress, or completed.',
   'Should', null)
ON CONFLICT (id) DO NOTHING;

-- AC for Epic 1 Stories
INSERT INTO public.acceptance_criteria (story_id, description)
VALUES 
  ('11111111-aaaa-1111-1111-111111111111', 'Repair request form must include issue description and property address.'),
  ('11111111-aaaa-1111-1111-111111111111', 'Tenant receives a confirmation email after submitting a request.'),
  ('11111111-bbbb-1111-1111-111111111111', 'Tenant can view and select from available time slots.'),
  ('11111111-bbbb-1111-1111-111111111111', 'System prevents double-booking of the same slot.'),
  ('11111111-cccc-1111-1111-111111111111', 'Repair status should update automatically as engineers update the job.'),
  ('11111111-cccc-1111-1111-111111111111', 'Tenant can refresh the page to see the latest status.')
ON CONFLICT DO NOTHING;

-- EPIC 2: Tenant Payments & Charges
INSERT INTO public.epics (id, project_id, title, description, created_by)
VALUES ('22222222-2222-2222-2222-222222222222', null, 'Tenant Payments & Charges', 'As a tenant, I want to view and manage my payments so that I can stay on top of my rent and charges.', null)
ON CONFLICT (id) DO NOTHING;

-- Stories for Epic 2
INSERT INTO public.stories (id, epic_id, project_id, summary, description, moscow, created_by)
VALUES 
  ('22222222-aaaa-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', null, 
   'View Upcoming Charges',
   'As a tenant, I want to see any pending or upcoming charges so that I can plan my payments.',
   'Must', null),
  ('22222222-bbbb-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', null, 
   'Download Payment Receipt',
   'As a tenant, I want to download receipts for my payments so that I have a record of my transactions.',
   'Should', null)
ON CONFLICT (id) DO NOTHING;

-- AC for Epic 2 Stories
INSERT INTO public.acceptance_criteria (story_id, description)
VALUES 
  ('22222222-aaaa-2222-2222-222222222222', 'Dashboard shows upcoming charges clearly with due date and amount.'),
  ('22222222-aaaa-2222-2222-222222222222', 'Charges update automatically if amounts change.'),
  ('22222222-bbbb-2222-2222-222222222222', 'Tenant can download a PDF receipt for each payment.'),
  ('22222222-bbbb-2222-2222-222222222222', 'Receipts include payment date, amount, and reference number.')
ON CONFLICT DO NOTHING;

-- EPIC 3: Contact & Profile Management
INSERT INTO public.epics (id, project_id, title, description, created_by)
VALUES ('33333333-3333-3333-3333-333333333333', null, 'Contact & Profile Management', 'As a tenant, I want to update my personal and emergency contact details so that my information is always up to date.', null)
ON CONFLICT (id) DO NOTHING;

-- Stories for Epic 3
INSERT INTO public.stories (id, epic_id, project_id, summary, description, moscow, created_by)
VALUES 
  ('33333333-aaaa-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', null, 
   'Update Contact Details',
   'As a tenant, I want to update my phone number and email in the app so that the housing team can always reach me.',
   'Must', null),
  ('33333333-bbbb-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', null, 
   'Update Emergency Contact',
   'As a tenant, I want to review and update my emergency contact whenever I change address so that records are accurate.',
   'Should', null)
ON CONFLICT (id) DO NOTHING;

-- AC for Epic 3 Stories
INSERT INTO public.acceptance_criteria (story_id, description)
VALUES 
  ('33333333-aaaa-3333-3333-333333333333', 'Tenant can edit phone number and email directly in the mobile app.'),
  ('33333333-aaaa-3333-3333-333333333333', 'Changes are saved instantly and reflected in the CRM.'),
  ('33333333-bbbb-3333-3333-333333333333', 'System prompts tenant to check emergency contact during address change.'),
  ('33333333-bbbb-3333-3333-333333333333', 'Emergency contact details must include name, relationship, and phone number.')
ON CONFLICT DO NOTHING;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_epics_project_id ON public.epics(project_id);
CREATE INDEX IF NOT EXISTS idx_stories_epic_id ON public.stories(epic_id);
CREATE INDEX IF NOT EXISTS idx_stories_project_id ON public.stories(project_id);
CREATE INDEX IF NOT EXISTS idx_acceptance_criteria_story_id ON public.acceptance_criteria(story_id);
CREATE INDEX IF NOT EXISTS idx_mvp_flows_project_id ON public.mvp_flows(project_id);
CREATE INDEX IF NOT EXISTS idx_mvp_flows_story_id ON public.mvp_flows(story_id);

-- 7. Verification
SELECT '=== COMPLETE PROJECT SETUP COMPLETE ===' as status;
SELECT 'Projects table created:' as info, COUNT(*) as count FROM public.projects;
SELECT 'Epics created:' as info, COUNT(*) as count FROM public.epics;
SELECT 'Stories created:' as info, COUNT(*) as count FROM public.stories;
SELECT 'Acceptance Criteria created:' as info, COUNT(*) as count FROM public.acceptance_criteria;
SELECT 'Tables with RLS enabled:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('projects', 'epics', 'stories', 'acceptance_criteria', 'mvp_flows');













