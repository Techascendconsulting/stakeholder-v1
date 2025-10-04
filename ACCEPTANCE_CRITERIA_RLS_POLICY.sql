-- Allow selecting acceptance_criteria when the parent story's epic is in a project the user can access
-- Adjust the project access check as needed (this example allows access if the epic.project_id equals the training project OR the user owns the project).
DO $$
BEGIN
  -- If policy exists skip creating (safe-guard)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'acceptance_criteria'
      AND policyname = 'allow_select_ac_via_parent_story_project'
  ) THEN
    CREATE POLICY allow_select_ac_via_parent_story_project
      ON public.acceptance_criteria
      FOR SELECT
      USING (
        (
          -- allow if the AC belongs to a story whose epic.project_id is the training project (practice)
          EXISTS (
            SELECT 1
            FROM public.stories s
            JOIN public.epics e ON e.id = s.epic_id
            WHERE s.id = acceptance_criteria.story_id
              AND e.project_id = '00000000-0000-0000-0000-000000000001'
          )
        )
        OR
        (
          -- or allow if the current user has access to the epic's project (replace with your real check if you have one)
          EXISTS (
            SELECT 1
            FROM public.stories s2
            JOIN public.epics e2 ON e2.id = s2.epic_id
            WHERE s2.id = acceptance_criteria.story_id
              AND e2.project_id IN (
                SELECT p.id FROM public.projects p WHERE p.created_by = auth.uid()
              )
          )
        )
      );
  END IF;
END
$$;


