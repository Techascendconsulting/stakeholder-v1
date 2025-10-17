-- MVP Builder Seed Data
-- Run this after the migration to populate the database with sample data

-- 1. Create sample projects (if they don't exist)
INSERT INTO public.projects (id, name, description, created_by, created_at, updated_at)
VALUES 
  ('proj-1', 'Customer Onboarding Process Optimization', 'Analyze and redesign the customer onboarding workflow', auth.uid(), NOW(), NOW()),
  ('proj-2', 'Digital Expense Management System', 'Transform manual expense reporting processes', auth.uid(), NOW(), NOW()),
  ('proj-3', 'Multi-Location Inventory Management', 'Optimize inventory levels across warehouse locations', auth.uid(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Create sample epics
INSERT INTO public.epics (id, project_id, title, description, created_by, created_at, updated_at)
VALUES 
  ('epic-1', 'proj-1', 'Customer Onboarding Flow', 'Streamline the entire customer onboarding process from signup to first value', auth.uid(), NOW(), NOW()),
  ('epic-2', 'proj-1', 'Customer Communication', 'Improve communication channels and touchpoints during onboarding', auth.uid(), NOW(), NOW()),
  ('epic-3', 'proj-2', 'Expense Submission', 'Digital expense reporting and submission workflow', auth.uid(), NOW(), NOW()),
  ('epic-4', 'proj-2', 'Approval Workflow', 'Automated approval processes for expense reports', auth.uid(), NOW(), NOW()),
  ('epic-5', 'proj-3', 'Inventory Tracking', 'Real-time inventory visibility across locations', auth.uid(), NOW(), NOW()),
  ('epic-6', 'proj-3', 'Demand Forecasting', 'Predictive analytics for inventory planning', auth.uid(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Create sample stories
INSERT INTO public.stories (id, epic_id, summary, description, moscow, created_by, created_at, updated_at)
VALUES 
  -- Epic 1: Customer Onboarding Flow
  ('story-1', 'epic-1', 'As a new customer, I want to complete my profile setup so that I can access personalized features', 'Allow customers to set up their profile with basic information, preferences, and goals during onboarding', 'Must', auth.uid(), NOW(), NOW()),
  ('story-2', 'epic-1', 'As a new customer, I want to receive a welcome email so that I know my account is active', 'Send automated welcome email with next steps and resources', 'Must', auth.uid(), NOW(), NOW()),
  ('story-3', 'epic-1', 'As a new customer, I want to schedule my onboarding call so that I can get personalized guidance', 'Allow customers to book a call with customer success team', 'Should', auth.uid(), NOW(), NOW()),
  ('story-4', 'epic-1', 'As a new customer, I want to access training materials so that I can learn how to use the platform', 'Provide access to video tutorials, documentation, and interactive guides', 'Should', auth.uid(), NOW(), NOW()),
  ('story-5', 'epic-1', 'As a new customer, I want to customize my dashboard so that I can see relevant information', 'Allow dashboard customization based on role and preferences', 'Could', auth.uid(), NOW(), NOW()),
  
  -- Epic 2: Customer Communication
  ('story-6', 'epic-2', 'As a customer, I want to receive progress updates so that I know my onboarding status', 'Send regular updates about onboarding progress and milestones', 'Must', auth.uid(), NOW(), NOW()),
  ('story-7', 'epic-2', 'As a customer, I want to contact support easily so that I can get help when needed', 'Provide multiple contact channels: chat, email, phone', 'Must', auth.uid(), NOW(), NOW()),
  ('story-8', 'epic-2', 'As a customer, I want to receive personalized recommendations so that I can discover relevant features', 'AI-powered feature recommendations based on usage patterns', 'Could', auth.uid(), NOW(), NOW()),
  
  -- Epic 3: Expense Submission
  ('story-9', 'epic-3', 'As an employee, I want to submit expenses digitally so that I can avoid paper forms', 'Mobile and web app for expense submission with receipt upload', 'Must', auth.uid(), NOW(), NOW()),
  ('story-10', 'epic-3', 'As an employee, I want to categorize expenses so that they are properly tracked', 'Pre-defined categories with smart auto-categorization', 'Must', auth.uid(), NOW(), NOW()),
  ('story-11', 'epic-3', 'As an employee, I want to save draft expenses so that I can complete them later', 'Save incomplete expense reports for later completion', 'Should', auth.uid(), NOW(), NOW()),
  
  -- Epic 4: Approval Workflow
  ('story-12', 'epic-4', 'As a manager, I want to approve expenses so that they can be processed', 'Approval interface with expense details and policy checks', 'Must', auth.uid(), NOW(), NOW()),
  ('story-13', 'epic-4', 'As a manager, I want to see expense summaries so that I can track team spending', 'Dashboard with spending analytics and trends', 'Should', auth.uid(), NOW(), NOW()),
  
  -- Epic 5: Inventory Tracking
  ('story-14', 'epic-5', 'As a warehouse manager, I want to see real-time inventory levels so that I can make informed decisions', 'Live inventory dashboard across all locations', 'Must', auth.uid(), NOW(), NOW()),
  ('story-15', 'epic-5', 'As a warehouse manager, I want to track inventory movements so that I can maintain accuracy', 'Movement tracking for all inventory transactions', 'Must', auth.uid(), NOW(), NOW()),
  ('story-16', 'epic-5', 'As a warehouse manager, I want to set reorder points so that I can avoid stockouts', 'Automated reorder point management with notifications', 'Should', auth.uid(), NOW(), NOW()),
  
  -- Epic 6: Demand Forecasting
  ('story-17', 'epic-6', 'As a planner, I want to see demand forecasts so that I can plan inventory', 'AI-powered demand forecasting with seasonal adjustments', 'Should', auth.uid(), NOW(), NOW()),
  ('story-18', 'epic-6', 'As a planner, I want to analyze trends so that I can optimize inventory levels', 'Trend analysis and optimization recommendations', 'Could', auth.uid(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Create sample acceptance criteria
INSERT INTO public.acceptance_criteria (id, story_id, description, created_at)
VALUES 
  -- Story 1: Profile Setup
  ('ac-1', 'story-1', 'User can enter basic information (name, email, company)', NOW()),
  ('ac-2', 'story-1', 'User can set preferences and goals', NOW()),
  ('ac-3', 'story-1', 'Profile is saved and accessible immediately', NOW()),
  
  -- Story 2: Welcome Email
  ('ac-4', 'story-2', 'Email is sent within 5 minutes of account creation', NOW()),
  ('ac-5', 'story-2', 'Email contains next steps and resources', NOW()),
  ('ac-6', 'story-2', 'Email includes contact information for support', NOW()),
  
  -- Story 6: Progress Updates
  ('ac-7', 'story-6', 'Updates are sent at each major milestone', NOW()),
  ('ac-8', 'story-6', 'Updates include current status and next steps', NOW()),
  ('ac-9', 'story-6', 'User can opt out of non-essential updates', NOW()),
  
  -- Story 9: Digital Expense Submission
  ('ac-10', 'story-9', 'User can upload receipt photos', NOW()),
  ('ac-11', 'story-9', 'User can enter expense details manually', NOW()),
  ('ac-12', 'story-9', 'Expense is saved and submitted for approval', NOW()),
  
  -- Story 14: Real-time Inventory
  ('ac-13', 'story-14', 'Dashboard shows current stock levels', NOW()),
  ('ac-14', 'story-14', 'Data is updated in real-time', NOW()),
  ('ac-15', 'story-14', 'User can filter by location and product', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Create sample MVP flows (optional - for testing)
INSERT INTO public.mvp_flows (id, epic_id, story_ids, flow_order, validated, created_by, created_at)
VALUES 
  ('mvp-1', 'epic-1', ARRAY['story-1', 'story-2', 'story-6'], ARRAY[1, 2, 3], true, auth.uid(), NOW()),
  ('mvp-2', 'epic-3', ARRAY['story-9', 'story-10'], ARRAY[1, 2], true, auth.uid(), NOW()),
  ('mvp-3', 'epic-5', ARRAY['story-14', 'story-15'], ARRAY[1, 2], true, auth.uid(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Verify the data was created
SELECT 'Projects created:' as info, COUNT(*) as count FROM public.projects;
SELECT 'Epics created:' as info, COUNT(*) as count FROM public.epics;
SELECT 'Stories created:' as info, COUNT(*) as count FROM public.stories;
SELECT 'Acceptance Criteria created:' as info, COUNT(*) as count FROM public.acceptance_criteria;
SELECT 'MVP Flows created:' as info, COUNT(*) as count FROM public.mvp_flows;







