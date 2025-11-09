# Cohorts Feature - Setup Complete

## Overview

The Cohorts feature allows admins and coaches to organize learners into groups with scheduled sessions. This document outlines what was created and how to use it.

---

## 1. Database Schema

### Tables Created

#### `cohorts`
Main cohort/group table with coach assignment.

**Columns:**
- `id` (UUID, primary key)
- `name` (text, required)
- `start_date` (date, required)
- `end_date` (date, nullable)
- `coach_user_id` (UUID, references auth.users, nullable)
- `visibility_scope` ('public' | 'private' | 'draft')
- `description` (text, nullable)
- `max_capacity` (integer, nullable)
- `status` ('active' | 'archived' | 'upcoming' | 'completed')
- `created_by` (UUID, references auth.users)
- `created_at`, `updated_at` (timestamps)

#### `cohort_students`
Junction table linking students to cohorts (many-to-many).

**Columns:**
- `id` (UUID, primary key)
- `cohort_id` (UUID, references cohorts, required)
- `user_id` (UUID, references auth.users, required)
- `joined_at` (timestamp)
- `status` ('active' | 'inactive' | 'removed')
- `notes` (text, nullable)
- **Unique constraint:** `(cohort_id, user_id)`

#### `cohort_sessions`
Individual scheduled sessions for each cohort.

**Columns:**
- `id` (UUID, primary key)
- `cohort_id` (UUID, references cohorts, required)
- `session_date` (timestamp, required)
- `session_end_time` (timestamp, nullable)
- `meeting_link` (text, required)
- `topic` (text, nullable)
- `description` (text, nullable)
- `status` ('scheduled' | 'completed' | 'cancelled')
- `created_by` (UUID, references auth.users)
- `created_at`, `updated_at` (timestamps)

---

## 2. Row Level Security (RLS) Policies

### Cohorts Table
- **Admins**: Full CRUD access
- **Coaches**: Can read and update their own cohorts (where `coach_user_id = auth.uid()`)
- **Students**: Can read cohorts they're assigned to, or public cohorts

### Cohort_Students Table
- **Admins**: Full CRUD access
- **Coaches**: Can manage students in their cohorts
- **Students**: Can read their own assignments only

### Cohort_Sessions Table
- **Admins**: Full CRUD access
- **Coaches**: Can CRUD sessions for their cohorts
- **Students**: Can read sessions for cohorts they're assigned to

---

## 3. TypeScript Interfaces

Located in: `src/types/cohorts.ts`

**Main interfaces:**
```typescript
Cohort
CohortStudent
CohortSession
CohortWithDetails
UserCohortInfo
CreateCohortRequest
UpdateCohortRequest
CreateCohortSessionRequest
UpdateCohortSessionRequest
AssignStudentRequest
```

---

## 4. Helper Functions

Located in: `src/utils/cohortHelpers.ts`

### Cohort Queries
- `getUserCohort(userId)` - Get user's active cohort with upcoming sessions
- `getAllCohorts(filters?)` - Get all cohorts (admin view)
- `getCohortById(cohortId)` - Get cohort details with student count
- `createCohort(cohortData, createdBy)` - Create new cohort
- `updateCohort(cohortId, updates)` - Update existing cohort
- `deleteCohort(cohortId)` - Delete cohort (cascades to students/sessions)

### Student Assignment
- `assignStudentToCohort(assignment)` - Assign student to cohort
- `removeStudentFromCohort(cohortId, userId)` - Remove student
- `getCohortStudents(cohortId)` - Get all students in cohort

### Session Management
- `getCohortSessions(cohortId, includeCompleted?)` - Get all sessions
- `scheduleCohortSession(sessionData, createdBy)` - Create new session
- `updateCohortSession(sessionId, changes)` - Update session
- `deleteCohortSession(sessionId)` - Delete session
- `getNextCohortSession(cohortId)` - Get next upcoming session

### Utilities
- `isUserCoachForCohort(userId, cohortId)` - Check coach status
- `formatSessionDateTime(sessionDate, timezone)` - Format dates
- `isSessionStartingSoon(sessionDate)` - Check if session starts within 30 min

