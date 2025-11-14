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



















