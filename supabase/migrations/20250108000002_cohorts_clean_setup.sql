-- ====================================================================
-- COHORTS CLEAN SETUP - Uses cohort_live_sessions to avoid conflicts
-- Creates cohorts, cohort_students, cohort_live_sessions with RLS
-- Seeds initial cohort and session for testing
-- ====================================================================

-- helper for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- cohorts table
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  coach_user_id uuid references auth.users(id),
  status text not null default 'active' check (status in ('draft','active','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cohorts
  add column if not exists description text,
  add column if not exists coach_user_id uuid references auth.users(id),
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Add check constraint if not exists
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cohorts_status_check' and conrelid = 'public.cohorts'::regclass) then
    alter table public.cohorts add constraint cohorts_status_check check (status in ('draft','active','archived'));
  end if;
exception when others then
  null;
end $$;

drop trigger if exists trg_cohorts_updated_at on public.cohorts;
create trigger trg_cohorts_updated_at
before update on public.cohorts
for each row execute function public.set_updated_at();

-- cohort_students (junction)
create table if not exists public.cohort_students (
  cohort_id uuid references public.cohorts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'student' check (role in ('student','coach')),
  joined_at timestamptz default now(),
  primary key (cohort_id, user_id)
);

-- Add role column if missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cohort_students' and column_name='role') then
    alter table public.cohort_students add column role text default 'student' check (role in ('student','coach'));
  end if;
end $$;

-- cohort_live_sessions (NEW TABLE NAME to avoid conflicts)
create table if not exists public.cohort_live_sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid references public.cohorts(id) on delete cascade,
  starts_at timestamptz not null,
  duration_minutes int default 60,
  meeting_link text,
  topic text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists trg_cohort_live_sessions_updated_at on public.cohort_live_sessions;
create trigger trg_cohort_live_sessions_updated_at
before update on public.cohort_live_sessions
for each row execute function public.set_updated_at();

-- RLS
alter table public.cohorts enable row level security;
alter table public.cohort_students enable row level security;
alter table public.cohort_live_sessions enable row level security;

-- READ: allow authenticated users to read
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cohorts' and policyname='cohorts_read_authenticated') then
    create policy "cohorts_read_authenticated" on public.cohorts for select
      using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cohort_students' and policyname='cohort_students_read_authenticated') then
    create policy "cohort_students_read_authenticated" on public.cohort_students for select
      using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cohort_live_sessions' and policyname='cohort_live_sessions_read_authenticated') then
    create policy "cohort_live_sessions_read_authenticated" on public.cohort_live_sessions for select
      using (auth.role() = 'authenticated');
  end if;
end $$;

-- WRITE: admins and coaches only
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cohorts' and policyname='cohorts_write_admin_or_coach') then
    create policy "cohorts_write_admin_or_coach" on public.cohorts for all
      using (
        exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and (up.is_admin or up.is_super_admin))
        or coach_user_id = auth.uid()
      )
      with check (
        exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and (up.is_admin or up.is_super_admin))
        or coach_user_id = auth.uid()
      );
  end if;
end $$;

-- SEED one cohort and assign Joy as coach
insert into public.cohorts (id, name, description, coach_user_id, status)
values (
  'b6904011-acaf-49e5-ac43-51b77bd32d63',
  'January BA WorkXP Cohort',
  'Guided group learning with live sessions and accountability.',
  'd417f9f5-2e1f-41b3-8273-3111996dbdb4',
  'active'
)
on conflict (id) do update
set name=excluded.name,
    description=excluded.description,
    coach_user_id=excluded.coach_user_id,
    status=excluded.status;

insert into public.cohort_students (cohort_id, user_id, role)
values ('b6904011-acaf-49e5-ac43-51b77bd32d63','d417f9f5-2e1f-41b3-8273-3111996dbdb4','coach')
on conflict do nothing;

-- Add one upcoming session
insert into public.cohort_live_sessions (id, cohort_id, starts_at, duration_minutes, meeting_link, topic)
values (
  'e8f42a1c-7b9d-4e5a-a3c2-9f1d8e6b4c7a',
  'b6904011-acaf-49e5-ac43-51b77bd32d63',
  (now() + interval '3 days') at time zone 'UTC',
  60,
  'https://zoom.us/j/1234567890',
  'Kickoff & Study Plan'
)
on conflict (id) do nothing;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Cohorts clean setup migration applied successfully (using cohort_live_sessions)';
END $$;



