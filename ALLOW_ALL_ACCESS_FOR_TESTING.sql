-- Allow All Access for Testing
-- This allows unauthenticated users to read AND write (temporary for testing)

-- Drop existing policies
DROP POLICY IF EXISTS "spaces_read_all" ON spaces;
DROP POLICY IF EXISTS "channels_read_all" ON channels;
DROP POLICY IF EXISTS "messages_read_all" ON messages;
DROP POLICY IF EXISTS "space_members_read_all" ON space_members;
DROP POLICY IF EXISTS "channel_members_read_all" ON channel_members;
DROP POLICY IF EXISTS "message_reactions_read_all" ON message_reactions;
DROP POLICY IF EXISTS "user_presence_read_all" ON user_presence;
DROP POLICY IF EXISTS "notification_preferences_read_all" ON notification_preferences;

DROP POLICY IF EXISTS "spaces_write_auth" ON spaces;
DROP POLICY IF EXISTS "channels_write_auth" ON channels;
DROP POLICY IF EXISTS "messages_write_auth" ON messages;
DROP POLICY IF EXISTS "space_members_write_auth" ON space_members;
DROP POLICY IF EXISTS "channel_members_write_auth" ON channel_members;
DROP POLICY IF EXISTS "message_reactions_write_auth" ON message_reactions;
DROP POLICY IF EXISTS "user_presence_write_auth" ON user_presence;
DROP POLICY IF EXISTS "notification_preferences_write_auth" ON notification_preferences;

-- Create policies that allow ALL operations for everyone (testing only)
CREATE POLICY "spaces_all" ON spaces FOR ALL USING (true);
CREATE POLICY "channels_all" ON channels FOR ALL USING (true);
CREATE POLICY "messages_all" ON messages FOR ALL USING (true);
CREATE POLICY "space_members_all" ON space_members FOR ALL USING (true);
CREATE POLICY "channel_members_all" ON channel_members FOR ALL USING (true);
CREATE POLICY "message_reactions_all" ON message_reactions FOR ALL USING (true);
CREATE POLICY "user_presence_all" ON user_presence FOR ALL USING (true);
CREATE POLICY "notification_preferences_all" ON notification_preferences FOR ALL USING (true);

-- Test the access
SELECT '✅ All access granted for testing!' as status;
SELECT 'Spaces accessible:' as info, COUNT(*) as count FROM spaces;
SELECT 'Channels accessible:' as info, COUNT(*) as count FROM channels;






