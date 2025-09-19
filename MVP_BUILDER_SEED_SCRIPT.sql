-- ======================================
-- MVP BUILDER & BACKLOG SEED SCRIPT
-- ======================================
-- This script seeds Epics → Stories → Acceptance Criteria
-- for the MVP Builder and Backlog to display data

-- Training Project ID (always use this)
-- 00000000-0000-0000-0000-000000000001

-- ======================================
-- 1. CLEAN EXISTING TRAINING DATA
-- ======================================
-- Remove any existing training data to avoid duplicates
DELETE FROM public.acceptance_criteria 
WHERE story_id IN (
  SELECT id FROM public.stories 
  WHERE project_id = '00000000-0000-0000-0000-000000000001'
);

DELETE FROM public.stories 
WHERE project_id = '00000000-0000-0000-0000-000000000001';

DELETE FROM public.epics 
WHERE project_id = '00000000-0000-0000-0000-000000000001';

-- ======================================
-- 2. INSERT EPICS
-- ======================================
INSERT INTO public.epics (id, project_id, title, description, created_by, created_at, updated_at)
VALUES 
  -- Epic 1: Tenant Repair Management
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Tenant Repair Management',
    'Epic for managing repair appointment requests from tenants. This includes scheduling, tracking, and completing repair work orders.',
    null,
    NOW(),
    NOW()
  ),
  
  -- Epic 2: Payment & Charges Visibility
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'Payment & Charges Visibility',
    'Epic to let tenants view upcoming charges, payment history, and manage their financial obligations with the property.',
    null,
    NOW(),
    NOW()
  ),
  
  -- Epic 3: Contact & Profile Management
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    'Contact & Profile Management',
    'Epic to prompt tenants to update emergency contact when changing address and manage their profile information.',
    null,
    NOW(),
    NOW()
  );

-- ======================================
-- 3. INSERT STORIES
-- ======================================
INSERT INTO public.stories (id, epic_id, project_id, summary, description, moscow, created_by, created_at, updated_at)
VALUES 
  -- Epic 1 Stories: Tenant Repair Management
  (
    'story-001-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Request Repair Appointment',
    'As a tenant, I want to request a repair appointment so that maintenance issues in my property are resolved quickly.',
    'Must',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-002-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Track Repair Status',
    'As a tenant, I want to track the status of my repair requests so that I know when work will be completed.',
    'Must',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-003-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Reschedule Repair Appointment',
    'As a tenant, I want to reschedule my repair appointment so that it fits my availability.',
    'Should',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-004-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Upload Repair Photos',
    'As a tenant, I want to upload photos of the repair issue so that maintenance can better understand the problem.',
    'Could',
    null,
    NOW(),
    NOW()
  ),

  -- Epic 2 Stories: Payment & Charges Visibility
  (
    'story-001-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'View Upcoming Charges',
    'As a tenant, I want to view my upcoming charges so that I can plan my budget accordingly.',
    'Must',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-002-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'Payment History',
    'As a tenant, I want to view my payment history so that I can track my financial records.',
    'Must',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-003-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'Set Up Auto-Pay',
    'As a tenant, I want to set up automatic payments so that I never miss a payment deadline.',
    'Should',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-004-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'Download Payment Receipts',
    'As a tenant, I want to download my payment receipts so that I can keep records for tax purposes.',
    'Could',
    null,
    NOW(),
    NOW()
  ),

  -- Epic 3 Stories: Contact & Profile Management
  (
    'story-001-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    'Update Emergency Contact',
    'As a tenant, I want to update my emergency contact information so that property management can reach me in case of emergencies.',
    'Must',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-002-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    'Update Address Information',
    'As a tenant, I want to update my address information so that my records are always current.',
    'Must',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-003-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    'Profile Photo Upload',
    'As a tenant, I want to upload a profile photo so that property management can easily identify me.',
    'Should',
    null,
    NOW(),
    NOW()
  ),
  (
    'story-004-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    'Notification Preferences',
    'As a tenant, I want to set my notification preferences so that I receive updates in my preferred format.',
    'Could',
    null,
    NOW(),
    NOW()
  );

