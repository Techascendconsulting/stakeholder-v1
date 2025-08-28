-- Community Lounge Database Schema
-- Enhanced MVP with tags, moderation, and engagement tracking

-- Posts table with categories and engagement tracking
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'process-mapping', 'requirements', 'interview-prep', 'agile', 'stakeholders')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  system_generated BOOLEAN NOT NULL DEFAULT FALSE,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0
);

-- Post tags for better categorization
CREATE TABLE IF NOT EXISTS forum_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL CHECK (char_length(tag) <= 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, tag)
);

-- Replies with AI tracking
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE
);

-- Reactions with emoji support
CREATE TABLE IF NOT EXISTS forum_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id, emoji)
);

-- Content reports for moderation
CREATE TABLE IF NOT EXISTS forum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'offensive', 'other')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);

-- User engagement tracking
CREATE TABLE IF NOT EXISTS forum_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  posts_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  reactions_given INTEGER DEFAULT 0,
  reactions_received INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_system_generated ON forum_posts(system_generated);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_post_id ON forum_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_user_id ON forum_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_tags_post_id ON forum_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_tags_tag ON forum_post_tags(tag);
CREATE INDEX IF NOT EXISTS idx_forum_reports_created_at ON forum_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_posts
CREATE POLICY "posts_read" ON forum_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "posts_insert" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id OR system_generated = true);
CREATE POLICY "posts_update" ON forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON forum_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_replies
CREATE POLICY "replies_read" ON forum_replies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "replies_insert" ON forum_replies FOR INSERT WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));
CREATE POLICY "replies_update" ON forum_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "replies_delete" ON forum_replies FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_reactions
CREATE POLICY "reactions_read" ON forum_reactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "reactions_insert" ON forum_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON forum_reactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_post_tags
CREATE POLICY "post_tags_read" ON forum_post_tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "post_tags_insert" ON forum_post_tags FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM forum_posts WHERE id = post_id AND user_id = auth.uid()
));
CREATE POLICY "post_tags_delete" ON forum_post_tags FOR DELETE USING (EXISTS (
  SELECT 1 FROM forum_posts WHERE id = post_id AND user_id = auth.uid()
));

-- RLS Policies for forum_reports
CREATE POLICY "reports_read" ON forum_reports FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));
CREATE POLICY "reports_insert" ON forum_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_update" ON forum_reports FOR UPDATE USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- RLS Policies for forum_user_stats
CREATE POLICY "user_stats_read" ON forum_user_stats FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "user_stats_insert" ON forum_user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_stats_update" ON forum_user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_forum_posts_updated_at 
    BEFORE UPDATE ON forum_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at 
    BEFORE UPDATE ON forum_replies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_user_stats_updated_at 
    BEFORE UPDATE ON forum_user_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'forum_replies' THEN
        UPDATE forum_posts 
        SET reply_count = (
            SELECT COUNT(*) FROM forum_replies WHERE post_id = NEW.post_id
        )
        WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'forum_reactions' THEN
        UPDATE forum_posts 
        SET reaction_count = (
            SELECT COUNT(*) FROM forum_reactions WHERE post_id = NEW.post_id
        )
        WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply engagement count triggers
CREATE TRIGGER update_post_reply_count
    AFTER INSERT OR DELETE ON forum_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_post_engagement_counts();

CREATE TRIGGER update_post_reaction_count
    AFTER INSERT OR DELETE ON forum_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_post_engagement_counts();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user stats
    INSERT INTO forum_user_stats (user_id, posts_count, replies_count, reactions_given, reactions_received)
    VALUES (
        NEW.user_id,
        (SELECT COUNT(*) FROM forum_posts WHERE user_id = NEW.user_id),
        (SELECT COUNT(*) FROM forum_replies WHERE user_id = NEW.user_id),
        (SELECT COUNT(*) FROM forum_reactions WHERE user_id = NEW.user_id),
        0
    )
    ON CONFLICT (user_id) DO UPDATE SET
        posts_count = EXCLUDED.posts_count,
        replies_count = EXCLUDED.replies_count,
        reactions_given = EXCLUDED.reactions_given,
        last_activity = NOW(),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply user stats triggers
CREATE TRIGGER update_user_stats_on_post
    AFTER INSERT ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_user_stats_on_reply
    AFTER INSERT ON forum_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_user_stats_on_reaction
    AFTER INSERT ON forum_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();
