-- Check the current structure of the stories table
SELECT '=== STORIES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we need to add title column
SELECT '=== CHECKING FOR TITLE COLUMN ===' as info;
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'stories' 
  AND column_name = 'title'
  AND table_schema = 'public'
) as title_column_exists;














