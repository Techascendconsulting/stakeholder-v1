-- ======================================
-- DIAGNOSE PROJECT_ID ISSUE
-- Check what columns actually exist
-- ======================================

-- 1. Check if project_id exists in epics table
SELECT '=== EPICS TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'epics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if project_id exists in stories table
SELECT '=== STORIES TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if projects table exists
SELECT '=== PROJECTS TABLE EXISTS ===' as info;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'projects' 
  AND table_schema = 'public'
) as projects_table_exists;

-- 4. If projects table exists, show its structure
SELECT '=== PROJECTS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;


















