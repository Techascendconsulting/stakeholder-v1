-- Community Hub v7: Create profiles table for application user metadata
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  slack_user_id text,
  created_at timestamp default now()
);

-- Safety: ensure slack_user_id exists if profiles already existed without it
alter table if exists profiles add column if not exists slack_user_id text;


