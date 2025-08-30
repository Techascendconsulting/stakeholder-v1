-- ========================================
-- COMMUNITY CHAT FEATURES MIGRATION
-- Adding reactions, file attachments, message editing, and more
-- ========================================

-- ========================================
-- 1. MESSAGE REACTIONS
-- ========================================

-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.cohort_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reactions
CREATE POLICY "reactions_read_cohort" ON public.message_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cohort_messages cm
    JOIN public.user_profiles up ON up.cohort_id = cm.cohort_id
    WHERE cm.id = message_reactions.message_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "reactions_insert_own" ON public.message_reactions FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "reactions_delete_own" ON public.message_reactions FOR DELETE USING (
  user_id = auth.uid()
);

-- Indexes for reactions
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_emoji ON public.message_reactions(emoji);

-- ========================================
-- 2. FILE ATTACHMENTS
-- ========================================

-- Create file attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.cohort_messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments
CREATE POLICY "attachments_read_cohort" ON public.message_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cohort_messages cm
    JOIN public.user_profiles up ON up.cohort_id = cm.cohort_id
    WHERE cm.id = message_attachments.message_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "attachments_insert_cohort" ON public.message_attachments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cohort_messages cm
    JOIN public.user_profiles up ON up.cohort_id = cm.cohort_id
    WHERE cm.id = message_attachments.message_id AND up.user_id = auth.uid()
  )
);

-- Indexes for attachments
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_type ON public.message_attachments(file_type);

-- ========================================
-- 3. MESSAGE EDITING
-- ========================================

-- Add editing fields to cohort_messages
ALTER TABLE public.cohort_messages 
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb;

-- ========================================
-- 4. TYPING INDICATORS
-- ========================================

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  is_typing BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, cohort_id)
);

-- Enable RLS
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for typing indicators
CREATE POLICY "typing_read_cohort" ON public.typing_indicators FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.cohort_id = typing_indicators.cohort_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "typing_insert_own" ON public.typing_indicators FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "typing_update_own" ON public.typing_indicators FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "typing_delete_own" ON public.typing_indicators FOR DELETE USING (
  user_id = auth.uid()
);

-- Indexes for typing indicators
CREATE INDEX IF NOT EXISTS idx_typing_indicators_cohort_id ON public.typing_indicators(cohort_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user_id ON public.typing_indicators(user_id);

-- ========================================
-- 5. MESSAGE THREADS
-- ========================================

-- Add thread fields to cohort_messages
ALTER TABLE public.cohort_messages 
ADD COLUMN IF NOT EXISTS thread_count INTEGER DEFAULT 0;

-- Create thread replies table
CREATE TABLE IF NOT EXISTS public.thread_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID REFERENCES public.cohort_messages(id) ON DELETE CASCADE NOT NULL,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.thread_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for thread replies
CREATE POLICY "thread_replies_read_cohort" ON public.thread_replies FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cohort_messages cm
    JOIN public.user_profiles up ON up.cohort_id = cm.cohort_id
    WHERE cm.id = thread_replies.parent_message_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "thread_replies_insert_cohort" ON public.thread_replies FOR INSERT WITH CHECK (
  author_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.cohort_messages cm
    JOIN public.user_profiles up ON up.cohort_id = cm.cohort_id
    WHERE cm.id = thread_replies.parent_message_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "thread_replies_update_author" ON public.thread_replies FOR UPDATE USING (
  author_user_id = auth.uid()
);

CREATE POLICY "thread_replies_delete_author" ON public.thread_replies FOR DELETE USING (
  author_user_id = auth.uid()
);

-- Indexes for thread replies
CREATE INDEX IF NOT EXISTS idx_thread_replies_parent_message_id ON public.thread_replies(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_thread_replies_author_user_id ON public.thread_replies(author_user_id);

-- ========================================
-- 6. MESSAGE PINNING
-- ========================================

-- Create pinned messages table
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.cohort_messages(id) ON DELETE CASCADE NOT NULL,
  pinned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id)
);

-- Enable RLS
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pinned messages
CREATE POLICY "pinned_read_cohort" ON public.pinned_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cohort_messages cm
    JOIN public.user_profiles up ON up.cohort_id = cm.cohort_id
    WHERE cm.id = pinned_messages.message_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "pinned_insert_cohort" ON public.pinned_messages FOR INSERT WITH CHECK (
  pinned_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.cohort_messages cm
    JOIN public.user_profiles up ON up.cohort_id = cm.cohort_id
    WHERE cm.id = pinned_messages.message_id AND up.user_id = auth.uid()
  )
);

CREATE POLICY "pinned_delete_pinner" ON public.pinned_messages FOR DELETE USING (
  pinned_by = auth.uid()
);

-- Indexes for pinned messages
CREATE INDEX IF NOT EXISTS idx_pinned_messages_message_id ON public.pinned_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_pinned_messages_pinned_by ON public.pinned_messages(pinned_by);

-- ========================================
-- 7. ENABLE REALTIME FOR NEW TABLES
-- ========================================

-- Enable realtime for new tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'message_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'message_attachments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'typing_indicators'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'thread_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.thread_replies;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pinned_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;
  END IF;
END $$;

-- ========================================
-- 8. FUNCTIONS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update thread count
CREATE OR REPLACE FUNCTION update_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.cohort_messages 
    SET thread_count = thread_count + 1 
    WHERE id = NEW.parent_message_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.cohort_messages 
    SET thread_count = thread_count - 1 
    WHERE id = OLD.parent_message_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for thread count updates
DROP TRIGGER IF EXISTS update_thread_count_trigger ON public.thread_replies;
CREATE TRIGGER update_thread_count_trigger
  AFTER INSERT OR DELETE ON public.thread_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_count();

-- Function to update edited_at timestamp
CREATE OR REPLACE FUNCTION update_edited_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.edited_at = now();
  NEW.is_edited = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for edited_at updates
DROP TRIGGER IF EXISTS update_edited_at_trigger ON public.cohort_messages;
CREATE TRIGGER update_edited_at_trigger
  BEFORE UPDATE ON public.cohort_messages
  FOR EACH ROW
  WHEN (OLD.body IS DISTINCT FROM NEW.body)
  EXECUTE FUNCTION update_edited_at();
