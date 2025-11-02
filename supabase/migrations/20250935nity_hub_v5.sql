-- Community Hub v5: finalize schemas per spec (idempotent)
create extension if not exists "uuid-ossp";

create table if not exists groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text check (type in ('cohort','graduate','mentor','custom')) not null,
  start_date date,
  end_date date,
  slack_channel_id text,
  created_by uuid references users(id) on delete set null,
  archived boolean default false,
  created_at timestamp default now()
);

create table if not exists group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamp default now(),
  unique (group_id, user_id)
);

create table if not exists buddy_pairs (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid references users(id) on delete cascade,
  user2_id uuid references users(id) on delete cascade,
  status text check (status in ('pending','confirmed','archived')) default 'pending',
  slack_channel_id text,
  archived boolean default false,
  created_at timestamp default now(),
  unique (user1_id, user2_id)
);

create table if not exists training_sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  slack_channel_id text,
  created_by uuid references users(id) on delete set null,
  created_at timestamp default now()
);

-- Safe alters to ensure columns exist
alter table if exists groups add column if not exists created_by uuid references users(id) on delete set null;
alter table if exists groups add column if not exists archived boolean default false;
alter table if exists groups add column if not exists created_at timestamp default now();

alter table if exists buddy_pairs add column if not exists status text default 'pending';
alter table if exists buddy_pairs add column if not exists archived boolean default false;
alter table if exists buddy_pairs add column if not exists created_at timestamp default now();

alter table if exists training_sessions add column if not exists slack_channel_id text;
alter table if exists training_sessions add column if not exists created_by uuid references users(id) on delete set null;
alter table if exists training_sessions add column if not exists created_at timestamp default now();
