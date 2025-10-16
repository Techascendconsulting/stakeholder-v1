-- Check what tables already exist in the database
SELECT '=== EXISTING TABLES ===' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if projects table exists and its structure
SELECT '=== PROJECTS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if agile_tickets table exists (since we saw it in AgileHubView)
SELECT '=== AGILE_TICKETS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'agile_tickets' 
AND table_schema = 'public'
ORDER BY ordinal_position;






