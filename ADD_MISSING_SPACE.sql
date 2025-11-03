-- Add Missing Space
-- The channels exist but the space is missing

-- Add the space that all channels are referencing
INSERT INTO spaces (id, name, description, created_by) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'BA Training Community', 
    'Main community for Business Analysts', 
    COALESCE((SELECT id FROM auth.users LIMIT 1), '00000000-0000-0000-0000-000000000000'::UUID)
)
ON CONFLICT (id) DO NOTHING;

-- Add current user to the space (if user exists)
INSERT INTO space_members (space_id, user_id, role) 
SELECT '550e8400-e29b-41d4-a716-446655440000', id, 'owner'
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add current user to all channels (if user exists)
INSERT INTO channel_members (channel_id, user_id) 
SELECT c.id, u.id
FROM channels c, auth.users u
WHERE c.space_id = '550e8400-e29b-41d4-a716-446655440000'
AND u.id = (SELECT id FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- Add a welcome message (if user exists)
INSERT INTO messages (channel_id, user_id, body) 
SELECT '550e8400-e29b-41d4-a716-446655440001', id, 'Welcome to the BA Community Lounge! 👋'
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Show results
SELECT '✅ Space added successfully!' as status;
SELECT 'Spaces:' as info, COUNT(*) as count FROM spaces;
SELECT 'Channels:' as info, COUNT(*) as count FROM channels;
SELECT 'Messages:' as info, COUNT(*) as count FROM messages;


























