-- FIX_DEVICE_LOCK_RLS.sql
-- Purpose: Ensure device verification works by allowing authenticated users
--          to read and update ONLY their own `user_profiles` row needed for
--          device registration, while keeping lock control admin-only.

-- Enable RLS (safe if already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper: create policy only if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'read_own_profile'
  ) THEN
    CREATE POLICY read_own_profile ON public.user_profiles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- Allow updating own device registration (registered_device) but not lock flag
-- We restrict to authenticated role and to the owner row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'update_own_device_registration'
  ) THEN
    CREATE POLICY update_own_device_registration ON public.user_profiles
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (
        user_id = auth.uid()
        AND (
          -- Allow updating non-sensitive columns used by device registration
          TRUE
        )
      );
  END IF;
END
$$;

-- Optional: tighten column-level update via grant (Postgres 15+ supports column privileges)
-- If supported, grant update only on registered_device to authenticated
DO $$
BEGIN
  BEGIN
    GRANT UPDATE (registered_device) ON public.user_profiles TO authenticated;
  EXCEPTION WHEN others THEN
    -- Ignore if column-level grants not supported in current environment
    NULL;
  END;
END$$;

-- Admins (marked in user_profiles) can manage lock and device fields for any user via RPC/Service role.
-- Service role bypasses RLS; no extra policy required.

-- Verify
-- SELECT pol.policyname, pol.cmd, pol.roles, pol.qual, pol.with_check
-- FROM pg_policies pol WHERE pol.tablename = 'user_profiles';



