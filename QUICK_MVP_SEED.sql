-- ======================================
-- QUICK MVP BUILDER SEED DATA
-- ======================================
-- This script adds essential training data for MVP Builder

-- Training Project ID
-- 00000000-0000-0000-0000-000000000001

-- ======================================
-- 1. INSERT TRAINING EPICS
-- ======================================
INSERT INTO public.epics (id, title, description, project_id, created_at) VALUES
('epic-1', 'User Authentication', 'Epic for user login, registration, and security features', '00000000-0000-0000-0000-000000000001', NOW()),
('epic-2', 'Dashboard & Analytics', 'Epic for user dashboard, reporting, and analytics features', '00000000-0000-0000-0000-000000000001', NOW()),
('epic-3', 'Communication Hub', 'Epic for messaging, notifications, and communication features', '00000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT (id) DO NOTHING;

-- ======================================
-- 2. INSERT TRAINING STORIES
-- ======================================
INSERT INTO public.stories (id, summary, description, moscow, epic_id, project_id, created_at) VALUES
-- Epic 1: User Authentication
('story-1', 'User Login', 'As a user, I want to log in to the system so that I can access my account', 'Must', 'epic-1', '00000000-0000-0000-0000-000000000001', NOW()),
('story-2', 'Password Reset', 'As a user, I want to reset my password so that I can regain access to my account', 'Should', 'epic-1', '00000000-0000-0000-0000-000000000001', NOW()),
('story-3', 'Two-Factor Authentication', 'As a user, I want to enable 2FA so that my account is more secure', 'Could', 'epic-1', '00000000-0000-0000-0000-000000000001', NOW()),

-- Epic 2: Dashboard & Analytics
('story-4', 'View Dashboard', 'As a user, I want to see my dashboard so that I can view my data', 'Must', 'epic-2', '00000000-0000-0000-0000-000000000001', NOW()),
('story-5', 'Export Data', 'As a user, I want to export my data so that I can use it elsewhere', 'Should', 'epic-2', '00000000-0000-0000-0000-000000000001', NOW()),

-- Epic 3: Communication Hub
('story-6', 'Send Message', 'As a user, I want to send messages so that I can communicate', 'Must', 'epic-3', '00000000-0000-0000-0000-000000000001', NOW()),
('story-7', 'Receive Notifications', 'As a user, I want to receive notifications so that I stay informed', 'Should', 'epic-3', '00000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT (id) DO NOTHING;

-- ======================================
-- 3. INSERT ACCEPTANCE CRITERIA
-- ======================================
INSERT INTO public.acceptance_criteria (id, story_id, description, created_at) VALUES
-- Story 1: User Login
('ac-1', 'story-1', 'Given I am on the login page, When I enter valid credentials, Then I should be logged in successfully', NOW()),
('ac-2', 'story-1', 'Given I enter invalid credentials, When I click login, Then I should see an error message', NOW()),

-- Story 2: Password Reset
('ac-3', 'story-2', 'Given I forgot my password, When I click "Forgot Password", Then I should receive a reset email', NOW()),

-- Story 3: Two-Factor Authentication
('ac-4', 'story-3', 'Given I want to enable 2FA, When I go to security settings, Then I should be able to set up 2FA', NOW()),

-- Story 4: View Dashboard
('ac-5', 'story-4', 'Given I am logged in, When I visit the dashboard, Then I should see my data', NOW()),

-- Story 5: Export Data
('ac-6', 'story-5', 'Given I want to export data, When I click export, Then I should receive a file', NOW()),

-- Story 6: Send Message
('ac-7', 'story-6', 'Given I want to send a message, When I type and send, Then the message should be delivered', NOW()),

-- Story 7: Receive Notifications
('ac-8', 'story-7', 'Given I have notifications enabled, When something happens, Then I should be notified', NOW())
ON CONFLICT (id) DO NOTHING;

-- ======================================
-- 4. VERIFY DATA
-- ======================================
SELECT 'Epics count:' as info, COUNT(*) as count FROM public.epics WHERE project_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Stories count:' as info, COUNT(*) as count FROM public.stories WHERE project_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'AC count:' as info, COUNT(*) as count FROM public.acceptance_criteria WHERE story_id IN (
  SELECT id FROM public.stories WHERE project_id = '00000000-0000-0000-0000-000000000001'
);


