-- ======================================
-- FIX PROJECT_ID COLUMNS
-- Add missing project_id columns safely
-- ======================================

-- 1. Add project_id to epics table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'epics' 
        AND column_name = 'project_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.epics ADD COLUMN project_id UUID;
        RAISE NOTICE 'Added project_id column to epics table';
    ELSE
        RAISE NOTICE 'project_id column already exists in epics table';
    END IF;
END $$;

-- 2. Add project_id to stories table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' 
        AND column_name = 'project_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.stories ADD COLUMN project_id UUID;
        RAISE NOTICE 'Added project_id column to stories table';
    ELSE
        RAISE NOTICE 'project_id column already exists in stories table';
    END IF;
END $$;

-- 3. Add other missing columns to epics
ALTER TABLE public.epics ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.epics ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.epics ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.epics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Add other missing columns to stories
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS epic_id UUID;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS moscow TEXT CHECK (moscow IN ('Must', 'Should', 'Could', 'Won''t'));
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Verification
SELECT '=== PROJECT_ID FIX COMPLETE ===' as status;
SELECT 'Epics table now has project_id:' as info, 
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'epics' AND column_name = 'project_id' AND table_schema = 'public') as has_project_id;
SELECT 'Stories table now has project_id:' as info, 
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'project_id' AND table_schema = 'public') as has_project_id;






