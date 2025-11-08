-- Fix MVP Builder RLS Policies
-- The issue is that training epics have project_id = null and created_by = null
-- But RLS policies are filtering them out

-- 1. Update RLS policy for epics to allow training data (project_id = null)
DROP POLICY IF EXISTS "Users can view epics in their projects" ON public.epics;
CREATE POLICY "Users can view epics in their projects" ON public.epics
  FOR SELECT USING (
    project_id IS NULL OR  -- Allow training epics (project_id = null)
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

-- 2. Update RLS policy for stories to allow training data
DROP POLICY IF EXISTS "Users can view stories in their epics" ON public.stories;
CREATE POLICY "Users can view stories in their epics" ON public.stories
  FOR SELECT USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IS NULL OR  -- Allow training epics
      project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

-- 3. Update RLS policy for acceptance_criteria to allow training data
DROP POLICY IF EXISTS "Users can view acceptance criteria in their stories" ON public.acceptance_criteria;
CREATE POLICY "Users can view acceptance criteria in their stories" ON public.acceptance_criteria
  FOR SELECT USING (
    story_id IN (
      SELECT id FROM public.stories 
      WHERE epic_id IN (
        SELECT id FROM public.epics 
        WHERE project_id IS NULL OR  -- Allow training epics
        project_id IN (
          SELECT id FROM public.projects 
          WHERE created_by = auth.uid()
        )
      )
    )
  );

-- 4. Update RLS policy for mvp_flows to allow training data
DROP POLICY IF EXISTS "Users can view mvp flows in their epics" ON public.mvp_flows;
CREATE POLICY "Users can view mvp flows in their epics" ON public.mvp_flows
  FOR SELECT USING (
    epic_id IN (
      SELECT id FROM public.epics 
      WHERE project_id IS NULL OR  -- Allow training epics
      project_id IN (
        SELECT id FROM public.projects 
        WHERE created_by = auth.uid()
      )
    )
  );

-- 5. Verify the data is accessible
SELECT '=== VERIFICATION ===' as info;
SELECT 'Epics accessible:' as info, COUNT(*) as count FROM public.epics;
SELECT 'Stories accessible:' as info, COUNT(*) as count FROM public.stories;
SELECT 'Acceptance Criteria accessible:' as info, COUNT(*) as count FROM public.acceptance_criteria;
















