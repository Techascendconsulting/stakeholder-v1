-- Check stories table structure
SELECT '=== STORIES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check epics table structure  
SELECT '=== EPICS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'epics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check acceptance_criteria table structure
SELECT '=== ACCEPTANCE_CRITERIA TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'acceptance_criteria' 
AND table_schema = 'public'
ORDER BY ordinal_position;
