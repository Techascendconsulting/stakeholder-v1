-- ======================================
-- Ensure tables exist (if not already created)
-- ======================================

create table if not exists epics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  title text not null,
  description text,
  created_by uuid,
  created_at timestamp default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  epic_id uuid references epics(id) on delete cascade,
  summary text not null,
  description text,
  moscow text, -- Must, Should, Could, Won't
  created_by uuid,
  created_at timestamp default now()
);

create table if not exists acceptance_criteria (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  description text not null,
  created_at timestamp default now()
);

-- ======================================
-- Seed Epic 1: Tenant Repair Requests
-- ======================================
with inserted_epic as (
  insert into epics (project_id, title, description, created_by)
  values (null, 'Tenant Repair Requests', 'Epic for managing repair appointment requests from tenants', null)
  on conflict do nothing
  returning id
),
inserted_stories as (
  insert into stories (epic_id, summary, description, moscow, created_by)
  select id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant can book a repair slot', 'Tenant selects from available slots when submitting a repair request.', 'Must'),
          ('Engineer can view assigned repair slots', 'Engineer dashboard shows their scheduled appointments.', 'Must'),
          ('Tenant can reschedule appointment', 'Tenant updates their availability after initial booking.', 'Should')
       ) as s(summary, description, moscow)
  on conflict do nothing
  returning id, summary
)
insert into acceptance_criteria (story_id, description)
select (select id from inserted_stories where summary = 'Tenant can book a repair slot'),
       ac.description
from (values
        ('A list of available slots must be shown when booking.'),
        ('A confirmation message must be sent after booking.')
     ) as ac(description)
on conflict do nothing;


-- ======================================
-- Seed Epic 2: Pending Charges Visibility
-- ======================================
with inserted_epic as (
  insert into epics (project_id, title, description, created_by)
  values (null, 'Pending Charges Visibility', 'Epic to let tenants view upcoming charges on their dashboard', null)
  on conflict do nothing
  returning id
),
inserted_stories as (
  insert into stories (epic_id, summary, description, moscow, created_by)
  select id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant can view upcoming charges', 'Dashboard shows rent increases and service charges before they apply.', 'Must'),
          ('Finance officer has fewer support calls', 'Tenant visibility reduces calls about pending charges.', 'Could')
       ) as s(summary, description, moscow)
  on conflict do nothing
  returning id, summary
)
insert into acceptance_criteria (story_id, description)
select (select id from inserted_stories where summary = 'Tenant can view upcoming charges'),
       ac.description
from (values
        ('Dashboard must display pending charges with due dates.'),
        ('Charges must be clearly separated from already-paid amounts.')
     ) as ac(description)
on conflict do nothing;


-- ======================================
-- Seed Epic 3: Update Emergency Contact
-- ======================================
with inserted_epic as (
  insert into epics (project_id, title, description, created_by)
  values (null, 'Update Emergency Contact', 'Epic to prompt tenants to update emergency contact when changing address', null)
  on conflict do nothing
  returning id
),
inserted_stories as (
  insert into stories (epic_id, summary, description, moscow, created_by)
  select id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant prompted to update emergency contact', 'When tenant changes address, system asks for emergency contact update.', 'Must'),
          ('Contact centre manager sees accurate contact info', 'System prevents outdated emergency contacts during incidents.', 'Should')
       ) as s(summary, description, moscow)
  on conflict do nothing
  returning id, summary
)
insert into acceptance_criteria (story_id, description)
select (select id from inserted_stories where summary = 'Tenant prompted to update emergency contact'),
       ac.description
from (values
        ('Prompt must appear whenever an address change is saved.'),
        ('System must allow tenant to confirm or edit contact details.')
     ) as ac(description)
on conflict do nothing;

















