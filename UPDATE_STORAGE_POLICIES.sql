-- Update Storage Policies for Testing
-- This allows unauthenticated users to upload files (for testing)

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create policies that allow all operations for everyone (testing only)
CREATE POLICY "Allow all storage operations" ON storage.objects
FOR ALL USING (bucket_id = 'community-files');

-- Test the policies
SELECT '✅ Storage policies updated for testing!' as status;
SELECT 'Storage policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';


