---

## 5. How to Apply the Migration

### Option A: Run SQL in Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250108000000_create_cohorts.sql`
3. Paste and click **Run**
4. Verify success message: "✅ Cohorts feature tables created successfully"

### Option B: Run via Supabase CLI (if installed)
```bash
cd /Users/joyoby/stakeholder-v1
supabase db push
```

---

## 6. Usage Examples

### Get User's Cohort (for Dashboard)
```typescript
import { getUserCohort } from '@/utils/cohortHelpers';

const cohortInfo = await getUserCohort(user.id);

if (cohortInfo) {
  console.log('Cohort Name:', cohortInfo.cohort.name);
  console.log('Next Session:', cohortInfo.next_session?.session_date);
}
```

### Create a Cohort (Admin)
```typescript
import { createCohort } from '@/utils/cohortHelpers';

const newCohort = await createCohort({
  name: 'BA Fundamentals - January 2025',
  start_date: '2025-01-15',
  end_date: '2025-04-15',
  coach_user_id: coachUserId,
  visibility_scope: 'public',
  status: 'upcoming'
}, adminUserId);
```

### Schedule a Session (Coach or Admin)
```typescript
import { scheduleCohortSession } from '@/utils/cohortHelpers';

const session = await scheduleCohortSession({
  cohort_id: cohortId,
  session_date: '2025-01-20T18:00:00Z',
  session_end_time: '2025-01-20T19:30:00Z',
  meeting_link: 'https://zoom.us/j/123456789',
  topic: 'Introduction to Requirements Gathering',
  status: 'scheduled'
}, userId);
```

### Assign Students to Cohort (Admin/Coach)
```typescript
import { assignStudentToCohort } from '@/utils/cohortHelpers';

await assignStudentToCohort({
  cohort_id: cohortId,
  user_id: studentUserId,
  notes: 'Transferred from previous cohort'
});
```

---

## 7. Next Steps (UI Implementation)

### Admin Panel Integration
1. Add **"Cohorts"** tab to `AdminPanel.tsx` (between Users and Support)
2. Create cohort management UI:
   - List all cohorts (table with name, start date, coach, student count, status)
   - Create/Edit cohort form
   - Assign/remove students (search and select)
   - Schedule sessions for each cohort

### Dashboard Display
1. In `Dashboard.tsx`, call `getUserCohort(user.id)`
2. If cohort exists, display:
   ```tsx
   <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
     <div className="font-semibold">Your Cohort: {cohortInfo.cohort.name}</div>
     {cohortInfo.next_session && (
       <>
         <div className="text-sm opacity-80 mt-1">
           Next Session: {formatSessionDateTime(cohortInfo.next_session.session_date)}
         </div>
         <a 
           href={cohortInfo.next_session.meeting_link} 
           target="_blank" 
           rel="noopener noreferrer"
           className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
         >
           Join Live Session
         </a>
       </>
     )}
   </div>
   ```

---

## 8. Files Created

1. **Migration:** `supabase/migrations/20250108000000_create_cohorts.sql`
2. **Types:** `src/types/cohorts.ts`
3. **Helpers:** `src/utils/cohortHelpers.ts`
4. **Documentation:** `COHORTS_FEATURE_SETUP.md` (this file)

---

## 9. Permission Requirements

To create/edit cohorts or sessions, users must have:
- `is_admin = true` OR
- `is_super_admin = true` OR
- `is_senior_admin = true` OR
- Be the assigned coach (`coach_user_id`)

These fields are checked in the `user_profiles` table.

---

## 10. Testing Checklist

- [ ] Run migration in Supabase
- [ ] Verify tables created with correct schema
- [ ] Test RLS policies (admin, coach, student views)
- [ ] Create test cohort
- [ ] Assign test student
- [ ] Schedule test session
- [ ] Verify `getUserCohort()` returns correct data
- [ ] Integrate into Dashboard UI
- [ ] Integrate into Admin Panel UI

---

**Status:** Backend complete, ready for UI integration.


