-- Fix Community Lounge Permissions
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "channels_insert" ON channels;
DROP POLICY IF EXISTS "space_members_insert" ON space_members;
DROP POLICY IF EXISTS "channel_members_insert" ON channel_members;

-- Create simpler, working policies

-- Messages: Allow authenticated users to insert messages
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Channels: Allow authenticated users to create channels
CREATE POLICY "channels_insert" ON channels FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Space members: Allow authenticated users to join spaces
CREATE POLICY "space_members_insert" ON space_members FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Channel members: Allow authenticated users to join channels
CREATE POLICY "channel_members_insert" ON channel_members FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Also fix the seed function to work properly
CREATE OR REPLACE FUNCTION seed_community_lounge()
RETURNS UUID AS $$
DECLARE
  space_id UUID;
  channel_id UUID;
BEGIN
  -- Create space if it doesn't exist
  INSERT INTO spaces (id, name, description, created_by) 
  VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'BA Training Community', 
    'Main community for Business Analysts', 
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO space_id;
  
  -- If no space was created, get the existing one
  IF space_id IS NULL THEN
    SELECT id INTO space_id FROM spaces WHERE id = '550e8400-e29b-41d4-a716-446655440000';
  END IF;

  -- Create channels
  INSERT INTO channels (id, space_id, name, description, is_private, is_staff_only) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', space_id, 'general', 'General discussion', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440002', space_id, 'process-mapping', 'BPMN and process mapping discussions', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440003', space_id, 'stakeholders', 'Stakeholder management tips', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440004', space_id, 'requirements', 'Requirements gathering techniques', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440005', space_id, 'interview-prep', 'Interview preparation and tips', FALSE, FALSE),
    ('550e8400-e29b-41d4-a716-446655440006', space_id, 'agile', 'Agile methodologies and practices', FALSE, FALSE)
  ON CONFLICT DO NOTHING;

  -- Add current user to space if not already a member
  INSERT INTO space_members (space_id, user_id, role) VALUES 
    (space_id, COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID), 'owner')
  ON CONFLICT DO NOTHING;

  -- Add current user to all channels
  INSERT INTO channel_members (channel_id, user_id) 
  SELECT id, COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID) 
  FROM channels 
  WHERE space_id = space_id
  ON CONFLICT DO NOTHING;

  RETURN space_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION seed_community_lounge() TO authenticated;





