-- ======================================
-- CLEAN AND SEED MVP BUILDER (FRESH START)
-- ======================================
-- This script cleans ALL existing data and adds ONE clean seed
-- No more conflicting seed data!

-- ======================================
-- 1. CLEAN ALL EXISTING DATA
-- ======================================

-- Delete all acceptance criteria first (foreign key constraint)
DELETE FROM public.acceptance_criteria;

-- Delete all stories
DELETE FROM public.stories;

-- Delete all epics
DELETE FROM public.epics;

-- Delete all MVP flows
DELETE FROM public.mvp_flows;

-- ======================================
-- 2. ADD ARCHIVED COLUMNS (IF NOT EXISTS)
-- ======================================

-- Add archived column to epics table
ALTER TABLE public.epics ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived column to stories table  
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived column to acceptance_criteria table
ALTER TABLE public.acceptance_criteria ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- ======================================
-- 3. INSERT ONE CLEAN SEED
-- ======================================

-- Insert 3 training epics
INSERT INTO public.epics (id, title, description, project_id, created_at, archived) VALUES
('epic-1', 'User Authentication', 'Epic for user login, registration, and security features', '00000000-0000-0000-0000-000000000001', NOW(), false),
('epic-2', 'Dashboard & Analytics', 'Epic for user dashboard, reporting, and analytics features', '00000000-0000-0000-0000-000000000001', NOW(), false),
('epic-3', 'Communication Hub', 'Epic for messaging, notifications, and communication features', '00000000-0000-0000-0000-000000000001', NOW(), false);

-- Insert 7 training stories
INSERT INTO public.stories (id, summary, description, moscow, epic_id, project_id, created_at, archived) VALUES
-- Epic 1: User Authentication
('story-1', 'User Login', 'As a user, I want to log in to the system so that I can access my account', 'Must', 'epic-1', '00000000-0000-0000-0000-000000000001', NOW(), false),
('story-2', 'Password Reset', 'As a user, I want to reset my password so that I can regain access to my account', 'Should', 'epic-1', '00000000-0000-0000-0000-000000000001', NOW(), false),
('story-3', 'Two-Factor Authentication', 'As a user, I want to enable 2FA so that my account is more secure', 'Could', 'epic-1', '00000000-0000-0000-0000-000000000001', NOW(), false),

-- Epic 2: Dashboard & Analytics
('story-4', 'View Dashboard', 'As a user, I want to see my dashboard so that I can view my data', 'Must', 'epic-2', '00000000-0000-0000-0000-000000000001', NOW(), false),
('story-5', 'Export Data', 'As a user, I want to export my data so that I can use it elsewhere', 'Should', 'epic-2', '00000000-0000-0000-0000-000000000001', NOW(), false),

-- Epic 3: Communication Hub
('story-6', 'Send Message', 'As a user, I want to send messages so that I can communicate', 'Must', 'epic-3', '00000000-0000-0000-0000-000000000001', NOW(), false),
('story-7', 'Receive Notifications', 'As a user, I want to receive notifications so that I stay informed', 'Should', 'epic-3', '00000000-0000-0000-0000-000000000001', NOW(), false);

-- Insert 8 acceptance criteria
INSERT INTO public.acceptance_criteria (id, story_id, description, created_at, archived) VALUES
-- Story 1: User Login
('ac-1', 'story-1', 'Given I am on the login page, When I enter valid credentials, Then I should be logged in successfully', NOW(), false),
('ac-2', 'story-1', 'Given I enter invalid credentials, When I click login, Then I should see an error message', NOW(), false),

-- Story 2: Password Reset
('ac-3', 'story-2', 'Given I forgot my password, When I click "Forgot Password", Then I should receive a reset email', NOW(), false),

-- Story 3: Two-Factor Authentication
('ac-4', 'story-3', 'Given I want to enable 2FA, When I go to security settings, Then I should be able to set up 2FA', NOW(), false),

-- Story 4: View Dashboard
('ac-5', 'story-4', 'Given I am logged in, When I visit the dashboard, Then I should see my data', NOW(), false),

-- Story 5: Export Data
('ac-6', 'story-5', 'Given I want to export data, When I click export, Then I should receive a file', NOW(), false),

-- Story 6: Send Message
('ac-7', 'story-6', 'Given I want to send a message, When I type and send, Then the message should be delivered', NOW(), false),

-- Story 7: Receive Notifications
('ac-8', 'story-7', 'Given I have notifications enabled, When something happens, Then I should be notified', NOW(), false);

-- ======================================
-- 4. VERIFICATION
-- ======================================

-- Check what we have
SELECT 'Epics' as table_name, COUNT(*) as count FROM public.epics WHERE archived = false
UNION ALL
SELECT 'Stories' as table_name, COUNT(*) as count FROM public.stories WHERE archived = false
UNION ALL
SELECT 'Acceptance Criteria' as table_name, COUNT(*) as count FROM public.acceptance_criteria WHERE archived = false;

-- Show the epics we created
SELECT 'Training Epics:' as info, title, description FROM public.epics WHERE project_id = '00000000-0000-0000-0000-000000000001' AND archived = false;

-- Show the stories we created
SELECT 'Training Stories:' as info, summary, moscow, epic_id FROM public.stories WHERE project_id = '00000000-0000-0000-0000-000000000001' AND archived = false;





