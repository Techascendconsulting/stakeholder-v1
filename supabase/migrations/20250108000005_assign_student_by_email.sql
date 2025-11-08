-- Create RPC function to assign student to cohort by email
-- Handles both existing and new users

CREATE OR REPLACE FUNCTION assign_student_by_email(
  p_cohort_id UUID,
  p_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_exists BOOLEAN;
  v_already_in_cohort BOOLEAN;
  v_result JSON;
BEGIN
  -- Normalize email
  p_email := LOWER(TRIM(p_email));
  
  -- Check if user exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  v_user_exists := FOUND;
  
  -- If user doesn't exist, create them
  IF NOT v_user_exists THEN
    -- Generate a new UUID for the user
    v_user_id := gen_random_uuid();
    
    -- Insert into auth.users (simplified - in production use proper auth flow)
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      p_email,
      crypt('temporary_password_' || gen_random_uuid()::text, gen_salt('bf')),
      NOW(), -- Auto-confirm for cohort invites
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      'authenticated',
      'authenticated'
    );
    
    -- Create user_profiles entry with defaults
    INSERT INTO public.user_profiles (
      user_id,
      display_name,
      user_type
    ) VALUES (
      v_user_id,
      SPLIT_PART(p_email, '@', 1), -- Use email prefix as display name
      'new' -- Default to 'new' user type
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Check if already in cohort
  SELECT EXISTS (
    SELECT 1 FROM public.cohort_students
    WHERE cohort_id = p_cohort_id AND user_id = v_user_id
  ) INTO v_already_in_cohort;
  
  IF v_already_in_cohort THEN
    -- Return error if already assigned
    v_result := json_build_object(
      'success', false,
      'error', 'Student is already in this cohort',
      'user_id', v_user_id
    );
  ELSE
    -- Assign to cohort
    INSERT INTO public.cohort_students (
      cohort_id,
      user_id,
      role
    ) VALUES (
      p_cohort_id,
      v_user_id,
      'student'
    );
    
    -- Return success
    v_result := json_build_object(
      'success', true,
      'user_id', v_user_id,
      'email', p_email,
      'was_new_user', NOT v_user_exists,
      'message', CASE 
        WHEN NOT v_user_exists THEN 'New student created and added to cohort. Invite email will be sent.'
        ELSE 'Student added to cohort successfully.'
      END
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION assign_student_by_email(UUID, TEXT) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ assign_student_by_email RPC function created';
END $$;

