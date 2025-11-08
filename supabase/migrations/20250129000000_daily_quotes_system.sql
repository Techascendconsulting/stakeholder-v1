-- Daily Quotes System Setup
-- This migration sets up the infrastructure for automated daily motivational quotes

-- Create a system user for automated posts
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@baworkxp.com',
  crypt('system-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "system", "providers": ["system"]}',
  '{"name": "BA WorkXP Platform", "avatar_url": null, "role": "system"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create a table to track daily quote posts
CREATE TABLE IF NOT EXISTS daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text TEXT NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  channels_posted_to TEXT[], -- Array of channel names
  spaces_posted_to TEXT[], -- Array of space names
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors TEXT[], -- Array of error messages
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for tracking
CREATE INDEX IF NOT EXISTS idx_daily_quotes_posted_at ON daily_quotes(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_quotes_success ON daily_quotes(success_count);

-- Enable RLS
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_quotes (read-only for authenticated users)
CREATE POLICY "daily_quotes_read" ON daily_quotes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "daily_quotes_insert" ON daily_quotes FOR INSERT WITH CHECK (auth.uid() = '00000000-0000-0000-0000-000000000000');

-- Function to log daily quote posts
CREATE OR REPLACE FUNCTION log_daily_quote(
  quote_text TEXT,
  channels_posted_to TEXT[],
  spaces_posted_to TEXT[],
  success_count INTEGER,
  error_count INTEGER,
  errors TEXT[]
)
RETURNS UUID AS $$
DECLARE
  quote_id UUID;
BEGIN
  INSERT INTO daily_quotes (
    quote_text,
    channels_posted_to,
    spaces_posted_to,
    success_count,
    error_count,
    errors
  ) VALUES (
    quote_text,
    channels_posted_to,
    spaces_posted_to,
    success_count,
    error_count,
    errors
  ) RETURNING id INTO quote_id;
  
  RETURN quote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quote statistics
CREATE OR REPLACE FUNCTION get_daily_quote_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_quotes INTEGER,
  total_success INTEGER,
  total_errors INTEGER,
  avg_success_rate NUMERIC,
  most_active_day TEXT,
  quotes_today INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_quotes,
    SUM(success_count)::INTEGER as total_success,
    SUM(error_count)::INTEGER as total_errors,
    ROUND(
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (SUM(success_count)::NUMERIC / (SUM(success_count) + SUM(error_count))) * 100
        ELSE 0 
      END, 2
    ) as avg_success_rate,
    TO_CHAR(posted_at, 'Day') as most_active_day,
    COUNT(*) FILTER (WHERE DATE(posted_at) = CURRENT_DATE)::INTEGER as quotes_today
  FROM daily_quotes 
  WHERE posted_at >= CURRENT_DATE - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_daily_quote TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_quote_stats TO authenticated;

-- Create a view for easy access to recent quotes
CREATE OR REPLACE VIEW recent_daily_quotes AS
SELECT 
  id,
  quote_text,
  posted_at,
  channels_posted_to,
  spaces_posted_to,
  success_count,
  error_count,
  created_at
FROM daily_quotes
ORDER BY posted_at DESC;

-- Grant access to the view
GRANT SELECT ON recent_daily_quotes TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE daily_quotes IS 'Tracks daily motivational quotes posted by the system to cohort channels';
COMMENT ON FUNCTION log_daily_quote IS 'Logs a daily quote post with success/error statistics';
COMMENT ON FUNCTION get_daily_quote_stats IS 'Returns statistics about daily quote posts over a specified period';





























