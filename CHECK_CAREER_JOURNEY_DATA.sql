-- Check Career Journey Progress Data
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'career_journey_progress'
) AS table_exists;

-- 2. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'career_journey_progress'
ORDER BY ordinal_position;

-- 3. Count total records in table
SELECT COUNT(*) as total_records
FROM career_journey_progress;

-- 4. Check records per user
SELECT 
  user_id,
  COUNT(*) as phase_count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started_count
FROM career_journey_progress
GROUP BY user_id
ORDER BY user_id;

-- 5. Check all records with details
SELECT 
  user_id,
  phase_id,
  status,
  array_length(completed_topics, 1) as completed_topics_count,
  started_at,
  completed_at,
  created_at,
  updated_at
FROM career_journey_progress
ORDER BY user_id, created_at;

-- 6. Check for specific user (replace with actual user ID)
-- Get your user ID from auth.users first:
SELECT id, email FROM auth.users LIMIT 5;

-- Then check progress for specific user:
-- SELECT * FROM career_journey_progress WHERE user_id = 'YOUR_USER_ID_HERE';

-- 7. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'career_journey_progress';

-- 8. Expected phase IDs (should match these):
-- phase-1-onboarding
-- phase-2-context
-- phase-3-stakeholders
-- phase-4-as-is
-- phase-5-to-be
-- phase-6-requirements
-- phase-7-documentation
-- phase-8-design-collaboration
-- phase-9-agile
-- phase-10-delivery

-- 9. Check if any phases exist for ALL phase IDs
SELECT 
  phase_id,
  COUNT(*) as user_count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
FROM career_journey_progress
GROUP BY phase_id
ORDER BY phase_id;

