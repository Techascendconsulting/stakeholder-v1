-- Create secure server-side function for device registration
-- This runs with SECURITY DEFINER so it bypasses RLS

CREATE OR REPLACE FUNCTION public.register_user_device(
  p_user_id uuid,
  p_device_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_device text;
  v_is_locked boolean;
  v_is_admin boolean;
BEGIN
  -- Get current device and lock status
  SELECT registered_device, locked, COALESCE(is_admin, false) OR COALESCE(is_super_admin, false) OR COALESCE(is_senior_admin, false)
  INTO v_current_device, v_is_locked, v_is_admin
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Admins are exempt from device lock
  IF v_is_admin THEN
    RETURN jsonb_build_object(
      'success', true,
      'locked', false,
      'message', 'Admin - device lock bypassed'
    );
  END IF;

  -- If already locked, reject
  IF v_is_locked THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', true,
      'message', 'Account is locked. Contact admin.'
    );
  END IF;

  -- If no device registered, register this one
  IF v_current_device IS NULL OR v_current_device = '' THEN
    UPDATE user_profiles
    SET registered_device = p_device_id
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'locked', false,
      'message', 'Device registered successfully'
    );
  END IF;

  -- If device matches, allow
  IF v_current_device = p_device_id THEN
    RETURN jsonb_build_object(
      'success', true,
      'locked', false,
      'message', 'Device verified'
    );
  END IF;

  -- Device mismatch - LOCK THE ACCOUNT
  UPDATE user_profiles
  SET locked = true
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', false,
    'locked', true,
    'message', 'Account locked due to multiple device login attempts'
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.register_user_device(uuid, text) TO authenticated;

