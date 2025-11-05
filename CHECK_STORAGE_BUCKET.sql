-- Check Storage Bucket Status
-- Run this to verify the storage bucket setup

-- Check if bucket exists
SELECT 'Storage Buckets:' as info;
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'community-files';

-- Check storage policies
SELECT 'Storage Policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Test bucket access
SELECT 'Bucket accessible:' as info, COUNT(*) as count FROM storage.objects WHERE bucket_id = 'community-files';




























