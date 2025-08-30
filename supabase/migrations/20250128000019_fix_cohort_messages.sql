-- Fix cohort_messages table for Community Chat
-- Ensure the table exists with the correct schema

-- Create cohort_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cohort_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT,
  parent_message_id UUID REFERENCES public.cohort_messages(id) ON DELETE CASCADE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cohort_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "cohort_messages_read_cohort" ON public.cohort_messages;
DROP POLICY IF EXISTS "cohort_messages_insert_cohort" ON public.cohort_messages;
DROP POLICY IF EXISTS "cohort_messages_update_author" ON public.cohort_messages;
DROP POLICY IF EXISTS "cohort_messages_delete_author" ON public.cohort_messages;

-- Create RLS Policies for cohort_messages
CREATE POLICY "cohort_messages_read_cohort" ON public.cohort_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND cohort_id = cohort_messages.cohort_id
  )
);

CREATE POLICY "cohort_messages_insert_cohort" ON public.cohort_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND cohort_id = cohort_messages.cohort_id
  ) AND author_user_id = auth.uid()
);

CREATE POLICY "cohort_messages_update_author" ON public.cohort_messages FOR UPDATE USING (
  author_user_id = auth.uid()
) WITH CHECK (
  author_user_id = auth.uid()
);

CREATE POLICY "cohort_messages_delete_author" ON public.cohort_messages FOR DELETE USING (
  author_user_id = auth.uid()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cohort_messages_cohort_id ON public.cohort_messages(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_messages_author_user_id ON public.cohort_messages(author_user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_messages_parent_message_id ON public.cohort_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_cohort_messages_created_at ON public.cohort_messages(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_cohort_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_cohort_messages_updated_at ON public.cohort_messages;
CREATE TRIGGER update_cohort_messages_updated_at
  BEFORE UPDATE ON public.cohort_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_cohort_messages_updated_at();

-- Enable Realtime for cohort_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.cohort_messages;
