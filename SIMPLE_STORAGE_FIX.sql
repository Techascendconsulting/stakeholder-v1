-- Simple Storage Fix for Community Lounge
-- This works with Supabase's storage system

-- Create the bucket if it doesn't exist
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

-- Test the bucket
SELECT '✅ Storage bucket created/updated successfully!' as status;
SELECT 'Bucket details:' as info;
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'community-files';







