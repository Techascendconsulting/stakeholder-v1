-- Setup Audio Storage Bucket for Motivation Audio
-- Run this to create the audio storage bucket and policies

-- Create the audio storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'motivation-audio',
  'motivation-audio',
  true,
  104857600, -- 100MB limit for audio files
  ARRAY['audio/*', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['audio/*', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];

-- Create storage policies for the audio bucket
CREATE POLICY "Allow public read access to audio" ON storage.objects
FOR SELECT USING (bucket_id = 'motivation-audio');

CREATE POLICY "Allow authenticated uploads to audio" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'motivation-audio');

CREATE POLICY "Allow authenticated updates to audio" ON storage.objects
FOR UPDATE USING (bucket_id = 'motivation-audio');

CREATE POLICY "Allow authenticated deletes to audio" ON storage.objects
FOR DELETE USING (bucket_id = 'motivation-audio');

-- Test the bucket
SELECT '✅ Audio storage bucket created successfully!' as status;
SELECT name, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'motivation-audio';
SELECT name, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'motivation-audio';

