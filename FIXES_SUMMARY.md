# Fixes Applied

## Issue 1: Device Lock - Multiple Users on Same Device

### Problem
User `baworkxp@gmail.com` was locked out when trying to sign in, even though using the same device. The system was too restrictive and prevented multiple users from using the same laptop with different credentials.

### Root Cause
The `register_user_device` function in the database was locking accounts when device IDs didn't match the registered device. This prevented legitimate users from signing in on devices they previously used.

### Solution
Modified the `register_user_device` RPC function to:
1. **Allow multiple users on same physical device** - Each user maintains their own device registration
2. **Update device registration flexibly** - If a user's device changes OR isn't registered, update it instead of locking
3. **Unlocked baworkxp@gmail.com specifically** - Reset their locked status and device registration

### File Created
`FIX_DEVICE_LOCK_MULTI_USER.sql` - Run this in Supabase SQL Editor to apply the fix

### To Apply Fix
```bash
# Run the SQL file in Supabase SQL Editor
cat FIX_DEVICE_LOCK_MULTI_USER.sql
```

---

## Issue 2: Assignment Placement in Modules

### Problem Statement
User reported: "for all learning, only one assignment is seen at the end of the last page of the module NOT 1 page 1 assignment"

### Current Implementation (Already Correct)
After reviewing the codebase, assignments are ALREADY correctly placed:

1. **LessonView.tsx** (New Learning Flow):
   - Line 246: Button shows "Go to Assignment" only when `isLastLesson` is true
   - Line 60: `isLastLesson = currentLessonIndex === module.lessons.length - 1`
   - Assignment is a separate view accessed after completing all lessons

2. **StakeholderMappingView.tsx**:
   - Line 914: Assignment only appears after last lesson
   - Uses `showAssignment` state to toggle between lesson view and assignment view

3. **ScrumLearningView.tsx**:
   - Line 491: Assignment only shown when `currentSectionId === totalSections`
   - Only displays on the final section (7/7)

### Verification Needed
The code is already implementing the desired behavior. If assignments are appearing on every page somewhere, it may be:
- A caching issue (clear browser cache)
- A specific module that has a bug (please specify which module)
- User viewing the wrong section

### Modules Checked
✓ Module 1 (Core Learning) - Uses LearningFlow system  
✓ Module 3 (Stakeholder Mapping) - Assignment at end only  
✓ Module 10 (Scrum Delivery) - Assignment on last section only  

---

## Summary of Changes

### Files Modified
1. **Created**: `/Users/joyoby/stakeholder-v1/FIX_DEVICE_LOCK_MULTI_USER.sql`
   - Fixes device lock for multi-user support
   - Unlocks baworkxp@gmail.com
   
2. **No changes needed**: Assignment placement is already correct

### Next Steps
1. Run `FIX_DEVICE_LOCK_MULTI_USER.sql` in Supabase SQL Editor
2. Have baworkxp@gmail.com try logging in again
3. Verify which module is showing assignments incorrectly (if any)
4. Test in development: `npm run dev`

### Testing Checklist
- [ ] Device Lock: Two different users can sign in on same laptop
- [ ] Device Lock: baworkxp@gmail.com can successfully sign in
- [ ] Assignments: Only appear at END of modules, not on every page
- [ ] Assignments: Navigate through Module 1, 3, or 10 to verify placement

