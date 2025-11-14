-- ======================================
-- FINAL SAFE MIGRATION
-- Works with existing database structure
-- ======================================

-- 1. Add missing columns to existing tables (safe - won't break anything)
ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS project_id UUID;

ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS project_id UUID;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS summary TEXT;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS moscow TEXT CHECK (moscow IN ('Must', 'Should', 'Could', 'Won''t'));

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Enable RLS on existing tables
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_flows ENABLE ROW LEVEL SECURITY;

-- 3. Create simple RLS policies (allow all for training)
DROP POLICY IF EXISTS "Allow all on epics" ON public.epics;
CREATE POLICY "Allow all on epics" ON public.epics FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on stories" ON public.stories;
CREATE POLICY "Allow all on stories" ON public.stories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on acceptance_criteria" ON public.acceptance_criteria;
CREATE POLICY "Allow all on acceptance_criteria" ON public.acceptance_criteria FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on mvp_flows" ON public.mvp_flows;
CREATE POLICY "Allow all on mvp_flows" ON public.mvp_flows FOR ALL USING (true);

-- 4. Insert training data
INSERT INTO public.epics (id, project_id, title, description, created_by)
VALUES 
  ('11111111-1111-1111-1111-111111111111', null, 'Tenant Repair Management', 'As a tenant, I want to raise and manage repair requests so that issues in my property are resolved quickly.', null),
  ('22222222-2222-2222-2222-222222222222', null, 'Tenant Payments & Charges', 'As a tenant, I want to view and manage my payments so that I can stay on top of my rent and charges.', null),
  ('33333333-3333-3333-3333-333333333333', null, 'Contact & Profile Management', 'As a tenant, I want to update my personal and emergency contact details so that my information is always up to date.', null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.stories (id, epic_id, project_id, summary, description, moscow, created_by)
VALUES 
  ('11111111-aaaa-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 'Submit a Repair Request', 'As a tenant, I want to submit a repair request online so that I do not need to phone customer service.', 'Must', null),
  ('11111111-bbbb-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 'Choose a Repair Appointment Slot', 'As a tenant, I want to select a preferred appointment date and time so that an engineer can visit when I am available.', 'Must', null),
  ('11111111-cccc-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', null, 'Track Repair Status', 'As a tenant, I want to see the status of my repair request so that I know whether it has been scheduled, in progress, or completed.', 'Should', null),
  ('22222222-aaaa-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', null, 'View Upcoming Charges', 'As a tenant, I want to see any pending or upcoming charges so that I can plan my payments.', 'Must', null),
  ('22222222-bbbb-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', null, 'Download Payment Receipt', 'As a tenant, I want to download receipts for my payments so that I have a record of my transactions.', 'Should', null),
  ('33333333-aaaa-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', null, 'Update Contact Details', 'As a tenant, I want to update my phone number and email in the app so that the housing team can always reach me.', 'Must', null),
  ('33333333-bbbb-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', null, 'Update Emergency Contact', 'As a tenant, I want to review and update my emergency contact whenever I change address so that records are accurate.', 'Should', null)
ON CONFLICT (id) DO NOTHING;

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
  ('33333333-bbbb-3333-3333-333333333333', 'Emergency contact details must include name, relationship, and phone number.')
ON CONFLICT DO NOTHING;

-- 5. Verification
SELECT '=== MIGRATION COMPLETE ===' as status;
SELECT 'Epics created:' as info, COUNT(*) as count FROM public.epics;
SELECT 'Stories created:' as info, COUNT(*) as count FROM public.stories;
SELECT 'Acceptance Criteria created:' as info, COUNT(*) as count FROM public.acceptance_criteria;



















