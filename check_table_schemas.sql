-- Query to check actual column structure of key tables
-- Run this in Supabase SQL Editor to see what columns actually exist

-- Check learning_progress table structure
SELECT 
  'learning_progress' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'learning_progress'
ORDER BY ordinal_position;

-- Check practice_progress table structure
SELECT 
  'practice_progress' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'practice_progress'
ORDER BY ordinal_position;

-- Check user_profiles table structure
SELECT 
  'user_profiles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check elicitation_practice_sessions table structure
SELECT 
  'elicitation_practice_sessions' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'elicitation_practice_sessions'
ORDER BY ordinal_position;
