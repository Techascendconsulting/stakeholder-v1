-- Admin helper functions: promote/revoke admins by email
-- Run in Supabase SQL editor

-- Promote a user to admin (options to set super/senior)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(
  p_email TEXT,
  p_is_super_admin BOOLEAN DEFAULT FALSE,
  p_is_senior_admin BOOLEAN DEFAULT FALSE
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find auth user id by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email::TEXT LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users', p_email;
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (v_user_id, p_email, split_part(p_email, '@', 1), 'student')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- Set admin flags
  UPDATE public.profiles
  SET 
    role = 'admin',
    is_admin = TRUE,
    is_super_admin = COALESCE(p_is_super_admin, FALSE),
    is_senior_admin = COALESCE(p_is_senior_admin, FALSE)
  WHERE id = v_user_id;
END;
$$;

-- Revoke admin privileges
CREATE OR REPLACE FUNCTION public.revoke_admin(
  p_email TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email::TEXT LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users', p_email;
  END IF;

  UPDATE public.profiles
  SET 
    is_admin = FALSE,
    is_super_admin = FALSE,
    is_senior_admin = FALSE,
    role = 'student'
  WHERE id = v_user_id;
END;
$$;

-- Quick checks
-- SELECT promote_user_to_admin('someone@example.com');
-- SELECT promote_user_to_admin('someone@example.com', TRUE); -- super admin
-- SELECT revoke_admin('someone@example.com');

















