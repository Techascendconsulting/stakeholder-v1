-- Temporarily disable RLS for testing
-- This will allow access without authentication

-- Disable RLS on spaces table
ALTER TABLE spaces DISABLE ROW LEVEL SECURITY;

-- Disable RLS on channels table  
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;

-- Disable RLS on messages table
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other tables
ALTER TABLE space_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;

-- Test access
SELECT 'Testing access after disabling RLS:' as info;
SELECT COUNT(*) as spaces_count FROM spaces;
SELECT COUNT(*) as channels_count FROM channels;
SELECT COUNT(*) as messages_count FROM messages;

-- Show some data
SELECT 'Spaces:' as info;
SELECT id, name, description FROM spaces;

SELECT 'Channels:' as info;
SELECT id, space_id, name, description FROM channels LIMIT 3;