-- ======================================
-- 4. INSERT ACCEPTANCE CRITERIA
-- ======================================
INSERT INTO public.acceptance_criteria (id, story_id, description, created_at, updated_at)
VALUES 
  -- Story 1: Request Repair Appointment
  (
    'ac-001-1111-1111-1111-111111111111',
    'story-001-1111-1111-1111-111111111111',
    'Given I am a logged-in tenant, when I click "Request Repair", then I should see a form to describe the issue',
    NOW(),
    NOW()
  ),
  (
    'ac-002-1111-1111-1111-111111111111',
    'story-001-1111-1111-1111-111111111111',
    'Given I fill out the repair request form, when I submit it, then I should receive a confirmation with a reference number',
    NOW(),
    NOW()
  ),
  (
    'ac-003-1111-1111-1111-111111111111',
    'story-001-1111-1111-1111-111111111111',
    'Given I submit a repair request, when the system processes it, then I should be able to select from available appointment slots',
    NOW(),
    NOW()
  ),

  -- Story 2: Track Repair Status
  (
    'ac-001-2222-1111-1111-111111111111',
    'story-002-1111-1111-1111-111111111111',
    'Given I have a repair request, when I view my dashboard, then I should see the current status (Pending, Scheduled, In Progress, Completed)',
    NOW(),
    NOW()
  ),
  (
    'ac-002-2222-1111-1111-111111111111',
    'story-002-1111-1111-1111-111111111111',
    'Given my repair is in progress, when I check the status, then I should see estimated completion time',
    NOW(),
    NOW()
  ),
  (
    'ac-003-2222-1111-1111-111111111111',
    'story-002-1111-1111-1111-111111111111',
    'Given my repair is completed, when I view the status, then I should see a summary of work performed',
    NOW(),
    NOW()
  ),

  -- Story 3: Reschedule Repair Appointment
  (
    'ac-001-3333-1111-1111-111111111111',
    'story-003-1111-1111-1111-111111111111',
    'Given I have a scheduled repair appointment, when I click "Reschedule", then I should see available alternative time slots',
    NOW(),
    NOW()
  ),
  (
    'ac-002-3333-1111-1111-111111111111',
    'story-003-1111-1111-1111-111111111111',
    'Given I select a new appointment time, when I confirm the change, then I should receive an updated confirmation',
    NOW(),
    NOW()
  ),

  -- Story 4: Upload Repair Photos
  (
    'ac-001-4444-1111-1111-111111111111',
    'story-004-1111-1111-1111-111111111111',
    'Given I am reporting a repair issue, when I upload photos, then the system should accept common image formats (JPG, PNG)',
    NOW(),
    NOW()
  ),
  (
    'ac-002-4444-1111-1111-111111111111',
    'story-004-1111-1111-1111-111111111111',
    'Given I upload photos, when I submit the repair request, then the photos should be attached to the work order',
    NOW(),
    NOW()
  ),

  -- Story 5: View Upcoming Charges
  (
    'ac-001-5555-2222-2222-222222222222',
    'story-001-2222-2222-2222-222222222222',
    'Given I am a logged-in tenant, when I view my dashboard, then I should see upcoming charges for the next 3 months',
    NOW(),
    NOW()
  ),
  (
    'ac-002-5555-2222-2222-222222222222',
    'story-001-2222-2222-2222-222222222222',
    'Given I view upcoming charges, when I click on a charge, then I should see detailed breakdown (rent, utilities, fees)',
    NOW(),
    NOW()
  ),
  (
    'ac-003-5555-2222-2222-222222222222',
    'story-001-2222-2222-2222-222222222222',
    'Given I view upcoming charges, when I see the total amount, then it should be clearly highlighted',
    NOW(),
    NOW()
  ),

  -- Story 6: Payment History
  (
    'ac-001-6666-2222-2222-222222222222',
    'story-002-2222-2222-2222-222222222222',
    'Given I am a logged-in tenant, when I navigate to Payment History, then I should see all past payments with dates and amounts',
    NOW(),
    NOW()
  ),
  (
    'ac-002-6666-2222-2222-222222222222',
    'story-002-2222-2222-2222-222222222222',
    'Given I view payment history, when I filter by date range, then I should see payments within that period',
    NOW(),
    NOW()
  ),
  (
    'ac-003-6666-2222-2222-222222222222',
    'story-002-2222-2222-2222-222222222222',
    'Given I view payment history, when I click on a payment, then I should see payment method and reference number',
    NOW(),
    NOW()
  ),

  -- Story 7: Set Up Auto-Pay
  (
    'ac-001-7777-2222-2222-222222222222',
    'story-003-2222-2222-2222-222222222222',
    'Given I am a logged-in tenant, when I navigate to Payment Settings, then I should see an option to enable Auto-Pay',
    NOW(),
    NOW()
  ),
  (
    'ac-002-7777-2222-2222-222222222222',
    'story-003-2222-2222-2222-222222222222',
    'Given I enable Auto-Pay, when I set it up, then I should be able to select payment method and amount',
    NOW(),
    NOW()
  ),
  (
    'ac-003-7777-2222-2222-222222222222',
    'story-003-2222-2222-2222-222222222222',
    'Given Auto-Pay is enabled, when a payment is processed, then I should receive a confirmation email',
    NOW(),
    NOW()
  ),

  -- Story 8: Download Payment Receipts
  (
    'ac-001-8888-2222-2222-222222222222',
    'story-004-2222-2222-2222-222222222222',
    'Given I am viewing payment history, when I click on a payment, then I should see a "Download Receipt" button',
    NOW(),
    NOW()
  ),
  (
    'ac-002-8888-2222-2222-222222222222',
    'story-004-2222-2222-2222-222222222222',
    'Given I click Download Receipt, when the receipt is generated, then it should be in PDF format',
    NOW(),
    NOW()
  ),

  -- Story 9: Update Emergency Contact
  (
    'ac-001-9999-3333-3333-333333333333',
    'story-001-3333-3333-3333-333333333333',
    'Given I am a logged-in tenant, when I navigate to Profile Settings, then I should see my current emergency contact information',
    NOW(),
    NOW()
  ),
  (
    'ac-002-9999-3333-3333-333333333333',
    'story-001-3333-3333-3333-333333333333',
    'Given I update my emergency contact, when I save the changes, then I should receive a confirmation message',
    NOW(),
    NOW()
  ),
  (
    'ac-003-9999-3333-3333-333333333333',
    'story-001-3333-3333-3333-333333333333',
    'Given I update my emergency contact, when the change is saved, then the new information should be immediately visible',
    NOW(),
    NOW()
  ),

  -- Story 10: Update Address Information
  (
    'ac-001-aaaa-3333-3333-333333333333',
    'story-002-3333-3333-3333-333333333333',
    'Given I am a logged-in tenant, when I navigate to Profile Settings, then I should see my current address information',
    NOW(),
    NOW()
  ),
  (
    'ac-002-aaaa-3333-3333-333333333333',
    'story-002-3333-3333-3333-333333333333',
    'Given I update my address, when I save the changes, then the system should validate the new address format',
    NOW(),
    NOW()
  ),
  (
    'ac-003-aaaa-3333-3333-333333333333',
    'story-002-3333-3333-3333-333333333333',
    'Given I update my address, when the change is saved, then I should be prompted to update emergency contact if needed',
    NOW(),
    NOW()
  ),

  -- Story 11: Profile Photo Upload
  (
    'ac-001-bbbb-3333-3333-333333333333',
    'story-003-3333-3333-3333-333333333333',
    'Given I am a logged-in tenant, when I navigate to Profile Settings, then I should see an option to upload a profile photo',
    NOW(),
    NOW()
  ),
  (
    'ac-002-bbbb-3333-3333-333333333333',
    'story-003-3333-3333-333333333333',
    'Given I upload a profile photo, when I select an image, then the system should accept common formats (JPG, PNG)',
    NOW(),
    NOW()
  ),
  (
    'ac-003-bbbb-3333-3333-333333333333',
    'story-003-3333-3333-333333333333',
    'Given I upload a profile photo, when I save the changes, then the new photo should be visible in my profile',
    NOW(),
    NOW()
  ),

  -- Story 12: Notification Preferences
  (
    'ac-001-cccc-3333-3333-333333333333',
    'story-004-3333-3333-3333-333333333333',
    'Given I am a logged-in tenant, when I navigate to Notification Settings, then I should see options for email, SMS, and push notifications',
    NOW(),
    NOW()
  ),
  (
    'ac-002-cccc-3333-3333-333333333333',
    'story-004-3333-3333-3333-333333333333',
    'Given I update notification preferences, when I save the changes, then I should receive a test notification to confirm settings',
    NOW(),
    NOW()
  ),
  (
    'ac-003-cccc-3333-3333-333333333333',
    'story-004-3333-3333-3333-333333333333',
    'Given I set notification preferences, when I receive updates, then they should match my selected preferences',
    NOW(),
    NOW()
  );

