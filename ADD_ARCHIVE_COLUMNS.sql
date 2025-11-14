-- ======================================
-- ADD ARCHIVE COLUMNS FOR MVP BUILDER/BACKLOG
-- ======================================
-- This migration adds archived columns to prevent duplicate seeds
-- Only affects epics, stories, and acceptance_criteria tables
-- Does NOT touch practice_user_stories or sprint_planning_sessions

-- ======================================
-- 1. ADD ARCHIVED COLUMNS
-- ======================================

-- Add archived column to epics table
ALTER TABLE public.epics ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived column to stories table  
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived column to acceptance_criteria table
ALTER TABLE public.acceptance_criteria ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- ======================================
-- 2. ARCHIVE OLD SEEDS
-- ======================================
-- Archive all rows not tied to the training project

-- Archive epics not tied to training project
UPDATE public.epics 
SET archived = true 
WHERE project_id IS DISTINCT FROM '00000000-0000-0000-0000-000000000001';

-- Archive stories not tied to training project
UPDATE public.stories 
SET archived = true 
WHERE project_id IS DISTINCT FROM '00000000-0000-0000-0000-000000000001';

-- Archive acceptance criteria for stories not tied to training project
UPDATE public.acceptance_criteria 
SET archived = true 
WHERE story_id IN (
  SELECT id FROM public.stories 
  WHERE project_id IS DISTINCT FROM '00000000-0000-0000-0000-000000000001'
);

-- ======================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ======================================

-- Add index on archived column for epics
CREATE INDEX IF NOT EXISTS idx_epics_archived ON public.epics(archived);

-- Add index on archived column for stories
CREATE INDEX IF NOT EXISTS idx_stories_archived ON public.stories(archived);

-- Add index on archived column for acceptance_criteria
CREATE INDEX IF NOT EXISTS idx_acceptance_criteria_archived ON public.acceptance_criteria(archived);

-- ======================================
-- 4. VERIFICATION QUERIES
-- ======================================

-- Check how many epics are archived vs active
SELECT 
  'Epics' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE archived = false) as active_count,
  COUNT(*) FILTER (WHERE archived = true) as archived_count
FROM public.epics

UNION ALL

-- Check how many stories are archived vs active
SELECT 
  'Stories' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE archived = false) as active_count,
  COUNT(*) FILTER (WHERE archived = true) as archived_count
FROM public.stories

UNION ALL

-- Check how many acceptance criteria are archived vs active
SELECT 
  'Acceptance Criteria' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE archived = false) as active_count,
  COUNT(*) FILTER (WHERE archived = true) as archived_count
FROM public.acceptance_criteria;

-- Show active epics for training project
SELECT 
  'Active Training Epics' as info,
  COUNT(*) as count,
  array_agg(title) as epic_titles
FROM public.epics 
WHERE project_id = '00000000-0000-0000-0000-000000000001' 
  AND archived = false;



















