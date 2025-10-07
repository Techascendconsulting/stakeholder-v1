-- Re-enable RLS with proper policies
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can create their own help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Admin can view and update all help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Users can view their own help requests" ON public.help_requests;

-- Allow authenticated users to insert help requests
CREATE POLICY "Users can insert help requests"
ON public.help_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view their own help requests
CREATE POLICY "Users can view their own help requests"
ON public.help_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admin to view and manage all help requests
CREATE POLICY "Admin can manage all help requests"
ON public.help_requests
FOR ALL
TO authenticated
USING (auth.email() = 'techascendconsulting@gmail.com');

