# Apply Learning Progress Migration

## Quick Steps:

1. Go to: https://supabase.com/dashboard/project/ckppwcsnkbrgekxtwccq/sql/new

2. Copy and paste the contents of:
   `supabase/migrations/20250107200000_learning_progress.sql`

3. Click **RUN**

4. Refresh your app and navigate to:
   **My Learning → Learning Journey**

5. Test the flow:
   - First module should be unlocked
   - Complete a lesson → marks as complete ✅
   - Complete all lessons → unlocks assignment
   - Complete assignment → unlocks next module 🔓

## What This Does:

✅ Creates `learning_progress` table in Supabase  
✅ Sets up RLS policies (users can only see their own progress)  
✅ Progress persists across logout/login/refresh  
✅ Prepares data for AI coach to read user progress later  

## Verification:

After running the migration, check the `learning_progress` table in Supabase.
You should see rows created automatically when you first visit Learning Journey.

