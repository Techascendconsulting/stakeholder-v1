-- Advanced Chat Features Migration
-- Adding Direct Messages, Message Threading, User Profiles, Message Search, Typing Indicators, and Message Pinning

-- User Profiles for professional networking
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  skills TEXT[], -- Array of skills
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct Messages (1:1 conversations)
CREATE TABLE IF NOT EXISTS direct_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  replied_to_id BIGINT REFERENCES direct_messages(id),
  thread_id BIGINT REFERENCES direct_messages(id), -- For message threading
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Direct message reactions
CREATE TABLE IF NOT EXISTS dm_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id BIGINT REFERENCES direct_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, user_id, emoji)
);

-- Message threading for both channels and DMs
CREATE TABLE IF NOT EXISTS message_threads (
  id BIGSERIAL PRIMARY KEY,
  parent_message_id BIGINT, -- Can be from messages or direct_messages
  parent_type TEXT CHECK (parent_type IN ('channel', 'dm')) NOT NULL,
  thread_title TEXT, -- Auto-generated or user-defined
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reply_count INTEGER DEFAULT 0
);

-- Message pinning for important discussions
CREATE TABLE IF NOT EXISTS pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id BIGINT NOT NULL, -- Can be from messages or direct_messages
  message_type TEXT CHECK (message_type IN ('channel', 'dm')) NOT NULL,
  pinned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, message_type)
);

-- Typing indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  dm_recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((channel_id IS NOT NULL AND dm_recipient_id IS NULL) OR (channel_id IS NULL AND dm_recipient_id IS NOT NULL))
);

-- Message search history
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('messages', 'users', 'files')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User connections/following for networking
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Message bookmarks for saving important messages
CREATE TABLE IF NOT EXISTS message_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_id BIGINT NOT NULL, -- Can be from messages or direct_messages
  message_type TEXT CHECK (message_type IN ('channel', 'dm')) NOT NULL,
  bookmark_note TEXT, -- Optional note about why it was bookmarked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, message_id, message_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(
  LEAST(sender_id, recipient_id), 
  GREATEST(sender_id, recipient_id), 
  created_at DESC
);
CREATE INDEX IF NOT EXISTS idx_direct_messages_thread ON direct_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_dm_reactions_message ON dm_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_parent ON message_threads(parent_message_id, parent_type);
CREATE INDEX IF NOT EXISTS idx_pinned_messages_type ON pinned_messages(message_type, message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_channel ON typing_indicators(channel_id, is_typing);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_dm ON typing_indicators(dm_recipient_id, is_typing);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_connections_follower ON user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following ON user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_message_bookmarks_user ON message_bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON user_profiles(is_public, experience_level);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS direct_messages_fts_idx ON direct_messages USING gin (to_tsvector('english', body));
CREATE INDEX IF NOT EXISTS user_profiles_fts_idx ON user_profiles USING gin (to_tsvector('english', display_name || ' ' || COALESCE(bio, '') || ' ' || COALESCE(title, '') || ' ' || COALESCE(company, '')));

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "profiles_read_public" ON user_profiles FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
CREATE POLICY "profiles_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete" ON user_profiles FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for direct_messages
CREATE POLICY "dm_read" ON direct_messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "dm_insert" ON direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "dm_update" ON direct_messages FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "dm_delete" ON direct_messages FOR DELETE USING (auth.uid() = sender_id);

-- RLS Policies for dm_reactions
CREATE POLICY "dm_reactions_read" ON dm_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM direct_messages 
    WHERE id = message_id 
    AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  )
);
CREATE POLICY "dm_reactions_insert" ON dm_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dm_reactions_delete" ON dm_reactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for message_threads
CREATE POLICY "threads_read" ON message_threads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "threads_insert" ON message_threads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "threads_update" ON message_threads FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for pinned_messages
CREATE POLICY "pinned_read" ON pinned_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "pinned_insert" ON pinned_messages FOR INSERT WITH CHECK (auth.uid() = pinned_by);
CREATE POLICY "pinned_delete" ON pinned_messages FOR DELETE USING (auth.uid() = pinned_by);

-- RLS Policies for typing_indicators
CREATE POLICY "typing_read" ON typing_indicators FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "typing_insert" ON typing_indicators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "typing_update" ON typing_indicators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "typing_delete" ON typing_indicators FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for search_history
CREATE POLICY "search_history_read" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "search_history_insert" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "search_history_delete" ON search_history FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_connections
CREATE POLICY "connections_read" ON user_connections FOR SELECT USING (
  auth.uid() = follower_id OR auth.uid() = following_id
);
CREATE POLICY "connections_insert" ON user_connections FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "connections_delete" ON user_connections FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for message_bookmarks
CREATE POLICY "bookmarks_read" ON message_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON message_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_update" ON message_bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON message_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_direct_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_message_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_profiles_updated_at();

CREATE TRIGGER update_direct_messages_updated_at 
    BEFORE UPDATE ON direct_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_direct_messages_updated_at();

CREATE TRIGGER update_message_threads_updated_at 
    BEFORE UPDATE ON message_threads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_message_threads_updated_at();

-- Function to update thread reply count
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'messages' THEN
        UPDATE message_threads 
        SET reply_count = (
            SELECT COUNT(*) FROM messages 
            WHERE replied_to_id = NEW.replied_to_id
        )
        WHERE parent_message_id = NEW.replied_to_id AND parent_type = 'channel';
    ELSIF TG_TABLE_NAME = 'direct_messages' THEN
        UPDATE message_threads 
        SET reply_count = (
            SELECT COUNT(*) FROM direct_messages 
            WHERE replied_to_id = NEW.replied_to_id
        )
        WHERE parent_message_id = NEW.replied_to_id AND parent_type = 'dm';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply thread reply count triggers
CREATE TRIGGER update_thread_reply_count_messages
    AFTER INSERT OR DELETE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_reply_count();

CREATE TRIGGER update_thread_reply_count_dms
    AFTER INSERT OR DELETE ON direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_reply_count();

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
    DELETE FROM typing_indicators 
    WHERE started_at < NOW() - INTERVAL '30 seconds';
END;
$$ language 'plpgsql';

-- Create a scheduled job to clean up typing indicators (if using pg_cron)
-- SELECT cron.schedule('cleanup-typing-indicators', '*/30 * * * *', 'SELECT cleanup_typing_indicators();');













