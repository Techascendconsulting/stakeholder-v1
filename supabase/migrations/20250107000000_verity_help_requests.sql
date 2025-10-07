-- =========================================
-- Table: help_requests
-- For Verity escalations and user support
-- =========================================

CREATE TABLE IF NOT EXISTS public.help_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  email text,
  question text NOT NULL,
  page_context text,               -- e.g. "backlog_refinement", "lesson_reflection", etc.
  page_title text,
  issue_type text,                 -- learning | technical
  status text DEFAULT 'pending',   -- pending | resolved | ignored
  assigned_to text DEFAULT 'techascendconsulting@gmail.com',
  verity_confidence numeric,       -- optional, if you add AI scoring later

  response text,                   -- your reply or Verity's logged message
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,

  metadata jsonb DEFAULT '{}'      -- optional field for storing extra info
);

-- =========================================
-- Useful indexes
-- =========================================
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_page_context ON public.help_requests(page_context);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON public.help_requests(created_at DESC);

-- =========================================
-- Row Level Security (RLS)
-- =========================================
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Allow logged-in users to insert help requests
CREATE POLICY "Users can create their own help requests"
ON public.help_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow only Joy (admin) to view and update all requests
CREATE POLICY "Admin can view and update all help requests"
ON public.help_requests
FOR ALL
USING (
  auth.email() = 'techascendconsulting@gmail.com'
);

