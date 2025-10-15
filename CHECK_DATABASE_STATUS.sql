-- Check Database Status
-- Run this to see what's actually in your database

-- Check if tables exist
SELECT 'Tables:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('spaces', 'channels', 'messages', 'space_members', 'channel_members');

-- Check if spaces table has data
SELECT 'Spaces count:' as info;
SELECT COUNT(*) as spaces_count FROM spaces;

-- Check if channels table has data
SELECT 'Channels count:' as info;
SELECT COUNT(*) as channels_count FROM channels;

-- Check if messages table has data
SELECT 'Messages count:' as info;
SELECT COUNT(*) as messages_count FROM messages;

-- Check if users exist
SELECT 'Users count:' as info;
SELECT COUNT(*) as users_count FROM auth.users;

-- Check RLS policies
SELECT 'RLS Policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('spaces', 'channels', 'messages', 'space_members', 'channel_members');

-- Check if spaces table is empty
SELECT 'Spaces data:' as info;
SELECT * FROM spaces LIMIT 5;

-- Check if channels table is empty
SELECT 'Channels data:' as info;
SELECT * FROM channels LIMIT 5;


















