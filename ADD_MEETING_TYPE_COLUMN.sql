-- Add meeting_type column to user_meetings table if it doesn't exist
-- This column tracks whether a meeting is voice-only or transcript-based

-- Check if column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_meetings' 
    AND column_name = 'meeting_type'
  ) THEN
    ALTER TABLE public.user_meetings
    ADD COLUMN meeting_type TEXT;
    
    -- Set default values for existing records (assume transcript/group for existing meetings)
    UPDATE public.user_meetings
    SET meeting_type = 'transcript'
    WHERE meeting_type IS NULL;
    
    -- Add comment
    COMMENT ON COLUMN public.user_meetings.meeting_type IS 'Type of meeting: voice-only, transcript, individual, or group';
    
    RAISE NOTICE 'meeting_type column added to user_meetings table';
  ELSE
    RAISE NOTICE 'meeting_type column already exists in user_meetings table';
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_meetings' 
AND column_name = 'meeting_type';


