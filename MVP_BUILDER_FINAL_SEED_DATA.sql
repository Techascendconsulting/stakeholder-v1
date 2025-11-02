-- MVP Builder Final Seed Data
-- Creates 3 Epics, each with 2-3 Stories and 1-2 Acceptance Criteria
-- Uses WITH ... RETURNING for auto-wired relationships

-- ======================================
-- Epic 1: Tenant Repair Requests
-- ======================================
with inserted_epic as (
  insert into epics (id, project_id, title, description, created_by)
  values (
    gen_random_uuid(),
    null,
    'Tenant Repair Requests',
    'Epic for managing repair appointment requests from tenants',
    null
  )
  returning id
),
inserted_stories as (
  insert into stories (id, epic_id, summary, description, moscow, created_by)
  select gen_random_uuid(), inserted_epic.id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant can book a repair slot',
           'Tenant selects from available slots when submitting a repair request.',
           'Must'),
          ('Engineer can view assigned repair slots',
           'Engineer dashboard shows their scheduled appointments.',
           'Must'),
          ('Tenant can reschedule appointment',
           'Tenant updates their availability after initial booking.',
           'Should')
       ) as s(summary, description, moscow)
  returning id, summary
)
insert into acceptance_criteria (id, story_id, description)
select gen_random_uuid(), (select id from inserted_stories limit 1), ac.description
from (values
        ('A list of available slots must be shown when booking.'),
        ('A confirmation message must be sent after booking.')
     ) as ac(description);


-- ======================================
-- Epic 2: Pending Charges Visibility
-- ======================================
with inserted_epic as (
  insert into epics (id, project_id, title, description, created_by)
  values (
    gen_random_uuid(),
    null,
    'Pending Charges Visibility',
    'Epic to let tenants view upcoming charges on their dashboard',
    null
  )
  returning id
),
inserted_stories as (
  insert into stories (id, epic_id, summary, description, moscow, created_by)
  select gen_random_uuid(), inserted_epic.id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant can view upcoming charges',
           'Dashboard shows rent increases and service charges before they apply.',
           'Must'),
          ('Finance officer has fewer support calls',
           'Tenant visibility reduces calls about pending charges.',
           'Could')
       ) as s(summary, description, moscow)
  returning id, summary
)
insert into acceptance_criteria (id, story_id, description)
select gen_random_uuid(), (select id from inserted_stories limit 1), ac.description
from (values
        ('Dashboard must display pending charges with due dates.'),
        ('Charges must be clearly separated from already-paid amounts.')
     ) as ac(description);


-- ======================================
-- Epic 3: Update Emergency Contact
-- ======================================
with inserted_epic as (
  insert into epics (id, project_id, title, description, created_by)
  values (
    gen_random_uuid(),
    null,
    'Update Emergency Contact',
    'Epic to prompt tenants to update emergency contact when changing address',
    null
  )
  returning id
),
inserted_stories as (
  insert into stories (id, epic_id, summary, description, moscow, created_by)
  select gen_random_uuid(), inserted_epic.id,
         s.summary, s.description, s.moscow, null
  from inserted_epic,
       (values
          ('Tenant prompted to update emergency contact',
           'When tenant changes address, system asks for emergency contact update.',
           'Must'),
          ('Contact centre manager sees accurate contact info',
           'System prevents outdated emergency contacts during incidents.',
           'Should')
       ) as s(summary, description, moscow)
  returning id, summary
)
insert into acceptance_criteria (id, story_id, description)
select gen_random_uuid(), (select id from inserted_stories limit 1), ac.description
from (values
        ('Prompt must appear whenever an address change is saved.'),
        ('System must allow tenant to confirm or edit contact details.')
     ) as ac(description);

-- ======================================
-- Verification Queries
-- ======================================
SELECT '=== EPICS ===' as section;
SELECT id, title, description FROM public.epics ORDER BY created_at;

SELECT '=== STORIES ===' as section;
SELECT s.id, s.summary, s.moscow, e.title as epic_title
FROM public.stories s 
JOIN public.epics e ON s.epic_id = e.id 
ORDER BY s.created_at;

SELECT '=== ACCEPTANCE CRITERIA ===' as section;
SELECT ac.id, ac.description, s.summary as story_summary
FROM public.acceptance_criteria ac 
JOIN public.stories s ON ac.story_id = s.id 
ORDER BY ac.created_at;








