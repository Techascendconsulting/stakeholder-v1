-- Add a test message from a different user to test left/right alignment
-- Run this in Supabase SQL Editor

-- First, create a test user profile
INSERT INTO user_profiles (
  user_id,
  display_name,
  avatar_url,
  cohort_id
) VALUES (
  '22222222-2222-2222-2222-222222222222',  -- Different user ID
  'TestUser',
  NULL,
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (user_id) DO NOTHING;

-- Add a message from this test user
INSERT INTO cohort_messages (
  cohort_id, 
  author_user_id, 
  body, 
  parent_message_id, 
  is_deleted
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- August 2025 Cohort
  '22222222-2222-2222-2222-222222222222',  -- TestUser
  'Hello! This message should appear on the LEFT side with no background color.',
  NULL,
  FALSE
);

-- Check the messages now
SELECT 
  cm.*,
  up.display_name as author_name
FROM cohort_messages cm
LEFT JOIN user_profiles up ON cm.author_user_id = up.user_id
WHERE cm.cohort_id = '00000000-0000-0000-0000-000000000001'
ORDER BY cm.created_at DESC
LIMIT 5;
