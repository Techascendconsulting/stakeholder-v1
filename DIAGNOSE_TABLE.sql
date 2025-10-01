-- DIAGNOSE THE ACTUAL TABLE STRUCTURE
-- Run this in Supabase SQL Editor to see what's really there

-- Check what columns actually exist in cohort_messages
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'cohort_messages'
ORDER BY ordinal_position;

-- Check what data exists
SELECT * FROM cohort_messages LIMIT 2;

-- Check if there are any constraints
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'cohort_messages';

-- Check if the table even exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'cohort_messages';










