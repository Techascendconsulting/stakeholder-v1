-- Test Database Setup
-- Run this to verify everything is working

-- Check if spaces exist
SELECT 'Spaces:' as info;
SELECT id, name, description FROM spaces;

-- Check if channels exist
SELECT 'Channels:' as info;
SELECT id, space_id, name, description FROM channels;

-- Check if policies exist
SELECT 'Policies:' as info;
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('messages', 'channels', 'space_members', 'channel_members');

-- Check if user exists
SELECT 'Users:' as info;
SELECT id, email FROM auth.users LIMIT 5;

-- Test message insert (this should work if policies are correct)
SELECT 'Testing message insert...' as info;
INSERT INTO messages (channel_id, user_id, body) 
SELECT 
    (SELECT id FROM channels LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Test message from SQL'
WHERE EXISTS (SELECT 1 FROM channels LIMIT 1) 
  AND EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- Show test message
SELECT 'Test message:' as info;
SELECT id, channel_id, user_id, body, created_at FROM messages WHERE body = 'Test message from SQL';


























