-- ====================================================================
-- COMMUNITY HUB MIGRATION - Complete Community Hub Setup
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. First, let's check what tables already exist
SELECT 'Checking existing tables:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'groups', 'group_members', 'buddy_pairs', 'training_sessions')
ORDER BY table_name;

-- 2. Create profiles table (if not exists) - this will be the main user table for community
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('student','mentor','graduate','admin')) DEFAULT 'student',
  slack_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Auto-create profiles row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cohort','graduate','mentor','custom')) NOT NULL,
  start_date DATE,
  end_date DATE,
  slack_channel_id TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Group Members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- 7. Create Buddy Pairs table
CREATE TABLE IF NOT EXISTS buddy_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending','confirmed','archived')) DEFAULT 'pending',
  slack_channel_id TEXT,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user1_id, user2_id)
);

-- 8. Create Training Sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  slack_channel_id TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enable RLS on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- 10. Drop existing policies to avoid conflicts
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('groups','group_members','buddy_pairs','training_sessions')
  ) LOOP
    EXECUTE FORMAT('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END$$;

-- 11. Create RLS Policies for Groups
CREATE POLICY "admins_manage_groups"
ON groups FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "users_view_groups"
ON groups FOR SELECT
USING (EXISTS (
  SELECT 1 FROM group_members gm
  WHERE gm.group_id = groups.id
    AND gm.user_id = auth.uid()
));

-- 12. Create RLS Policies for Group Members
CREATE POLICY "admins_manage_group_members"
ON group_members FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "users_see_own_memberships"
ON group_members FOR SELECT
USING (user_id = auth.uid());

-- 13. Create RLS Policies for Buddy Pairs
CREATE POLICY "admins_manage_buddy_pairs"
ON buddy_pairs FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "users_view_own_buddy_pairs"
ON buddy_pairs FOR SELECT
USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- 14. Create RLS Policies for Training Sessions
CREATE POLICY "admins_manage_training_sessions"
ON training_sessions FOR ALL
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "users_view_sessions"
ON training_sessions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 15. Migrate existing users to profiles table
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(up.display_name, 'User') as full_name,
  CASE 
    WHEN up.is_super_admin = true THEN 'admin'
    WHEN up.is_senior_admin = true THEN 'admin'
    WHEN up.is_admin = true THEN 'admin'
    ELSE 'student'
  END as role
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 16. Create some sample data for testing
INSERT INTO public.groups (name, type, start_date, end_date, created_by)
SELECT 
  'Cohort 1 - Business Analysts',
  'cohort',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '12 weeks',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE name = 'Cohort 1 - Business Analysts');

-- 17. Add users to the sample group
INSERT INTO public.group_members (group_id, user_id)
SELECT 
  g.id,
  p.id
FROM public.groups g
CROSS JOIN public.profiles p
WHERE g.name = 'Cohort 1 - Business Analysts'
AND p.role IN ('student', 'admin')
AND NOT EXISTS (
  SELECT 1 FROM public.group_members gm 
  WHERE gm.group_id = g.id AND gm.user_id = p.id
);

-- 18. Create a sample training session
INSERT INTO public.training_sessions (title, description, start_time, end_time, created_by)
SELECT 
  'Introduction to Stakeholder Management',
  'Learn the fundamentals of stakeholder engagement and communication',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '2 hours',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.training_sessions WHERE title = 'Introduction to Stakeholder Management');

-- 19. Show the results
SELECT 'Community Hub Migration Complete!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'groups', 'group_members', 'buddy_pairs', 'training_sessions')
ORDER BY table_name;

SELECT 'Sample data created:' as info;
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM public.groups) as groups_count,
  (SELECT COUNT(*) FROM public.group_members) as group_members_count,
  (SELECT COUNT(*) FROM public.training_sessions) as training_sessions_count;



















