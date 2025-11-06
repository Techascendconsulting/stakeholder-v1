-- Create secure server-side admin unlock function
-- This bypasses RLS and is only callable by admins

CREATE OR REPLACE FUNCTION public.admin_unlock_user(
  p_target_user_id uuid,
  p_reset_device boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_target_email text;
BEGIN
  -- Verify caller is an admin
  SELECT COALESCE(is_admin, false) OR COALESCE(is_super_admin, false) OR COALESCE(is_senior_admin, false)
  INTO v_is_admin
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can unlock user accounts'
    );
  END IF;
  
  -- Get target user email for logging
  SELECT email INTO v_target_email
  FROM auth.users
  WHERE id = p_target_user_id;
  
  -- Unlock the account
  IF p_reset_device THEN
    -- Option 2: Unlock + Reset Device
    UPDATE user_profiles
    SET 
      locked = false,
      registered_device = null
    WHERE user_id = p_target_user_id;
  ELSE
    -- Option 1: Unlock Only (keep device binding)
    UPDATE user_profiles
    SET locked = false
    WHERE user_id = p_target_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', CASE 
      WHEN p_reset_device THEN 'Account unlocked and device binding reset'
      ELSE 'Account unlocked (device binding preserved)'
    END,
    'target_user_id', p_target_user_id,
    'target_email', v_target_email,
    'reset_device', p_reset_device
  );
END;
$$;

-- Grant execute to authenticated users (admin check is inside the function)
GRANT EXECUTE ON FUNCTION public.admin_unlock_user(uuid, boolean) TO authenticated;

-- Verify function was created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'admin_unlock_user';



