-- 1) Enum types
create type unit_type as enum ('module','lesson','topic');
create type progress_status as enum ('not_started','in_progress','completed','stale');

-- 2) Core content tables
create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  stable_key text not null unique,          -- e.g. "MOD_BA_FOUNDATIONS"
  title text not null,
  content jsonb default '{}'::jsonb,
  content_version int not null default 1,   -- bump only on breaking changes
  position int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  stable_key text not null unique,          -- e.g. "LES_REQUIREMENTS_INTRO"
  title text not null,
  content jsonb default '{}'::jsonb,
  content_version int not null default 1,
  position int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  stable_key text not null unique,          -- e.g. "TOP_USER_STORIES_BASICS"
  title text not null,
  content jsonb default '{}'::jsonb,
  content_version int not null default 1,
  position int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Progress table (generic across all units)
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,                    -- supabase auth uid()
  unit_type unit_type not null,
  stable_key text not null,                 -- points to modules/lessons/topics.stable_key
  content_version int not null,             -- version user last engaged
  status progress_status not null default 'not_started',
  percent numeric not null default 0,       -- 0..100
  last_position jsonb default '{}'::jsonb,  -- e.g. {"time":123.4} for video, {"page":2}
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique (user_id, unit_type, stable_key)
);

-- 4) Helpful indexes
create index if not exists idx_lessons_module on lessons(module_id);
create index if not exists idx_topics_lesson on topics(lesson_id);
create index if not exists idx_progress_user on user_progress(user_id);

-- 5) RLS
alter table modules enable row level security;
alter table lessons enable row level security;
alter table topics enable row level security;
alter table user_progress enable row level security;

-- Public can read published content (adjust if you need auth-only)
create policy "public read modules" on modules
for select using (is_published = true);

create policy "public read lessons" on lessons
for select using (is_published = true);

create policy "public read topics" on topics
for select using (is_published = true);

-- Only owner can read/write their own progress
create policy "owner read progress" on user_progress
for select using (auth.uid() = user_id);

create policy "owner upsert progress" on user_progress
for insert with check (auth.uid() = user_id);

create policy "owner update progress" on user_progress
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 6) Trigger to keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_modules_updated before update on modules
for each row execute procedure set_updated_at();
create trigger trg_lessons_updated before update on lessons
for each row execute procedure set_updated_at();
create trigger trg_topics_updated before update on topics
for each row execute procedure set_updated_at();
create trigger trg_progress_updated before update on user_progress
for each row execute procedure set_updated_at();

-- Seeding example (optional)
insert into modules (stable_key, title, position) values
('MOD_BA_FOUNDATIONS','BA Foundations',1)
on conflict (stable_key) do nothing;

insert into lessons (module_id, stable_key, title, position)
select id, 'LES_REQUIREMENTS_INTRO','Introduction to Requirements',1
from modules where stable_key='MOD_BA_FOUNDATIONS'
on conflict (stable_key) do nothing;

insert into topics (lesson_id, stable_key, title, position)
select id, 'TOP_USER_STORIES_BASICS','User Stories Basics',1
from lessons where stable_key='LES_REQUIREMENTS_INTRO'
on conflict (stable_key) do nothing;

















