-- Complete Storage Fix for Community Lounge
-- This will fix all storage issues

-- Step 1: Drop all existing storage policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow all storage operations" ON storage.objects;

-- Step 2: Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-files',
  'community-files',
  true,
  52428800, -- 50MB limit
  ARRAY['image/*', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Step 3: Create simple policies that allow everything
CREATE POLICY "storage_all" ON storage.objects
FOR ALL USING (bucket_id = 'community-files');

-- Step 4: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 5: Test the bucket
SELECT '✅ Storage bucket created/updated successfully!' as status;
SELECT 'Bucket details:' as info;
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'community-files';

SELECT 'Storage policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';


















