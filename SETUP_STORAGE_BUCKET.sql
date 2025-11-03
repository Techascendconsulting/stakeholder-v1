-- Setup Storage Bucket for Community Lounge
-- Run this to create the storage bucket and policies

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-files',
  'community-files',
  true,
  52428800, -- 50MB limit
  ARRAY['image/*', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bucket
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'community-files');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'community-files');

CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'community-files');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'community-files');

-- Test the bucket
SELECT '✅ Storage bucket created successfully!' as status;
SELECT name, public, file_size_limit FROM storage.buckets WHERE id = 'community-files';


























