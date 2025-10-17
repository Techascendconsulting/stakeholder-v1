-- ======================================
-- DIAGNOSE AND FIX PROJECT_ID ISSUE
-- Based on ChatGPT's recommendations
-- ======================================

-- 1. First, let's see what columns actually exist
SELECT '=== CURRENT EPICS TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'epics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== CURRENT STORIES TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add project_id column to epics if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'epics' AND column_name = 'project_id' AND table_schema = 'public') THEN
        ALTER TABLE public.epics ADD COLUMN project_id UUID;
        RAISE NOTICE 'Added project_id column to epics table';
    ELSE
        RAISE NOTICE 'project_id column already exists in epics table';
    END IF;
END $$;

-- 3. Add project_id column to stories if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stories' AND column_name = 'project_id' AND table_schema = 'public') THEN
        ALTER TABLE public.stories ADD COLUMN project_id UUID;
        RAISE NOTICE 'Added project_id column to stories table';
    ELSE
        RAISE NOTICE 'project_id column already exists in stories table';
    END IF;
END $$;

-- 4. Add other missing columns to epics
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'epics' AND column_name = 'title' AND table_schema = 'public') THEN
        ALTER TABLE public.epics ADD COLUMN title TEXT;
        RAISE NOTICE 'Added title column to epics table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'epics' AND column_name = 'description' AND table_schema = 'public') THEN
        ALTER TABLE public.epics ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to epics table';
    END IF;
END $$;

-- 5. Add other missing columns to stories
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stories' AND column_name = 'epic_id' AND table_schema = 'public') THEN
        ALTER TABLE public.stories ADD COLUMN epic_id UUID REFERENCES public.epics(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added epic_id column to stories table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stories' AND column_name = 'summary' AND table_schema = 'public') THEN
        ALTER TABLE public.stories ADD COLUMN summary TEXT;
        RAISE NOTICE 'Added summary column to stories table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stories' AND column_name = 'description' AND table_schema = 'public') THEN
        ALTER TABLE public.stories ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to stories table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stories' AND column_name = 'moscow' AND table_schema = 'public') THEN
        ALTER TABLE public.stories ADD COLUMN moscow TEXT CHECK (moscow IN ('Must', 'Should', 'Could', 'Won''t'));
        RAISE NOTICE 'Added moscow column to stories table';
    END IF;
END $$;

-- 6. Verify the columns now exist
SELECT '=== FINAL EPICS TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'epics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== FINAL STORIES TABLE COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== MIGRATION COMPLETE ===' as status;







