-- Community Hub v3: group_members table and archived flags (idempotent)

-- Ensure uuid extension exists
create extension if not exists "uuid-ossp";

-- group_members table for membership and counts
create table if not exists group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamp default now(),
  unique(group_id, user_id)
);

-- archived flags (safe add)
alter table if exists groups
  add column if not exists archived boolean default false;

alter table if exists buddy_pairs
  add column if not exists archived boolean default false;


