-- Create comprehensive user activity logs table for legal proofing and audit trails
-- This table will track all user activities including sign-ins, last active times, and security events

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'sign_in', 'sign_out', 'last_active', 'device_lock_failed', 'password_reset', etc.
  device_id TEXT, -- Device fingerprint for tracking
  ip_address INET, -- IP address for security tracking
  user_agent TEXT, -- Browser/device information
  session_id TEXT, -- Session identifier
  success BOOLEAN DEFAULT true, -- Whether the activity was successful
  failure_reason TEXT, -- Reason for failure if success = false
  metadata JSONB DEFAULT '{}', -- Additional activity-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_device_id ON user_activity_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_ip_address ON user_activity_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_success ON user_activity_logs(success);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_activity_created ON user_activity_logs(user_id, activity_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs" ON user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON user_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
    )
  );

-- System can insert activity logs (for automated logging)
CREATE POLICY "System can insert activity logs" ON user_activity_logs
  FOR INSERT WITH CHECK (true);

-- Create function to get user's last activity
CREATE OR REPLACE FUNCTION get_user_last_activity(user_uuid UUID)
RETURNS TABLE (
  last_sign_in TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE,
  total_sign_ins BIGINT,
  failed_sign_ins BIGINT,
  unique_devices BIGINT,
  unique_ips BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    MAX(CASE WHEN activity_type = 'sign_in' AND success = true THEN created_at END) as last_sign_in,
    MAX(CASE WHEN activity_type = 'last_active' THEN created_at END) as last_active,
    COUNT(CASE WHEN activity_type = 'sign_in' AND success = true THEN 1 END) as total_sign_ins,
    COUNT(CASE WHEN activity_type = 'sign_in' AND success = false THEN 1 END) as failed_sign_ins,
    COUNT(DISTINCT device_id) as unique_devices,
    COUNT(DISTINCT ip_address) as unique_ips
  FROM user_activity_logs 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recent activity for admin dashboard
CREATE OR REPLACE FUNCTION get_recent_user_activity(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  activity_type TEXT,
  device_id TEXT,
  ip_address INET,
  success BOOLEAN,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ual.id,
    ual.user_id,
    au.email as user_email,
    ual.activity_type,
    ual.device_id,
    ual.ip_address,
    ual.success,
    ual.failure_reason,
    ual.created_at
  FROM user_activity_logs ual
  JOIN auth.users au ON ual.user_id = au.id
  ORDER BY ual.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  user_uuid UUID,
  activity_type_param TEXT,
  device_id_param TEXT DEFAULT NULL,
  ip_address_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  session_id_param TEXT DEFAULT NULL,
  success_param BOOLEAN DEFAULT true,
  failure_reason_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO user_activity_logs (
    user_id,
    activity_type,
    device_id,
    ip_address,
    user_agent,
    session_id,
    success,
    failure_reason,
    metadata
  ) VALUES (
    user_uuid,
    activity_type_param,
    device_id_param,
    ip_address_param,
    user_agent_param,
    session_id_param,
    success_param,
    failure_reason_param,
    metadata_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_last_activity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_user_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity(UUID, TEXT, TEXT, INET, TEXT, TEXT, BOOLEAN, TEXT, JSONB) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE user_activity_logs IS 'Comprehensive audit trail for all user activities including sign-ins, device usage, and security events';
COMMENT ON COLUMN user_activity_logs.activity_type IS 'Type of activity: sign_in, sign_out, last_active, device_lock_failed, password_reset, etc.';
COMMENT ON COLUMN user_activity_logs.device_id IS 'Device fingerprint for tracking device usage patterns';
COMMENT ON COLUMN user_activity_logs.metadata IS 'Additional activity-specific data in JSON format';
COMMENT ON FUNCTION get_user_last_activity(UUID) IS 'Get comprehensive activity summary for a specific user';
COMMENT ON FUNCTION get_recent_user_activity(INTEGER) IS 'Get recent activity logs for admin dashboard';
COMMENT ON FUNCTION log_user_activity(UUID, TEXT, TEXT, INET, TEXT, TEXT, BOOLEAN, TEXT, JSONB) IS 'Log user activity with comprehensive tracking data';
















