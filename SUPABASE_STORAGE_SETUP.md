# Supabase Storage Setup for Community Lounge

## Create Storage Bucket

To enable file uploads in the Community Lounge, you need to create a storage bucket in your Supabase dashboard.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "Create a new bucket"
   - **Bucket name**: `community-files`
   - **Public bucket**: ✅ Check this (so files can be accessed)
   - Click "Create bucket"

3. **Set Bucket Policies**
   - Click on the `community-files` bucket
   - Go to "Policies" tab
   - Add these policies:

### Policy 1: Allow authenticated users to upload files
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'community-files' AND 
  auth.role() = 'authenticated'
);
```

### Policy 2: Allow public access to read files
```sql
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'community-files'
);
```

### Policy 3: Allow users to delete their own files
```sql
CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'community-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Test File Upload

After setting up the bucket:

1. **Go to Community Lounge** in your app
2. **Try uploading a file** using the paperclip or image icon
3. **Check the browser console** for upload logs
4. **Check Supabase Storage** to see if files appear

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**
   - Make sure the bucket name is exactly `community-files`
   - Check that the bucket is created in the correct project

2. **"Permission denied" error**
   - Verify the storage policies are set correctly
   - Make sure the user is authenticated

3. **"File too large" error**
   - Supabase has a default 50MB file size limit
   - You can increase this in project settings if needed

4. **"Invalid file type" error**
   - Check that the file type is allowed
   - Current allowed types: images, PDF, DOC, DOCX, TXT

## File Types Supported

The Community Lounge currently supports:
- **Images**: JPG, PNG, GIF, SVG, etc.
- **Documents**: PDF, DOC, DOCX, TXT
- **Size limit**: 50MB per file

## Security Notes

- Files are stored in folders organized by space ID
- Public read access allows anyone to view uploaded files
- Users can only delete files they uploaded
- Consider implementing virus scanning for production use

Once the storage bucket is set up, file uploads should work in the Community Lounge! 🎉



























