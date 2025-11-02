-- Enhanced Community Lounge Database Schema
-- Based on the MVP specification for scalable real-time chat

-- Spaces (cohorts/orgs)
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channels within a space
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_staff_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Space membership & roles
CREATE TABLE IF NOT EXISTS space_members (
  space_id UUID REFERENCES spaces ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','coach','student')) DEFAULT 'student',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (space_id, user_id)
);

-- Channel membership
CREATE TABLE IF NOT EXISTS channel_members (
  channel_id UUID REFERENCES channels ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  channel_id UUID REFERENCES channels ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  body TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  replied_to_id BIGINT REFERENCES messages,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id BIGINT REFERENCES messages ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, user_id, emoji)
);

-- User presence tracking
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  space_id UUID REFERENCES spaces ON DELETE CASCADE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  web_push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_opt_in BOOLEAN DEFAULT FALSE,
  whatsapp_number TEXT,
  mention_only BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_replied_to ON messages(replied_to_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_channels_space ON channels(space_id);
CREATE INDEX IF NOT EXISTS idx_space_members_user ON space_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_space ON user_presence(space_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS messages_fts_idx ON messages USING gin (to_tsvector('english', body));

-- Enable Row Level Security
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Spaces: Users can read spaces they're members of, owners can create/update
CREATE POLICY "spaces_read" ON spaces FOR SELECT USING (
  EXISTS (SELECT 1 FROM space_members WHERE space_id = spaces.id AND user_id = auth.uid())
);
CREATE POLICY "spaces_insert" ON spaces FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "spaces_update" ON spaces FOR UPDATE USING (
  EXISTS (SELECT 1 FROM space_members WHERE space_id = spaces.id AND user_id = auth.uid() AND role IN ('owner', 'coach'))
);

-- Channels: Users can read channels in their spaces, coaches+ can create private channels
CREATE POLICY "channels_read" ON channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM space_members sm 
          JOIN channel_members cm ON cm.channel_id = channels.id 
          WHERE sm.space_id = channels.space_id 
          AND sm.user_id = auth.uid()
          AND (cm.user_id = auth.uid() OR NOT channels.is_private))
);
CREATE POLICY "channels_insert" ON channels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM space_members WHERE space_id = channels.space_id AND user_id = auth.uid() AND role IN ('owner', 'coach'))
);

-- Space members: Users can read members of their spaces, owners/coaches can manage
CREATE POLICY "space_members_read" ON space_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM space_members sm WHERE sm.space_id = space_members.space_id AND sm.user_id = auth.uid())
);
CREATE POLICY "space_members_insert" ON space_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM space_members WHERE space_id = space_members.space_id AND user_id = auth.uid() AND role IN ('owner', 'coach'))
);

-- Channel members: Users can read members of channels they're in
CREATE POLICY "channel_members_read" ON channel_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM channel_members WHERE channel_id = channel_members.channel_id AND user_id = auth.uid())
);
CREATE POLICY "channel_members_insert" ON channel_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM space_members sm 
          WHERE sm.space_id = (SELECT space_id FROM channels WHERE id = channel_members.channel_id)
          AND sm.user_id = auth.uid())
);

-- Messages: Users can read messages in channels they have access to
CREATE POLICY "messages_read" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM space_members sm 
          JOIN channel_members cm ON cm.channel_id = messages.channel_id 
          WHERE sm.space_id = (SELECT space_id FROM channels WHERE id = messages.channel_id)
          AND sm.user_id = auth.uid()
          AND (cm.user_id = auth.uid() OR NOT (SELECT is_private FROM channels WHERE id = messages.channel_id)))
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM space_members sm 
          WHERE sm.space_id = (SELECT space_id FROM channels WHERE id = messages.channel_id)
          AND sm.user_id = auth.uid())
);
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "messages_delete" ON messages FOR DELETE USING (auth.uid() = user_id);

-- Message reactions: Users can read reactions on messages they can see
CREATE POLICY "message_reactions_read" ON message_reactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM messages m 
          JOIN space_members sm ON sm.space_id = (SELECT space_id FROM channels WHERE id = m.channel_id)
          WHERE m.id = message_reactions.message_id AND sm.user_id = auth.uid())
);
CREATE POLICY "message_reactions_insert" ON message_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "message_reactions_delete" ON message_reactions FOR DELETE USING (auth.uid() = user_id);

-- User presence: Users can read presence in their spaces, update their own
CREATE POLICY "user_presence_read" ON user_presence FOR SELECT USING (
  EXISTS (SELECT 1 FROM space_members WHERE space_id = user_presence.space_id AND user_id = auth.uid())
);
CREATE POLICY "user_presence_insert" ON user_presence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_presence_update" ON user_presence FOR UPDATE USING (auth.uid() = user_id);

-- Notification preferences: Users can only access their own
CREATE POLICY "notification_preferences_read" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_preferences_insert" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_preferences_update" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(space_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_presence (user_id, space_id, last_seen, is_online)
  VALUES (auth.uid(), space_uuid, NOW(), TRUE)
  ON CONFLICT (user_id) DO UPDATE SET
    space_id = EXCLUDED.space_id,
    last_seen = EXCLUDED.last_seen,
    is_online = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


