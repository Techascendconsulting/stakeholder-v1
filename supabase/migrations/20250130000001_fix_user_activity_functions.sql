-- Fix the get_recent_user_activity function return type issue
-- Drop and recreate the function with correct return types

DROP FUNCTION IF EXISTS get_recent_user_activity(INTEGER);

CREATE OR REPLACE FUNCTION get_recent_user_activity(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email VARCHAR(255),
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
    au.email::VARCHAR(255) as user_email,
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_recent_user_activity(INTEGER) TO authenticated;

-- Also fix the log_user_activity function to handle unknown users better
CREATE OR REPLACE FUNCTION log_user_activity(
  user_uuid TEXT, -- Changed from UUID to TEXT to handle 'unknown-user'
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
  actual_user_id UUID;
BEGIN
  -- Handle 'unknown-user' case
  IF user_uuid = 'unknown-user' THEN
    actual_user_id := NULL; -- Allow NULL for unknown users
  ELSE
    actual_user_id := user_uuid::UUID;
  END IF;
  
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
    actual_user_id,
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

-- Update the table to allow NULL user_id for unknown users
ALTER TABLE user_activity_logs ALTER COLUMN user_id DROP NOT NULL;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_user_activity(TEXT, TEXT, TEXT, INET, TEXT, TEXT, BOOLEAN, TEXT, JSONB) TO authenticated;














