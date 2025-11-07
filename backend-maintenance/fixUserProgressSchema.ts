import { Client } from 'pg';
import { config } from 'dotenv';

// Load .env.local from the current directory (backend-maintenance)
config({ path: '.env.local' });

async function fixUserProgressSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not found in .env.local');
  }
  
  console.log('🔗 Using DATABASE_URL:', process.env.DATABASE_URL.substring(0, 30) + '...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to Postgres');

    const sql = `
BEGIN;

-- Create table if missing (idempotent)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  unit_type text NOT NULL,
  stable_key text NOT NULL,
  status text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NULL,
  progress_json jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Ensure required columns exist (safe alters)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'stable_key'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN stable_key text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'unit_type'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN unit_type text NOT NULL DEFAULT 'topic';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN status text NOT NULL DEFAULT 'in_progress';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN completed_at timestamptz NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'progress_json'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN progress_json jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END$$;

-- Normalize unit_type and status check constraints (optional but good)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_progress_unit_type_chk'
  ) THEN
    ALTER TABLE public.user_progress
    ADD CONSTRAINT user_progress_unit_type_chk
    CHECK (unit_type IN ('module','lesson','topic','assignment'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_progress_status_chk'
  ) THEN
    ALTER TABLE public.user_progress
    ADD CONSTRAINT user_progress_status_chk
    CHECK (status IN ('in_progress','completed'));
  END IF;
END$$;

-- Unique key for upsert: (user_id, unit_type, stable_key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='user_progress_user_unit_key'
  ) THEN
    ALTER TABLE public.user_progress
    ADD CONSTRAINT user_progress_user_unit_key UNIQUE (user_id, unit_type, stable_key);
  END IF;
END$$;

-- Foreign key to auth.users if not already present (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='user_progress_user_fk' AND table_name='user_progress'
  ) THEN
    ALTER TABLE public.user_progress
    ADD CONSTRAINT user_progress_user_fk
    FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
  END IF;
END$$;

-- Enable RLS and minimal policies so the frontend can read/write its own rows
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Insert policy (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_progress' AND policyname='user_progress_insert_own'
  ) THEN
    CREATE POLICY user_progress_insert_own
    ON public.user_progress FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

-- Select policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_progress' AND policyname='user_progress_select_own'
  ) THEN
    CREATE POLICY user_progress_select_own
    ON public.user_progress FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
END$$;

-- Update policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_progress' AND policyname='user_progress_update_own'
  ) THEN
    CREATE POLICY user_progress_update_own
    ON public.user_progress FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

COMMIT;
    `;

    console.log('🔧 Running schema migration...');
    await client.query(sql);
    console.log('✅ Schema migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Postgres connection closed');
  }
}

fixUserProgressSchema();

