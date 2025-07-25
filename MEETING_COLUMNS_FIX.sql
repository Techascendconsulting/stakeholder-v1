-- MEETING COLUMNS FIX - Add missing columns to user_meetings table
-- Run this in your Supabase SQL Editor

DO $$ 
BEGIN
    -- Add missing columns to user_meetings table
    RAISE NOTICE 'Adding missing columns to user_meetings table...';

    -- Add meeting_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'meeting_notes'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN meeting_notes TEXT DEFAULT '';
        RAISE NOTICE 'Added meeting_notes column';
    ELSE
        RAISE NOTICE 'meeting_notes column already exists';
    END IF;

    -- Add meeting_summary column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'meeting_summary'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN meeting_summary TEXT DEFAULT '';
        RAISE NOTICE 'Added meeting_summary column';
    ELSE
        RAISE NOTICE 'meeting_summary column already exists';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'status'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN status TEXT DEFAULT 'completed';
        RAISE NOTICE 'Added status column';
    ELSE
        RAISE NOTICE 'status column already exists';
    END IF;

    -- Add duration column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'duration'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN duration INTEGER DEFAULT 0;
        RAISE NOTICE 'Added duration column';
    ELSE
        RAISE NOTICE 'duration column already exists';
    END IF;

    -- Add transcript column if it doesn't exist (JSONB array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'transcript'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN transcript JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added transcript column';
    ELSE
        RAISE NOTICE 'transcript column already exists';
    END IF;

    -- Add raw_chat column if it doesn't exist (JSONB array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'raw_chat'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN raw_chat JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added raw_chat column';
    ELSE
        RAISE NOTICE 'raw_chat column already exists';
    END IF;

    -- Add other essential columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'total_messages'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN total_messages INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_messages column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'user_messages'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN user_messages INTEGER DEFAULT 0;
        RAISE NOTICE 'Added user_messages column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'ai_messages'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN ai_messages INTEGER DEFAULT 0;
        RAISE NOTICE 'Added ai_messages column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'topics_discussed'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN topics_discussed TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added topics_discussed column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'key_insights'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN key_insights TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added key_insights column';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE user_meetings ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added completed_at column';
    END IF;

    -- Ensure meeting_type column allows our new types
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_meetings' AND column_name = 'meeting_type'
    ) THEN
        -- Update the column to TEXT to allow flexible meeting types
        ALTER TABLE user_meetings ALTER COLUMN meeting_type TYPE TEXT;
        ALTER TABLE user_meetings ALTER COLUMN meeting_type SET DEFAULT 'voice-only';
        RAISE NOTICE 'Updated meeting_type column to support new types';
    ELSE
        ALTER TABLE user_meetings ADD COLUMN meeting_type TEXT DEFAULT 'voice-only';
        RAISE NOTICE 'Added meeting_type column';
    END IF;

    -- Refresh the schema cache
    NOTIFY pgrst, 'reload schema';
    
    RAISE NOTICE '✅ ALL COLUMNS ADDED SUCCESSFULLY! Schema cache refreshed.';
    RAISE NOTICE '🧪 You can now test the transcript meeting save again!';

END $$;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_meetings' 
ORDER BY ordinal_position;