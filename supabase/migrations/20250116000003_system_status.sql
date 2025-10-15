-- ========================================
-- SYSTEM STATUS TABLE
-- For displaying service health on Support Centre
-- ========================================

-- Create system_status table
CREATE TABLE IF NOT EXISTS public.system_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('operational', 'maintenance', 'degraded', 'issue')),
  message text,
  updated_at timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_status_feature ON public.system_status(feature_name);
CREATE INDEX IF NOT EXISTS idx_system_status_updated ON public.system_status(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read system status (even when not logged in)
DROP POLICY IF EXISTS "anyone_can_read_system_status" ON public.system_status;
CREATE POLICY "anyone_can_read_system_status" ON public.system_status
FOR SELECT
USING (true);

-- RLS Policy: Only admins can update system status
DROP POLICY IF EXISTS "admins_can_update_system_status" ON public.system_status;
CREATE POLICY "admins_can_update_system_status" ON public.system_status
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND (is_admin = true OR is_senior_admin = true OR is_super_admin = true)
  )
);

-- Seed with initial white-labeled feature statuses
INSERT INTO public.system_status (feature_name, status, message, updated_at) VALUES
  ('voice_feedback', 'operational', 'Voice feedback is working normally.', NOW()),
  ('ai_responses', 'operational', 'AI response engine is operating normally.', NOW()),
  ('dashboard_access', 'operational', 'Dashboard access is working normally.', NOW()),
  ('core_system', 'operational', 'Core platform services are operational.', NOW())
ON CONFLICT (feature_name) 
DO UPDATE SET 
  status = EXCLUDED.status,
  message = EXCLUDED.message,
  updated_at = NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_system_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_system_status_timestamp_trigger ON public.system_status;
CREATE TRIGGER update_system_status_timestamp_trigger
  BEFORE UPDATE ON public.system_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_system_status_timestamp();

COMMENT ON TABLE public.system_status IS 'Stores system health status for Support Centre display';
COMMENT ON COLUMN public.system_status.feature_name IS 'White-labeled feature identifier (voice_feedback, ai_responses, dashboard_access, core_system)';
COMMENT ON COLUMN public.system_status.status IS 'operational, maintenance, degraded, or issue';
COMMENT ON COLUMN public.system_status.message IS 'User-friendly status message';

-- TODO: Future integration with monitoring scripts/cron jobs to auto-update status
-- TODO: Consider adding severity levels for better alerting

