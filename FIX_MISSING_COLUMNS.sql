-- Fix Missing Columns Migration
-- Add missing project_id columns to existing tables

-- Add project_id to stories table if it doesn't exist
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add created_by to stories table if it doesn't exist
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add updated_at to stories table if it doesn't exist
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add created_by to epics table if it doesn't exist
ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add updated_at to epics table if it doesn't exist
ALTER TABLE public.epics 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update RLS policies to handle the new columns
DROP POLICY IF EXISTS "Users can view stories in their projects" ON public.stories;
CREATE POLICY "Users can view stories in their projects" ON public.stories
  FOR SELECT USING (
    project_id IS NULL OR  -- Allow training stories
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create stories in their projects" ON public.stories;
CREATE POLICY "Users can create stories in their projects" ON public.stories
  FOR INSERT WITH CHECK (
    (project_id IS NULL OR  -- Allow training stories
    project_id IN (
      SELECT id FROM public.projects 
      WHERE created_by = auth.uid()
    )) AND created_by = auth.uid()
  );

-- Verify the columns exist
SELECT '=== COLUMN VERIFICATION ===' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stories' 
AND table_schema = 'public'
ORDER BY ordinal_position;







