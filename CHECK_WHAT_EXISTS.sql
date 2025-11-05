-- Check what tables actually exist
SELECT '=== EXISTING TABLES ===' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if epics table exists and its structure
SELECT '=== EPICS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'epics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if stories table exists and its structure  
SELECT '=== STORIES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if acceptance_criteria table exists and its structure
SELECT '=== ACCEPTANCE_CRITERIA TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'acceptance_criteria' 
AND table_schema = 'public'
ORDER BY ordinal_position;















