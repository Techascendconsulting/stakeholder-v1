-- Quick Fix for Community Lounge - No Complex Functions
-- Run this in your Supabase SQL Editor

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_read" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;
DROP POLICY IF EXISTS "messages_delete" ON messages;

DROP POLICY IF EXISTS "channels_insert" ON channels;
DROP POLICY IF EXISTS "channels_read" ON channels;

DROP POLICY IF EXISTS "space_members_insert" ON space_members;
DROP POLICY IF EXISTS "space_members_read" ON space_members;

DROP POLICY IF EXISTS "channel_members_insert" ON channel_members;
DROP POLICY IF EXISTS "channel_members_read" ON channel_members;

DROP POLICY IF EXISTS "message_reactions_insert" ON message_reactions;
DROP POLICY IF EXISTS "message_reactions_read" ON message_reactions;
DROP POLICY IF EXISTS "message_reactions_delete" ON message_reactions;

DROP POLICY IF EXISTS "user_presence_insert" ON user_presence;
DROP POLICY IF EXISTS "user_presence_read" ON user_presence;
DROP POLICY IF EXISTS "user_presence_update" ON user_presence;

-- Step 2: Create simple policies that allow everything for authenticated users
CREATE POLICY "messages_all" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "channels_all" ON channels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "space_members_all" ON space_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "channel_members_all" ON channel_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "message_reactions_all" ON message_reactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "user_presence_all" ON user_presence FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "notification_preferences_all" ON notification_preferences FOR ALL USING (auth.role() = 'authenticated');

-- Step 3: Create the space manually (without foreign key issues)
INSERT INTO spaces (id, name, description, created_by) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', 
  'BA Training Community', 
  'Main community for Business Analysts', 
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create channels
INSERT INTO channels (id, space_id, name, description, is_private, is_staff_only) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'general', 'General discussion', FALSE, FALSE),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'process-mapping', 'BPMN and process mapping discussions', FALSE, FALSE),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'stakeholders', 'Stakeholder management tips', FALSE, FALSE),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'requirements', 'Requirements gathering techniques', FALSE, FALSE),
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'interview-prep', 'Interview preparation and tips', FALSE, FALSE),
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'agile', 'Agile methodologies and practices', FALSE, FALSE)
ON CONFLICT DO NOTHING;

-- Step 5: Add current user to space and channels
INSERT INTO space_members (space_id, user_id, role) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', auth.uid(), 'owner')
ON CONFLICT DO NOTHING;

INSERT INTO channel_members (channel_id, user_id) 
SELECT id, auth.uid() FROM channels 
WHERE space_id = '550e8400-e29b-41d4-a716-446655440000'
ON CONFLICT DO NOTHING;

-- Step 6: Add a test message
INSERT INTO messages (channel_id, user_id, body) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', auth.uid(), 'Welcome to the BA Community Lounge! 👋')
ON CONFLICT DO NOTHING;



























