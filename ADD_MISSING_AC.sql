-- Add Missing Acceptance Criteria for All Stories
-- This adds AC for the stories that don't have any yet

-- Add AC for "Engineer can view assigned repair slots"
INSERT INTO public.acceptance_criteria (story_id, description)
SELECT s.id, ac.description
FROM public.stories s
JOIN public.epics e ON s.epic_id = e.id
CROSS JOIN (VALUES
  ('Engineer dashboard must show today\'s appointments.'),
  ('Engineer can see customer contact details for each appointment.'),
  ('Appointments must be sorted by time slot.')
) as ac(description)
WHERE s.summary = 'Engineer can view assigned repair slots'
AND e.title = 'Tenant Repair Requests'
ON CONFLICT DO NOTHING;

-- Add AC for "Tenant can reschedule appointment"
INSERT INTO public.acceptance_criteria (story_id, description)
SELECT s.id, ac.description
FROM public.stories s
JOIN public.epics e ON s.epic_id = e.id
CROSS JOIN (VALUES
  ('Tenant can see available alternative time slots.'),
  ('System must send confirmation email for rescheduled appointment.'),
  ('Original appointment must be cancelled when rescheduled.')
) as ac(description)
WHERE s.summary = 'Tenant can reschedule appointment'
AND e.title = 'Tenant Repair Requests'
ON CONFLICT DO NOTHING;

-- Add AC for "Finance officer has fewer support calls"
INSERT INTO public.acceptance_criteria (story_id, description)
SELECT s.id, ac.description
FROM public.stories s
JOIN public.epics e ON s.epic_id = e.id
CROSS JOIN (VALUES
  ('Support ticket volume must decrease by at least 20%.'),
  ('Common charge questions must be answered in the dashboard.'),
  ('Tenant satisfaction with charge transparency must improve.')
) as ac(description)
WHERE s.summary = 'Finance officer has fewer support calls'
AND e.title = 'Pending Charges Visibility'
ON CONFLICT DO NOTHING;

-- Add AC for "Contact centre manager sees accurate contact info"
INSERT INTO public.acceptance_criteria (story_id, description)
SELECT s.id, ac.description
FROM public.stories s
JOIN public.epics e ON s.epic_id = e.id
CROSS JOIN (VALUES
  ('Emergency contact must be updated within 24 hours of address change.'),
  ('System must flag outdated emergency contacts for review.'),
  ('Contact details must be verified before marking as current.')
) as ac(description)
WHERE s.summary = 'Contact centre manager sees accurate contact info'
AND e.title = 'Update Emergency Contact'
ON CONFLICT DO NOTHING;

-- Verify the results
SELECT '=== ACCEPTANCE CRITERIA ADDED ===' as status;
SELECT 'Total AC count:' as info, COUNT(*) as count FROM public.acceptance_criteria;

-- Show AC per story
SELECT 
  s.summary as story_title,
  COUNT(ac.id) as ac_count
FROM public.stories s
LEFT JOIN public.acceptance_criteria ac ON s.id = ac.story_id
GROUP BY s.id, s.summary
ORDER BY s.summary;

