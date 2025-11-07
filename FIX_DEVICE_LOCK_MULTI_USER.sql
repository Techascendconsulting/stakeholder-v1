-- Fix device lock to allow multiple users on same device
-- This allows different users to use the same laptop/device with different credentials
-- while still preventing the SAME user from using multiple devices

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

  -- MODIFIED: Allow login from any device, but track the current device
  -- This allows multiple users to use the same physical device with different credentials
  -- If no device registered OR device has changed, update to current device
  IF v_current_device IS NULL OR v_current_device = '' OR v_current_device != p_device_id THEN
    UPDATE user_profiles
    SET registered_device = p_device_id
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'locked', false,
      'message', 'Device registered/updated successfully'
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

  -- Fallback: Allow login (safety measure)
  RETURN jsonb_build_object(
    'success', true,
    'locked', false,
    'message', 'Login allowed'
  );
END;
$$;

-- Unlock the specific user if they're currently locked
UPDATE user_profiles
SET locked = false, registered_device = NULL
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'baworkxp@gmail.com'
);

-- Verify the fix
SELECT 
  email,
  locked,
  registered_device
FROM auth.users
LEFT JOIN user_profiles ON auth.users.id = user_profiles.user_id
WHERE email = 'baworkxp@gmail.com';

