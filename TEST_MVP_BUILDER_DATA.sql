-- Test MVP Builder Data
-- Run this to verify the seed data is working correctly

-- 1. Check if we have projects
SELECT '=== PROJECTS ===' as section;
SELECT id, name, description FROM public.projects ORDER BY created_at;

-- 2. Check if we have epics
SELECT '=== EPICS ===' as section;
SELECT e.id, e.title, p.name as project_name 
FROM public.epics e 
JOIN public.projects p ON e.project_id = p.id 
ORDER BY e.created_at;

-- 3. Check if we have stories
SELECT '=== STORIES ===' as section;
SELECT s.id, s.summary, s.moscow, e.title as epic_title, p.name as project_name
FROM public.stories s 
JOIN public.epics e ON s.epic_id = e.id 
JOIN public.projects p ON e.project_id = p.id 
ORDER BY s.created_at;

-- 4. Check if we have acceptance criteria
SELECT '=== ACCEPTANCE CRITERIA ===' as section;
SELECT ac.id, ac.description, s.summary as story_summary
FROM public.acceptance_criteria ac 
JOIN public.stories s ON ac.story_id = s.id 
ORDER BY ac.created_at;

-- 5. Check if we have MVP flows
SELECT '=== MVP FLOWS ===' as section;
SELECT mf.id, e.title as epic_title, mf.story_ids, mf.flow_order, mf.validated
FROM public.mvp_flows mf 
JOIN public.epics e ON mf.epic_id = e.id 
ORDER BY mf.created_at;

-- 6. Test data relationships
SELECT '=== DATA RELATIONSHIPS ===' as section;
SELECT 
  p.name as project_name,
  COUNT(DISTINCT e.id) as epic_count,
  COUNT(DISTINCT s.id) as story_count,
  COUNT(DISTINCT ac.id) as ac_count
FROM public.projects p
LEFT JOIN public.epics e ON p.id = e.project_id
LEFT JOIN public.stories s ON e.id = s.epic_id
LEFT JOIN public.acceptance_criteria ac ON s.id = ac.story_id
GROUP BY p.id, p.name
ORDER BY p.name;














