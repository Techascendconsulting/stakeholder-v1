-- Community Hub schema - safe creation (idempotent)
-- Note: requires pgcrypto/uuid-ossp for uuid_generate_v4 in some setups. Use gen_random_uuid() if available.
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Cohorts
create table if not exists public.cohorts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slack_channel_id text,
  start_date date not null,
  end_date date,
  created_at timestamp with time zone default now()
);

-- Buddy Pairs
create table if not exists public.buddy_pairs (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid references auth.users(id) on delete cascade,
  user2_id uuid references auth.users(id) on delete cascade,
  slack_channel_id text,
  created_at timestamp with time zone default now(),
  unique(user1_id, user2_id)
);

-- Training Sessions
create table if not exists public.training_sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  slack_reminder_channel text,
  created_at timestamp with time zone default now()
);

-- Extend users profile table with cohort reference if your app uses public.profiles
-- Try both common cases safely. Adjust to your actual users table.
DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cohort_id uuid references public.cohorts(id);
  ELSIF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cohort_id uuid references public.cohorts(id);
  END IF;
END $$;

-- Helpful indexes
create index if not exists idx_buddy_pairs_user1 on public.buddy_pairs(user1_id);
create index if not exists idx_buddy_pairs_user2 on public.buddy_pairs(user2_id);
create index if not exists idx_training_sessions_start_time on public.training_sessions(start_time);
create index if not exists idx_cohorts_start_date on public.cohorts(start_date);

