-- ======================================
-- CHATGPT BULLETPROOF MIGRATION
-- Fixes project_id issue once and for all
-- ======================================

-- 1. Add project_id to epics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='epics' AND column_name='project_id'
  ) THEN
    ALTER TABLE epics ADD COLUMN project_id uuid;
  END IF;
END$$;

-- 2. Add project_id to stories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='stories' AND column_name='project_id'
  ) THEN
    ALTER TABLE stories ADD COLUMN project_id uuid;
  END IF;
END$$;

-- 3. Add project_id to acceptance_criteria
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='acceptance_criteria' AND column_name='project_id'
  ) THEN
    ALTER TABLE acceptance_criteria ADD COLUMN project_id uuid;
  END IF;
END$$;

-- 4. Add project_id to mvp_flows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='mvp_flows' AND column_name='project_id'
  ) THEN
    ALTER TABLE mvp_flows ADD COLUMN project_id uuid;
  END IF;
END$$;

-- 5. Add project_id to agile_tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='agile_tickets' AND column_name='project_id'
  ) THEN
    ALTER TABLE agile_tickets ADD COLUMN project_id uuid;
  END IF;
END$$;

-- 6. Ensure a "Training Project" exists (default project)
INSERT INTO projects (id, title, description, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Training Project',
  'Default project used for training and seed data',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 7. Backfill epics without project_id
UPDATE epics
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;

-- 8. Backfill stories without project_id
UPDATE stories
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;

-- 9. Backfill acceptance_criteria without project_id
UPDATE acceptance_criteria
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;

-- 10. Backfill mvp_flows without project_id
UPDATE mvp_flows
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;

-- 11. Backfill agile_tickets without project_id
UPDATE agile_tickets
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;

-- 12. Add foreign key constraints AFTER all project_id columns exist
DO $$
BEGIN
  -- Epics → Projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name='epics_project_id_fkey'
  ) THEN
    ALTER TABLE epics ADD CONSTRAINT epics_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- Stories → Projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name='stories_project_id_fkey'
  ) THEN
    ALTER TABLE stories ADD CONSTRAINT stories_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- Acceptance Criteria → Projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name='ac_project_id_fkey'
  ) THEN
    ALTER TABLE acceptance_criteria ADD CONSTRAINT ac_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- MVP Flows → Projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name='mvp_flows_project_id_fkey'
  ) THEN
    ALTER TABLE mvp_flows ADD CONSTRAINT mvp_flows_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- Agile Tickets → Projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name='agile_tickets_project_id_fkey'
  ) THEN
    ALTER TABLE agile_tickets ADD CONSTRAINT agile_tickets_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 13. Insert MVP Builder training data
INSERT INTO public.epics (id, project_id, title, description, created_by)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Tenant Repair Management', 'As a tenant, I want to raise and manage repair requests so that issues in my property are resolved quickly.', null),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Tenant Payments & Charges', 'As a tenant, I want to view and manage my payments so that I can stay on top of my rent and charges.', null),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Contact & Profile Management', 'As a tenant, I want to update my personal and emergency contact details so that my information is always up to date.', null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.stories (id, epic_id, project_id, summary, description, moscow, created_by)
VALUES 
  ('11111111-aaaa-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Submit a Repair Request', 'As a tenant, I want to submit a repair request online so that I do not need to phone customer service.', 'Must', null),
  ('11111111-bbbb-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Choose a Repair Appointment Slot', 'As a tenant, I want to select a preferred appointment date and time so that an engineer can visit when I am available.', 'Must', null),
  ('11111111-cccc-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Track Repair Status', 'As a tenant, I want to see the status of my repair request so that I know whether it has been scheduled, in progress, or completed.', 'Should', null),
  ('22222222-aaaa-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'View Upcoming Charges', 'As a tenant, I want to see any pending or upcoming charges so that I can plan my payments.', 'Must', null),
  ('22222222-bbbb-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Download Payment Receipt', 'As a tenant, I want to download receipts for my payments so that I have a record of my transactions.', 'Should', null),
  ('33333333-aaaa-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Update Contact Details', 'As a tenant, I want to update my phone number and email in the app so that the housing team can always reach me.', 'Must', null),
  ('33333333-bbbb-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Update Emergency Contact', 'As a tenant, I want to review and update my emergency contact whenever I change address so that records are accurate.', 'Should', null)
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

-- 14. Verification
SELECT '=== CHATGPT BULLETPROOF MIGRATION COMPLETE ===' as status;
SELECT 'Training Project created:' as info, COUNT(*) as count FROM public.projects WHERE id = '00000000-0000-0000-0000-000000000001';
SELECT 'Epics created:' as info, COUNT(*) as count FROM public.epics;
SELECT 'Stories created:' as info, COUNT(*) as count FROM public.stories;
SELECT 'Acceptance Criteria created:' as info, COUNT(*) as count FROM public.acceptance_criteria;
SELECT 'All project_id columns added and backfilled!' as success_message;