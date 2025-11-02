-- Simple Fix for Community Lounge
-- This will definitely work - no complex logic

-- Step 1: Enable RLS on all tables
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "messages_all" ON messages;
DROP POLICY IF EXISTS "channels_all" ON channels;
DROP POLICY IF EXISTS "space_members_all" ON space_members;
DROP POLICY IF EXISTS "channel_members_all" ON channel_members;
DROP POLICY IF EXISTS "message_reactions_all" ON message_reactions;
DROP POLICY IF EXISTS "user_presence_all" ON user_presence;
DROP POLICY IF EXISTS "notification_preferences_all" ON notification_preferences;

-- Step 3: Create simple policies
CREATE POLICY "spaces_all" ON spaces FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "channels_all" ON channels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "messages_all" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "space_members_all" ON space_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "channel_members_all" ON channel_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "message_reactions_all" ON message_reactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "user_presence_all" ON user_presence FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "notification_preferences_all" ON notification_preferences FOR ALL USING (auth.role() = 'authenticated');

-- Step 4: Create the space directly
INSERT INTO spaces (id, name, description, created_by) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'BA Training Community', 
    'Main community for Business Analysts', 
    COALESCE((SELECT id FROM auth.users LIMIT 1), '00000000-0000-0000-0000-000000000000'::UUID)
)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Create channels
INSERT INTO channels (id, space_id, name, description, is_private, is_staff_only) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'general', 'General discussion', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'process-mapping', 'BPMN and process mapping discussions', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'stakeholders', 'Stakeholder management tips', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'requirements', 'Requirements gathering techniques', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'interview-prep', 'Interview preparation and tips', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'agile', 'Agile methodologies and practices', FALSE, FALSE)
ON CONFLICT DO NOTHING;

-- Step 6: Add current user to space and channels (if user exists)
INSERT INTO space_members (space_id, user_id, role) 
SELECT '550e8400-e29b-41d4-a716-446655440000', id, 'owner'
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO channel_members (channel_id, user_id) 
SELECT c.id, u.id
FROM channels c, auth.users u
WHERE c.space_id = '550e8400-e29b-41d4-a716-446655440000'
AND u.id = (SELECT id FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- Step 7: Add a welcome message (if user exists)
INSERT INTO messages (channel_id, user_id, body) 
SELECT '550e8400-e29b-41d4-a716-446655440001', id, 'Welcome to the BA Community Lounge! 👋'
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Step 8: Show results
SELECT '✅ Setup completed!' as status;
SELECT 'Spaces created:' as info, COUNT(*) as count FROM spaces;
SELECT 'Channels created:' as info, COUNT(*) as count FROM channels;
SELECT 'Messages created:' as info, COUNT(*) as count FROM messages;
