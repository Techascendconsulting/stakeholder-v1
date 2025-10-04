-- Verify MVP Builder Data
-- Run this in Supabase SQL Editor to check if the seed data was inserted

-- Check if epics exist
SELECT '=== EPICS ===' as section;
SELECT id, title, description, project_id FROM public.epics ORDER BY created_at;

-- Check if stories exist
SELECT '=== STORIES ===' as section;
SELECT s.id, s.summary, s.moscow, e.title as epic_title
FROM public.stories s 
JOIN public.epics e ON s.epic_id = e.id 
ORDER BY s.created_at;

-- Check if acceptance criteria exist
SELECT '=== ACCEPTANCE CRITERIA ===' as section;
SELECT ac.id, ac.description, s.summary as story_summary
FROM public.acceptance_criteria ac 
JOIN public.stories s ON ac.story_id = s.id 
ORDER BY ac.created_at;

-- Count everything
SELECT '=== COUNTS ===' as section;
SELECT 
  (SELECT COUNT(*) FROM public.epics) as epic_count,
  (SELECT COUNT(*) FROM public.stories) as story_count,
  (SELECT COUNT(*) FROM public.acceptance_criteria) as ac_count;


