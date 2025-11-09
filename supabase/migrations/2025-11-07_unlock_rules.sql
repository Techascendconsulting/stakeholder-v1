-- Create unlock_rules table for managing content progression requirements
create table if not exists unlock_rules (
  id uuid primary key default gen_random_uuid(),
  target_section text not null,               -- e.g. 'practice_elicitation', 'practice_requirements', 'final_project'
  required_modules text[] default '{}',       -- array of module stable_keys required to unlock
  required_assignments text[] default '{}',   -- array of assignment stable_keys required to unlock
  required_practice text[] default '{}',      -- array of practice section keys required to unlock
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add RLS policies
alter table unlock_rules enable row level security;

-- Public can read active unlock rules (so users can see what they need to unlock content)
create policy "public read active unlock rules" on unlock_rules
for select using (is_active = true);

-- Only admins can modify unlock rules (you may want to add admin check here)
create policy "admins can manage unlock rules" on unlock_rules
for all using (
  auth.uid() in (
    select user_id from user_profiles where is_admin = true or is_super_admin = true
  )
);

-- Create index for faster lookups
create index if not exists idx_unlock_rules_target on unlock_rules(target_section, is_active);

-- Verification comments (these tables should already exist from previous migrations)
-- Expected existing tables:
-- - modules (from 2025-11-07_stable_keys.sql)
-- - lessons (from 2025-11-07_stable_keys.sql)
-- - topics (from 2025-11-07_stable_keys.sql)
-- - user_progress (from 2025-11-07_stable_keys.sql)
-- - user_profiles (existing table)

create table if not exists unlock_rules (
  id uuid primary key default gen_random_uuid(),
  target_section text not null,               -- e.g. 'practice_elicitation', 'practice_requirements', 'final_project'
  required_modules text[] default '{}',       -- array of module stable_keys required to unlock
  required_assignments text[] default '{}',   -- array of assignment stable_keys required to unlock
  required_practice text[] default '{}',      -- array of practice section keys required to unlock
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add RLS policies
alter table unlock_rules enable row level security;

-- Public can read active unlock rules (so users can see what they need to unlock content)
create policy "public read active unlock rules" on unlock_rules
for select using (is_active = true);

-- Only admins can modify unlock rules (you may want to add admin check here)
create policy "admins can manage unlock rules" on unlock_rules
for all using (
  auth.uid() in (
    select user_id from user_profiles where is_admin = true or is_super_admin = true
  )
);

-- Create index for faster lookups
create index if not exists idx_unlock_rules_target on unlock_rules(target_section, is_active);

-- Verification comments (these tables should already exist from previous migrations)
-- Expected existing tables:
-- - modules (from 2025-11-07_stable_keys.sql)
-- - lessons (from 2025-11-07_stable_keys.sql)
-- - topics (from 2025-11-07_stable_keys.sql)
-- - user_progress (from 2025-11-07_stable_keys.sql)
-- - user_profiles (existing table)

create table if not exists unlock_rules (
  id uuid primary key default gen_random_uuid(),
  target_section text not null,               -- e.g. 'practice_elicitation', 'practice_requirements', 'final_project'
  required_modules text[] default '{}',       -- array of module stable_keys required to unlock
  required_assignments text[] default '{}',   -- array of assignment stable_keys required to unlock
  required_practice text[] default '{}',      -- array of practice section keys required to unlock
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add RLS policies
alter table unlock_rules enable row level security;

-- Public can read active unlock rules (so users can see what they need to unlock content)
create policy "public read active unlock rules" on unlock_rules
for select using (is_active = true);

-- Only admins can modify unlock rules (you may want to add admin check here)
create policy "admins can manage unlock rules" on unlock_rules
for all using (
  auth.uid() in (
    select user_id from user_profiles where is_admin = true or is_super_admin = true
  )
);

-- Create index for faster lookups
create index if not exists idx_unlock_rules_target on unlock_rules(target_section, is_active);

-- Verification comments (these tables should already exist from previous migrations)
-- Expected existing tables:
-- - modules (from 2025-11-07_stable_keys.sql)
-- - lessons (from 2025-11-07_stable_keys.sql)
-- - topics (from 2025-11-07_stable_keys.sql)
-- - user_progress (from 2025-11-07_stable_keys.sql)
-- - user_profiles (existing table)

create table if not exists unlock_rules (
  id uuid primary key default gen_random_uuid(),
  target_section text not null,               -- e.g. 'practice_elicitation', 'practice_requirements', 'final_project'
  required_modules text[] default '{}',       -- array of module stable_keys required to unlock
  required_assignments text[] default '{}',   -- array of assignment stable_keys required to unlock
  required_practice text[] default '{}',      -- array of practice section keys required to unlock
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add RLS policies
alter table unlock_rules enable row level security;

-- Public can read active unlock rules (so users can see what they need to unlock content)
create policy "public read active unlock rules" on unlock_rules
for select using (is_active = true);

-- Only admins can modify unlock rules (you may want to add admin check here)
create policy "admins can manage unlock rules" on unlock_rules
for all using (
  auth.uid() in (
    select user_id from user_profiles where is_admin = true or is_super_admin = true
  )
);

-- Create index for faster lookups
create index if not exists idx_unlock_rules_target on unlock_rules(target_section, is_active);

-- Verification comments (these tables should already exist from previous migrations)
-- Expected existing tables:
-- - modules (from 2025-11-07_stable_keys.sql)
-- - lessons (from 2025-11-07_stable_keys.sql)
-- - topics (from 2025-11-07_stable_keys.sql)
-- - user_progress (from 2025-11-07_stable_keys.sql)
-- - user_profiles (existing table)













