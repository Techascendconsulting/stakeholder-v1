-- Fix agile_tickets table to support Epic type
-- Run this in Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE public.agile_tickets DROP CONSTRAINT IF EXISTS agile_tickets_type_check;

-- Add the new constraint that includes 'Epic'
ALTER TABLE public.agile_tickets ADD CONSTRAINT agile_tickets_type_check 
  CHECK (type IN ('Epic', 'Story', 'Task', 'Bug', 'Spike'));

-- Add epic column if it doesn't exist (for parent-child relationships)
ALTER TABLE public.agile_tickets ADD COLUMN IF NOT EXISTS epic text;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'agile_tickets' 
ORDER BY ordinal_position;


