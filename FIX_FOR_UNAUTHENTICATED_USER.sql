-- Fix for Unauthenticated User Access
-- This allows unauthenticated users to read data (for testing)

-- Drop existing policies
DROP POLICY IF EXISTS "spaces_all" ON spaces;
DROP POLICY IF EXISTS "channels_all" ON channels;
DROP POLICY IF EXISTS "messages_all" ON messages;
DROP POLICY IF EXISTS "space_members_all" ON space_members;
DROP POLICY IF EXISTS "channel_members_all" ON channel_members;
DROP POLICY IF EXISTS "message_reactions_all" ON message_reactions;
DROP POLICY IF EXISTS "user_presence_all" ON user_presence;
DROP POLICY IF EXISTS "notification_preferences_all" ON notification_preferences;

-- Create policies that allow both authenticated and unauthenticated users to READ
CREATE POLICY "spaces_read_all" ON spaces FOR SELECT USING (true);
CREATE POLICY "channels_read_all" ON channels FOR SELECT USING (true);
CREATE POLICY "messages_read_all" ON messages FOR SELECT USING (true);
CREATE POLICY "space_members_read_all" ON space_members FOR SELECT USING (true);
CREATE POLICY "channel_members_read_all" ON channel_members FOR SELECT USING (true);
CREATE POLICY "message_reactions_read_all" ON message_reactions FOR SELECT USING (true);
CREATE POLICY "user_presence_read_all" ON user_presence FOR SELECT USING (true);
CREATE POLICY "notification_preferences_read_all" ON notification_preferences FOR SELECT USING (true);

-- Create policies that allow authenticated users to WRITE
CREATE POLICY "spaces_write_auth" ON spaces FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "channels_write_auth" ON channels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "messages_write_auth" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "space_members_write_auth" ON space_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "channel_members_write_auth" ON channel_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "message_reactions_write_auth" ON message_reactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "user_presence_write_auth" ON user_presence FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "notification_preferences_write_auth" ON notification_preferences FOR ALL USING (auth.role() = 'authenticated');

-- Test the access
SELECT '✅ Policies updated!' as status;
SELECT 'Spaces accessible:' as info, COUNT(*) as count FROM spaces;
SELECT 'Channels accessible:' as info, COUNT(*) as count FROM channels;








