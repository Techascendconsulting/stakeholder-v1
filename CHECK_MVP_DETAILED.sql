-- Detailed MVP Builder Diagnostic
-- Run this to get comprehensive status

-- 1. Check all MVP Builder tables exist
SELECT '=== TABLE EXISTENCE CHECK ===' as section;
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('epics', 'stories', 'acceptance_criteria', 'mvp_flows')
ORDER BY table_name;

-- 2. Check projects table (dependency)
SELECT '=== PROJECTS TABLE CHECK ===' as section;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public')
    THEN 'EXISTS'
    ELSE 'MISSING - CRITICAL ISSUE!'
  END as projects_status;

-- 3. Check if user has projects
SELECT '=== USER PROJECTS CHECK ===' as section;
SELECT 
  COUNT(*) as user_projects_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'User has projects'
    ELSE 'NO PROJECTS - This will cause MVP Builder to fail!'
  END as projects_status
FROM projects 
WHERE created_by = auth.uid();

-- 4. Check epics table structure
SELECT '=== EPICS TABLE STRUCTURE ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'epics'
ORDER BY ordinal_position;

-- 5. Check epics table data
SELECT '=== EPICS TABLE DATA ===' as section;
SELECT 
  COUNT(*) as total_epics,
  COUNT(CASE WHEN project_id IS NOT NULL THEN 1 END) as epics_with_project
FROM epics;

-- 6. Check user's epics specifically
SELECT '=== USER EPICS CHECK ===' as section;
SELECT 
  COUNT(*) as user_epics_count
FROM epics e
JOIN projects p ON e.project_id = p.id
WHERE p.created_by = auth.uid();

-- 7. Check RLS policies for all MVP tables
SELECT '=== RLS POLICIES CHECK ===' as section;
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('epics', 'stories', 'acceptance_criteria', 'mvp_flows', 'projects')
ORDER BY tablename, policyname;

-- 8. Test actual data access
SELECT '=== DATA ACCESS TEST ===' as section;
SELECT 
  'Epics accessible' as test_name,
  COUNT(*) as count
FROM epics
WHERE project_id IN (
  SELECT id FROM projects WHERE created_by = auth.uid()
);

-- 9. Check for any error logs or issues
SELECT '=== ERROR CHECK ===' as section;
SELECT 
  'No obvious errors found' as status,
  'Check browser console for detailed errors' as note;














