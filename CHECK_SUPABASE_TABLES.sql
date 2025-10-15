-- Check what tables exist in your Supabase database
-- Run this first to see the actual table structure

-- List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if there's an auth.users table (Supabase's default)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users';

-- Check if there's a profiles table (common Supabase pattern)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';





