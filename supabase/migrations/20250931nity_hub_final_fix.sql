-- =========================
-- COMMUNITY HUB FINAL FIX
-- =========================
-- This migration fixes all foreign key relationships and ensures proper schema

-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "uuid-ossp";

-- =========================
-- PROFILES (linked to auth.users)
-- =========================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text check (role in ('student','mentor','graduate','admin')) default 'student',
  slack_user_id text,
  avatar_url text,
  created_at timestamp default now()
);

-- Backfill from auth.users
insert into profiles (id, email, created_at)
select u.id, u.email, now()
from auth.users u
on conflict (id) do nothing;

-- =========================
-- GROUPS
-- =========================
create table if not exists groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text check (type in ('cohort','graduate','mentor','custom')) not null,
  start_date date,
  end_date date,
  slack_channel_id text,
  created_by uuid references profiles(id) on delete set null,
  archived boolean default false,
  created_at timestamp default now()
);

-- =========================
-- GROUP MEMBERS
-- =========================
create table if not exists group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp default now(),
  unique (group_id, user_id)
);

-- Ensure FK exists
alter table group_members
drop constraint if exists fk_group_members_user,
add constraint fk_group_members_user
foreign key (user_id) references profiles(id) on delete cascade;

-- =========================
-- BUDDY PAIRS
-- =========================
create table if not exists buddy_pairs (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid references profiles(id) on delete cascade,
  user2_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending','confirmed','archived')) default 'pending',
  slack_channel_id text,
  archived boolean default false,
  created_at timestamp default now(),
  unique (user1_id, user2_id)
);

-- Ensure FKs exist
alter table buddy_pairs
drop constraint if exists fk_buddy_user1,
add constraint fk_buddy_user1
foreign key (user1_id) references profiles(id) on delete cascade;

alter table buddy_pairs
drop constraint if exists fk_buddy_user2,
add constraint fk_buddy_user2
foreign key (user2_id) references profiles(id) on delete cascade;

-- =========================
-- TRAINING SESSIONS
-- =========================
create table if not exists training_sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  slack_channel_id text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamp default now()
);

-- =========================
-- RLS: Enable + Safe Policies
-- =========================
alter table groups enable row level security;
alter table group_members enable row level security;
alter table buddy_pairs enable row level security;
alter table training_sessions enable row level security;

-- Drop old policies
do $$
declare r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('groups','group_members','buddy_pairs','training_sessions')
  ) loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end$$;

-- Groups
create policy "admins_manage_groups"
on groups for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "users_view_their_groups"
on groups for select
using (
  exists (
    select 1 from group_members gm
    where gm.group_id = groups.id
      and gm.user_id = auth.uid()
  )
);

-- Group Members
create policy "admins_manage_group_members"
on group_members for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "users_see_own_memberships"
on group_members for select
using (user_id = auth.uid());

-- Buddy Pairs
create policy "admins_manage_buddy_pairs"
on buddy_pairs for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "users_view_own_buddy_pairs"
on buddy_pairs for select
using (user1_id = auth.uid() or user2_id = auth.uid());

-- Training Sessions
create policy "admins_manage_training_sessions"
on training_sessions for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "users_view_sessions"
on training_sessions for select
using (auth.uid() is not null);

-- =========================
-- AUTO-SYNC NEW USERS
-- =========================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
