-- Secure admin helper to add a student to a group, bypassing client-side RLS issues
-- Run this in Supabase SQL editor

CREATE OR REPLACE FUNCTION public.admin_add_member_by_email(
  p_group_id UUID,
  p_email TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_user_id UUID;
BEGIN
  -- Ensure caller is an admin (based on profiles flags)
  SELECT id INTO v_admin_id
  FROM public.profiles
  WHERE id = auth.uid()
    AND (role = 'admin' OR is_admin = TRUE OR is_super_admin = TRUE OR is_senior_admin = TRUE)
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Resolve target user id by email
  SELECT id INTO v_user_id FROM public.profiles WHERE email = p_email LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for %', p_email;
  END IF;

  -- Insert membership if not exists
  INSERT INTO public.group_members (group_id, user_id)
  SELECT p_group_id, v_user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = p_group_id AND gm.user_id = v_user_id
  );

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_add_member_by_email(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_add_member_by_email(UUID, TEXT) TO anon, authenticated;







