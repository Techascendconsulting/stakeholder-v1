/*
  # Fix User Projects Duplicates and Add Unique Constraint

  1. Data Cleanup
    - Remove duplicate user_projects entries
    - Keep only the most recent entry for each user_id + project_id combination

  2. Schema Updates
    - Add unique constraint to prevent future duplicates
    - Ensure data integrity for user_projects table

  3. Performance
    - Add composite index for efficient queries
*/

-- Step 1: Remove duplicate user_projects entries
-- Keep only the most recent entry for each user_id + project_id combination
DELETE FROM public.user_projects 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, project_id) id
  FROM public.user_projects
  ORDER BY user_id, project_id, created_at DESC
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.user_projects 
ADD CONSTRAINT user_projects_user_id_project_id_key 
UNIQUE (user_id, project_id);

-- Step 3: Add composite index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_projects_user_project_composite 
ON public.user_projects(user_id, project_id);