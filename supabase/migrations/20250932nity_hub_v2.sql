-- Community Hub schema v2 - safe creation (idempotent)
-- Note: requires pgcrypto/uuid-ossp for uuid_generate_v4 in some setups. Use gen_random_uuid() if available.
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Groups (generalized cohorts)
create table if not exists public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text default 'cohort', -- cohort, graduate, mentor, custom
  slack_channel_id text,
  start_date date,
  end_date date,
  created_at timestamp with time zone default now()
);

-- Group members (many-to-many relationship)
create table if not exists public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member', -- member, admin
  joined_at timestamp with time zone default now(),
  unique(group_id, user_id)
);

-- Buddy Pairs (updated with status)
create table if not exists public.buddy_pairs (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid references auth.users(id) on delete cascade,
  user2_id uuid references auth.users(id) on delete cascade,
  slack_channel_id text,
  status text default 'pending', -- pending, confirmed
  created_at timestamp with time zone default now(),
  unique(user1_id, user2_id)
);

-- Training Sessions (updated)
create table if not exists public.training_sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  slack_reminder_channel text,
  created_at timestamp with time zone default now()
);

-- Helpful indexes
create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_group_members_user_id on public.group_members(user_id);
create index if not exists idx_buddy_pairs_user1 on public.buddy_pairs(user1_id);
create index if not exists idx_buddy_pairs_user2 on public.buddy_pairs(user2_id);
create index if not exists idx_buddy_pairs_status on public.buddy_pairs(status);
create index if not exists idx_training_sessions_start_time on public.training_sessions(start_time);
create index if not exists idx_groups_type on public.groups(type);

-- RLS Policies (basic security)
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.buddy_pairs enable row level security;
alter table public.training_sessions enable row level security;

-- Groups policies
create policy "Users can view groups they are members of" on public.groups
  for select using (
    id in (
      select group_id from public.group_members 
      where user_id = auth.uid()
    )
  );

-- Group members policies
create policy "Users can view group members of their groups" on public.group_members
  for select using (
    group_id in (
      select group_id from public.group_members 
      where user_id = auth.uid()
    )
  );

-- Buddy pairs policies
create policy "Users can view their buddy pairs" on public.buddy_pairs
  for select using (user1_id = auth.uid() or user2_id = auth.uid());

-- Training sessions policies (all users can view)
create policy "All users can view training sessions" on public.training_sessions
  for select using (true);
