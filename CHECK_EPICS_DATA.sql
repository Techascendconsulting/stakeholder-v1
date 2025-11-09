-- Check if epics data exists
SELECT '=== CHECKING EPICS ===' as info;
SELECT COUNT(*) as epic_count FROM public.epics;

SELECT '=== CHECKING STORIES ===' as info;
SELECT COUNT(*) as story_count FROM public.stories;

SELECT '=== CHECKING ACCEPTANCE CRITERIA ===' as info;
SELECT COUNT(*) as ac_count FROM public.acceptance_criteria;

-- If no data, show the tables exist
SELECT '=== TABLE STRUCTURE ===' as info;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('epics', 'stories', 'acceptance_criteria')
ORDER BY table_name, ordinal_position;


















