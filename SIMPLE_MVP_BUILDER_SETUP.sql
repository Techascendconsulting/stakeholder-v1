-- ======================================
-- SIMPLE MVP BUILDER SETUP
-- Creates everything from scratch, no dependencies
-- ======================================

-- 1. Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.mvp_flows CASCADE;
DROP TABLE IF EXISTS public.acceptance_criteria CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.epics CASCADE;

-- 2. Create epics table
CREATE TABLE public.epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create stories table
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE,
  project_id UUID,
  summary TEXT NOT NULL,
  description TEXT,
  moscow TEXT CHECK (moscow IN ('Must', 'Should', 'Could', 'Won''t')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create acceptance_criteria table
CREATE TABLE public.acceptance_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create mvp_flows table
CREATE TABLE public.mvp_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  in_mvp BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_flows ENABLE ROW LEVEL SECURITY;

-- 7. Create simple RLS policies (allow all for now)
CREATE POLICY "Allow all on epics" ON public.epics FOR ALL USING (true);
CREATE POLICY "Allow all on stories" ON public.stories FOR ALL USING (true);
CREATE POLICY "Allow all on acceptance_criteria" ON public.acceptance_criteria FOR ALL USING (true);
CREATE POLICY "Allow all on mvp_flows" ON public.mvp_flows FOR ALL USING (true);

-- 8. Insert training data
INSERT INTO public.epics (id, project_id, title, description, created_by)
VALUES 
  ('11111111-1111-1111-1111-111111111111', null, 'Tenant Repair Management', 'As a tenant, I want to raise and manage repair requests so that issues in my property are resolved quickly.', null),
  ('22222222-2222-2222-2222-222222222222', null, 'Tenant Payments & Charges', 'As a tenant, I want to view and manage my payments so that I can stay on top of my rent and charges.', null),
  ('33333333-3333-3333-3333-333333333333', null, 'Contact & Profile Management', 'As a tenant, I want to update my personal and emergency contact details so that my information is always up to date.', null);

INSERT INTO public.stories (id, epic_id, project_id, summary, description, moscow, created_by)
VALUES 
  ('11111111-aaaa-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 'Submit a Repair Request', 'As a tenant, I want to submit a repair request online so that I do not need to phone customer service.', 'Must', null),
  ('11111111-bbbb-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 'Choose a Repair Appointment Slot', 'As a tenant, I want to select a preferred appointment date and time so that an engineer can visit when I am available.', 'Must', null),
  ('11111111-cccc-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 'Track Repair Status', 'As a tenant, I want to see the status of my repair request so that I know whether it has been scheduled, in progress, or completed.', 'Should', null),
  ('22222222-aaaa-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', null, 'View Upcoming Charges', 'As a tenant, I want to see any pending or upcoming charges so that I can plan my payments.', 'Must', null),
  ('22222222-bbbb-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', null, 'Download Payment Receipt', 'As a tenant, I want to download receipts for my payments so that I have a record of my transactions.', 'Should', null),
  ('33333333-aaaa-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', null, 'Update Contact Details', 'As a tenant, I want to update my phone number and email in the app so that the housing team can always reach me.', 'Must', null),
  ('33333333-bbbb-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', null, 'Update Emergency Contact', 'As a tenant, I want to review and update my emergency contact whenever I change address so that records are accurate.', 'Should', null);

INSERT INTO public.acceptance_criteria (story_id, description)
VALUES 
  ('11111111-aaaa-1111-1111-111111111111', 'Repair request form must include issue description and property address.'),
  ('11111111-aaaa-1111-1111-111111111111', 'Tenant receives a confirmation email after submitting a request.'),
  ('11111111-bbbb-1111-1111-111111111111', 'Tenant can view and select from available time slots.'),
  ('11111111-bbbb-1111-1111-111111111111', 'System prevents double-booking of the same slot.'),
  ('11111111-cccc-1111-1111-111111111111', 'Repair status should update automatically as engineers update the job.'),
  ('11111111-cccc-1111-1111-111111111111', 'Tenant can refresh the page to see the latest status.'),
  ('22222222-aaaa-2222-2222-222222222222', 'Dashboard shows upcoming charges clearly with due date and amount.'),
  ('22222222-aaaa-2222-2222-222222222222', 'Charges update automatically if amounts change.'),
  ('22222222-bbbb-2222-2222-222222222222', 'Tenant can download a PDF receipt for each payment.'),
  ('22222222-bbbb-2222-2222-222222222222', 'Receipts include payment date, amount, and reference number.'),
  ('33333333-aaaa-3333-3333-333333333333', 'Tenant can edit phone number and email directly in the mobile app.'),
  ('33333333-aaaa-3333-3333-333333333333', 'Changes are saved instantly and reflected in the CRM.'),
  ('33333333-bbbb-3333-3333-333333333333', 'System prompts tenant to check emergency contact during address change.'),
  ('33333333-bbbb-3333-3333-333333333333', 'Emergency contact details must include name, relationship, and phone number.');

-- 9. Create indexes
CREATE INDEX idx_epics_project_id ON public.epics(project_id);
CREATE INDEX idx_stories_epic_id ON public.stories(epic_id);
CREATE INDEX idx_stories_project_id ON public.stories(project_id);
CREATE INDEX idx_acceptance_criteria_story_id ON public.acceptance_criteria(story_id);
CREATE INDEX idx_mvp_flows_project_id ON public.mvp_flows(project_id);
CREATE INDEX idx_mvp_flows_story_id ON public.mvp_flows(story_id);

-- 10. Verification
SELECT '=== MVP BUILDER SETUP COMPLETE ===' as status;
SELECT 'Epics created:' as info, COUNT(*) as count FROM public.epics;
SELECT 'Stories created:' as info, COUNT(*) as count FROM public.stories;
SELECT 'Acceptance Criteria created:' as info, COUNT(*) as count FROM public.acceptance_criteria;
