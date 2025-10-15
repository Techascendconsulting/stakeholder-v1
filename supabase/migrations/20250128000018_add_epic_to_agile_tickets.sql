-- Add Epic type to agile_tickets table
-- This migration updates the type constraint to include 'Epic' as a valid ticket type

-- First, drop the existing constraint
ALTER TABLE public.agile_tickets DROP CONSTRAINT IF EXISTS agile_tickets_type_check;

-- Add the new constraint that includes 'Epic'
ALTER TABLE public.agile_tickets ADD CONSTRAINT agile_tickets_type_check 
  CHECK (type IN ('Epic', 'Story', 'Task', 'Bug', 'Spike'));

-- Add epic column if it doesn't exist (for parent-child relationships)
ALTER TABLE public.agile_tickets ADD COLUMN IF NOT EXISTS epic text;





