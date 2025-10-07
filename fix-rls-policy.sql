-- Fix RLS policy for help_requests table
-- Run this in Supabase Dashboard → SQL Editor

-- Drop and recreate the policy
DROP POLICY IF EXISTS "Users can create their own help requests" ON public.help_requests;

CREATE POLICY "Users can create their own help requests"
ON public.help_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'help_requests';