-- ======================================
-- 5. VERIFICATION QUERIES
-- ======================================
-- Check that data was inserted correctly
SELECT '=== EPICS INSERTED ===' as status;
SELECT COUNT(*) as epic_count FROM public.epics WHERE project_id = '00000000-0000-0000-0000-000000000001';

SELECT '=== STORIES INSERTED ===' as status;
SELECT COUNT(*) as story_count FROM public.stories WHERE project_id = '00000000-0000-0000-0000-000000000001';

SELECT '=== ACCEPTANCE CRITERIA INSERTED ===' as status;
SELECT COUNT(*) as ac_count FROM public.acceptance_criteria 
WHERE story_id IN (
  SELECT id FROM public.stories 
  WHERE project_id = '00000000-0000-0000-0000-000000000001'
);

-- Show sample data structure
SELECT '=== SAMPLE EPIC DATA ===' as status;
SELECT id, title, description FROM public.epics 
WHERE project_id = '00000000-0000-0000-0000-000000000001' 
LIMIT 1;

SELECT '=== SAMPLE STORY DATA ===' as status;
SELECT id, summary, description, moscow FROM public.stories 
WHERE project_id = '00000000-0000-0000-0000-000000000001' 
LIMIT 1;

SELECT '=== SAMPLE ACCEPTANCE CRITERIA ===' as status;
SELECT ac.id, ac.description, s.summary as story_summary 
FROM public.acceptance_criteria ac
JOIN public.stories s ON ac.story_id = s.id
WHERE s.project_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1;

-- ======================================
-- 6. SUCCESS MESSAGE
-- ======================================
SELECT '=== MVP BUILDER SEED COMPLETE ===' as status;
SELECT 'Epics, Stories, and Acceptance Criteria have been seeded for Training Project' as message;
SELECT 'MVP Builder and Backlog should now display data' as next_step;
