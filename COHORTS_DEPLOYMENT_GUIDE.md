# Cohorts Feature - Deployment Guide

## Status: Ready for Staging Testing

All cohorts feature code has been pushed to the **staging** branch.

---

## 1. Database Migration (REQUIRED FIRST STEP)

Before testing, you **MUST** run the SQL migration in Supabase:

### Steps:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of: `supabase/migrations/20250108000002_cohorts_clean_setup.sql`
3. Paste and click **Run**
4. Verify success: Should see "✅ Cohorts clean setup migration applied successfully (using cohort_live_sessions)"

### What the Migration Does:
- Creates `cohorts` table (id, name, description, coach_user_id, status)
- Creates `cohort_students` junction table (cohort_id, user_id, role, joined_at)
- Creates `cohort_live_sessions` table (id, cohort_id, starts_at, duration_minutes, meeting_link, topic)
- **Uses `cohort_live_sessions` to avoid conflicts with any existing `cohort_sessions` table**
- Sets up RLS policies (authenticated read, admin/coach write)
- Seeds test cohort: **"January BA WorkXP Cohort"**
- Assigns Joy (d417f9f5-2e1f-41b3-8273-3111996dbdb4) as coach
- Creates test session 3 days in future

---

## 2. Verify Frontend Wiring

All frontend changes are already in place:

✅ **Sidebar**: "My Cohort" menu item visible to all users  
✅ **Routing**: `/my-cohort` route configured in MainLayout  
✅ **Types**: `'my-cohort'` added to AppView  
✅ **Navigation**: Added to alwaysAllowed in AppContext  
✅ **Breadcrumbs**: My Cohort breadcrumb configured  
✅ **Dashboard**: Promotional card for non-enrolled users  

---

## 3. Testing Checklist

### A. Test as Joy (Coach User)

**Email**: baworkxp@gmail.com  
**User ID**: d417f9f5-2e1f-41b3-8273-3111996dbdb4  
**Expected**: Joy is assigned as coach to the test cohort

**Steps**:
1. Sign in as Joy
2. Click "My Cohort" in sidebar
3. **Expected to see**:
   - Cohort Dashboard (NOT upsell screen)
   - Cohort name: "January BA WorkXP Cohort"
   - Description: "Guided group learning with live sessions and accountability."
   - Status badge: "active"
   - Next Live Session card with:
     - Topic: "Kickoff & Study Plan"
     - Date/time in UK timezone (3 days from migration run)
     - "Join Live Session" button → https://zoom.us/j/1234567890
   - Upcoming Sessions list with the same session

4. Check Dashboard:
   - **Should NOT** see cohort promotional card (Joy is enrolled)

### B. Test as Non-Enrolled User

**Any user who is NOT in cohort_students table**

**Steps**:
1. Sign in as different user
2. Check Dashboard:
   - **SHOULD** see purple promotional card:
     - "Want support while learning?"
     - "Join a cohort and progress with others..."
     - "Request to Join" button

3. Click "My Cohort" in sidebar:
   - **SHOULD** see upsell screen:
     - "Progress is easier when you're not doing it alone."
     - "Learn alongside others, stay accountable, and get guidance as you progress."
     - "Request to Join Cohort" button

4. Click "Request to Join Cohort" button:
   - **SHOULD** open WhatsApp with pre-filled message:
     ```
     Hi team, I'd like to join the cohort. Can you help me get started?
     ```

---

## 4. Debug Console Logs

The feature includes debug logging. Open browser console to see:

```
🔍 getUserCohort: Looking up cohort for user: [user_id]
📭 getUserCohort: No cohort assignment found for user  // If not enrolled
✅ getUserCohort: Found cohort assignment: [cohort_id]  // If enrolled
✅ getUserCohort: Found cohort: January BA WorkXP Cohort
✅ getUserCohort: Found 1 upcoming sessions
```

---

## 5. Database Verification

After running migration, verify in Supabase Dashboard → Table Editor:

### Check `cohorts` table:
- Should have 1 row
- id: b6904011-acaf-49e5-ac43-51b77bd32d63
- name: January BA WorkXP Cohort
- coach_user_id: d417f9f5-2e1f-41b3-8273-3111996dbdb4
- status: active

### Check `cohort_students` table:
- Should have 1 row
- cohort_id: b6904011-acaf-49e5-ac43-51b77bd32d63
- user_id: d417f9f5-2e1f-41b3-8273-3111996dbdb4
- role: coach

### Check `cohort_live_sessions` table:
- Should have 1 row
- cohort_id: b6904011-acaf-49e5-ac43-51b77bd32d63
- starts_at: [now + 3 days]
- duration_minutes: 60
- meeting_link: https://zoom.us/j/1234567890
- topic: Kickoff & Study Plan

---

## 6. Common Issues & Fixes

### Issue: "No cohort found"
**Fix**: Run the SQL migration in Supabase

### Issue: Joy sees upsell screen instead of dashboard
**Fix**: Verify `cohort_students` table has Joy's user_id assigned

### Issue: "Join Live Session" button missing
**Fix**: Check that `meeting_link` field is populated in `cohort_sessions`

### Issue: Date/time not formatted correctly
**Fix**: Verify `formatSessionDateTime()` is using Europe/London timezone

### Issue: Dashboard promo card shows for enrolled users
**Fix**: Check that `getUserCohort()` is returning data correctly

---

## 7. Schema Reference

### Simplified Schema (matches migration):

```sql
-- cohorts
id uuid PK
name text NOT NULL
description text
coach_user_id uuid FK → auth.users(id)
status text CHECK (draft|active|archived)
created_at timestamptz
updated_at timestamptz

-- cohort_students
cohort_id uuid FK → cohorts(id) ON DELETE CASCADE
user_id uuid FK → auth.users(id) ON DELETE CASCADE
role text CHECK (student|coach)
joined_at timestamptz
PRIMARY KEY (cohort_id, user_id)

-- cohort_live_sessions (renamed to avoid conflicts)
id uuid PK
cohort_id uuid FK → cohorts(id) ON DELETE CASCADE
starts_at timestamptz NOT NULL
duration_minutes int
meeting_link text
topic text
created_at timestamptz
updated_at timestamptz
```

---

## 8. Next Steps After Testing

Once staging is verified:

1. **Test all user flows** (enrolled vs non-enrolled)
2. **Verify WhatsApp links** open correctly
3. **Check responsive design** (mobile, tablet, desktop)
4. **Confirm dark mode** displays correctly
5. **Test session join links** work as expected

After successful staging testing and approval:
- Merge staging → main for production deployment

---

## Files Modified/Created

### New Files:
- `supabase/migrations/20250108000002_cohorts_clean_setup.sql` (CURRENT - use this one!)
- ~~`supabase/migrations/20250108000001_cohorts_complete_setup.sql`~~ (deprecated - had conflicts)

### Modified Files:
- `src/components/Views/MyCohortPage.tsx` (updated for new schema)
- `src/components/Views/Dashboard.tsx` (added promo card)
- `src/types/cohorts.ts` (updated types)
- `src/utils/cohortHelpers.ts` (updated getUserCohort, added debug logs)

### Already Existing (from previous work):
- `src/types/index.ts` (my-cohort view)
- `src/components/Layout/MainLayout.tsx` (route)
- `src/components/Layout/Sidebar.tsx` (menu item)
- `src/utils/breadcrumbMapping.ts` (breadcrumb)
- `src/contexts/AppContext.tsx` (always allowed)

---

**Status**: Code deployed to staging, ready for database migration and testing.

