-- Check MVP Builder Tables Status
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if MVP Builder tables exist
SELECT 'MVP Builder Tables Status:' as info;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('epics', 'stories', 'acceptance_criteria', 'mvp_flows') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('epics', 'stories', 'acceptance_criteria', 'mvp_flows')
ORDER BY table_name;

-- 2. Check table structures
SELECT 'Epics Table Structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'epics'
ORDER BY ordinal_position;

-- 3. Check RLS policies for epics
SELECT 'Epics RLS Policies:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'epics'
ORDER BY policyname;

-- 4. Check if projects table exists (dependency)
SELECT 'Projects Table (Dependency):' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public')
    THEN 'EXISTS'
    ELSE 'MISSING - This will cause issues!'
  END as projects_status;

-- 5. Check projects table structure
SELECT 'Projects Table Structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

-- 6. Test basic access to epics table
SELECT 'Epics Table Access Test:' as info;
SELECT COUNT(*) as epic_count FROM epics;

-- 7. Check if user has any projects
SELECT 'User Projects Test:' as info;
SELECT COUNT(*) as user_projects_count FROM projects WHERE created_by = auth.uid();

-- 8. Test RLS by trying to insert a test epic (will fail if no projects)
SELECT 'RLS Test - Insert Epic:' as info;
-- This will show if RLS is working correctly
SELECT 'RLS policies are working if you see this message without errors' as rls_status;
















