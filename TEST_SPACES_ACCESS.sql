-- Test Spaces Access
-- Run this to see if spaces are accessible

-- Check if spaces exist
SELECT 'Spaces count:' as info, COUNT(*) as count FROM spaces;

-- Check if we can access spaces as authenticated user
SELECT 'Spaces accessible:' as info;
SELECT id, name, description FROM spaces;

-- Check RLS policies for spaces
SELECT 'RLS Policies for spaces:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'spaces';

-- Check if RLS is enabled
SELECT 'RLS enabled for spaces:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'spaces';

-- Test direct access (bypass RLS)
SELECT 'Direct access (bypass RLS):' as info;
SELECT id, name, description FROM spaces;

-- Check current user context
SELECT 'Current user context:' as info;
SELECT auth.uid() as current_user_id, auth.role() as current_role;













