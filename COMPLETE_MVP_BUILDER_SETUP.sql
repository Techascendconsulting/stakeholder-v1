-- COMPLETE MVP Builder Setup
-- This combines the schema creation + seed data in one migration

-- ======================================
-- 1. CREATE SCHEMA (from MVP_BUILDER_MIGRATION_FIXED.sql)
-- ======================================

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for acceptance_criteria (drop existing first)
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view acceptance criteria in their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can view acceptance criteria in their stories" ON public.acceptance_criteria
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

DROP POLICY IF EXISTS "Users can create acceptance criteria in their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can create acceptance criteria in their stories" ON public.acceptance_criteria
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

DROP POLICY IF EXISTS "Users can update acceptance criteria in their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can update acceptance criteria in their stories" ON public.acceptance_criteria
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

DROP POLICY IF EXISTS "Users can delete acceptance criteria in their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can delete acceptance criteria in their stories" ON public.acceptance_criteria
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
  story_ids UUID[] NOT NULL,
  flow_order INTEGER[] NOT NULL,
  validated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for mvp_flows (drop existing first)
ALTER TABLE public.mvp_flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view mvp flows in their epics" ON public.mvp_flows;
CREATE POLICY "Users can view mvp flows in their epics" ON public.mvp_flows
  FOR SELECT USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create mvp flows in their epics" ON public.mvp_flows;
CREATE POLICY "Users can create mvp flows in their epics" ON public.mvp_flows
  FOR INSERT WITH CHECK (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    ) AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update mvp flows in their epics" ON public.mvp_flows;
CREATE POLICY "Users can update mvp flows in their epics" ON public.mvp_flows
  FOR UPDATE USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete mvp flows in their epics" ON public.mvp_flows;
CREATE POLICY "Users can delete mvp flows in their epics" ON public.mvp_flows
  FOR DELETE USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

-- ======================================
-- 2. SEED DATA (from seed migration)
-- ======================================

-- Seed Epic 1: Tenant Repair Requests
with inserted_epic as (
  insert into epics (project_id, title, description, created_by)
  values (null, 'Tenant Repair Requests', 'Epic for managing repair appointment requests from tenants', null)
  on conflict do nothing
  returning id
),
inserted_stories as (
  insert into stories (epic_id, summary, description, moscow, created_by)
  select id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant can book a repair slot', 'Tenant selects from available slots when submitting a repair request.', 'Must'),
          ('Engineer can view assigned repair slots', 'Engineer dashboard shows their scheduled appointments.', 'Must'),
          ('Tenant can reschedule appointment', 'Tenant updates their availability after initial booking.', 'Should')
       ) as s(summary, description, moscow)
  on conflict do nothing
  returning id, summary
)
insert into acceptance_criteria (story_id, description)
select (select id from inserted_stories where summary = 'Tenant can book a repair slot'),
       ac.description
from (values
        ('A list of available slots must be shown when booking.'),
        ('A confirmation message must be sent after booking.')
     ) as ac(description)
on conflict do nothing;

-- Seed Epic 2: Pending Charges Visibility
with inserted_epic as (
  insert into epics (project_id, title, description, created_by)
  values (null, 'Pending Charges Visibility', 'Epic to let tenants view upcoming charges on their dashboard', null)
  on conflict do nothing
  returning id
),
inserted_stories as (
  insert into stories (epic_id, summary, description, moscow, created_by)
  select id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant can view upcoming charges', 'Dashboard shows rent increases and service charges before they apply.', 'Must'),
          ('Finance officer has fewer support calls', 'Tenant visibility reduces calls about pending charges.', 'Could')
       ) as s(summary, description, moscow)
  on conflict do nothing
  returning id, summary
)
insert into acceptance_criteria (story_id, description)
select (select id from inserted_stories where summary = 'Tenant can view upcoming charges'),
       ac.description
from (values
        ('Dashboard must display pending charges with due dates.'),
        ('Charges must be clearly separated from already-paid amounts.')
     ) as ac(description)
on conflict do nothing;

-- Seed Epic 3: Update Emergency Contact
with inserted_epic as (
  insert into epics (project_id, title, description, created_by)
  values (null, 'Update Emergency Contact', 'Epic to prompt tenants to update emergency contact when changing address', null)
  on conflict do nothing
  returning id
),
inserted_stories as (
  insert into stories (epic_id, summary, description, moscow, created_by)
  select id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant prompted to update emergency contact', 'When tenant changes address, system asks for emergency contact update.', 'Must'),
          ('Contact centre manager sees accurate contact info', 'System prevents outdated emergency contacts during incidents.', 'Should')
       ) as s(summary, description, moscow)
  on conflict do nothing
  returning id, summary
)
insert into acceptance_criteria (story_id, description)
select (select id from inserted_stories where summary = 'Tenant prompted to update emergency contact'),
       ac.description
from (values
        ('Prompt must appear whenever an address change is saved.'),
        ('System must allow tenant to confirm or edit contact details.')
     ) as ac(description)
on conflict do nothing;

-- ======================================
-- 3. VERIFICATION
-- ======================================
SELECT '=== MVP BUILDER SETUP COMPLETE ===' as status;
SELECT 'Epics created:' as info, COUNT(*) as count FROM public.epics;
SELECT 'Stories created:' as info, COUNT(*) as count FROM public.stories;
SELECT 'Acceptance Criteria created:' as info, COUNT(*) as count FROM public.acceptance_criteria;
