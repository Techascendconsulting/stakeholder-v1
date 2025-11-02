-- ====================================================================
-- FINAL DATABASE FIX - Complete Database Restoration
-- Run this in your Supabase SQL Editor to fix all database issues
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create user_profiles table (essential for auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  skills TEXT[],
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  -- Admin roles
  is_admin BOOLEAN DEFAULT FALSE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_senior_admin BOOLEAN DEFAULT FALSE,
  -- Device lock fields
  registered_device TEXT,
  locked BOOLEAN DEFAULT FALSE,
  -- Onboarding fields
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  onboarding_experience_level TEXT,
  onboarding_starting_intent TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_projects_started INTEGER DEFAULT 0,
  total_projects_completed INTEGER DEFAULT 0,
  total_meetings_conducted INTEGER DEFAULT 0,
  total_deliverables_created INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create user_meetings table
CREATE TABLE IF NOT EXISTS public.user_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT,
  stakeholder_names TEXT[] DEFAULT '{}',
  stakeholder_roles TEXT[] DEFAULT '{}',
  total_messages INTEGER DEFAULT 0,
  user_messages INTEGER DEFAULT 0,
  ai_messages INTEGER DEFAULT 0,
  topics_discussed TEXT[] DEFAULT '{}',
  key_insights TEXT[] DEFAULT '{}',
  effectiveness_score INTEGER,
  transcript TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 5. Create user_activity_logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  device_id TEXT,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create user_onboarding table
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  completed_steps TEXT[] DEFAULT '{}',
  current_step TEXT DEFAULT 'welcome',
  onboarding_data JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  action_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create the log_user_activity function
CREATE OR REPLACE FUNCTION public.log_user_activity(
  user_uuid UUID,
  activity_type_param TEXT,
  activity_data_param JSONB DEFAULT '{}',
  device_id_param TEXT DEFAULT NULL,
  session_id_param TEXT DEFAULT NULL,
  ip_address_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  success_param BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_data,
    device_id,
    session_id,
    ip_address,
    user_agent,
    success
  ) VALUES (
    user_uuid,
    activity_type_param,
    activity_data_param,
    device_id_param,
    session_id_param,
    ip_address_param,
    user_agent_param,
    success_param
  )
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

-- 9. Create get_user_details_with_emails function
CREATE OR REPLACE FUNCTION public.get_user_details_with_emails(user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  skills TEXT[],
  experience_level TEXT,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN,
  is_senior_admin BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    au.email::TEXT,
    up.display_name::TEXT,
    up.bio::TEXT,
    up.avatar_url::TEXT,
    up.title::TEXT,
    up.company::TEXT,
    up.location::TEXT,
    up.website::TEXT,
    up.linkedin_url::TEXT,
    up.github_url::TEXT,
    up.skills,
    up.experience_level::TEXT,
    up.is_admin,
    up.is_super_admin,
    up.is_senior_admin,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  JOIN auth.users au ON up.user_id = au.id
  WHERE (user_id_param IS NULL OR up.user_id = user_id_param)
  ORDER BY up.created_at DESC;
END;
$$;

-- 10. Create get_user_profile function
DROP FUNCTION IF EXISTS public.get_user_profile(UUID);
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS SETOF public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.user_profiles WHERE user_id = user_uuid;
END;
$$;

-- 11. Create update_user_profile function
DROP FUNCTION IF EXISTS public.update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT);
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_uuid UUID,
  display_name_param TEXT DEFAULT NULL,
  bio_param TEXT DEFAULT NULL,
  avatar_url_param TEXT DEFAULT NULL,
  title_param TEXT DEFAULT NULL,
  company_param TEXT DEFAULT NULL,
  location_param TEXT DEFAULT NULL,
  website_param TEXT DEFAULT NULL,
  linkedin_url_param TEXT DEFAULT NULL,
  github_url_param TEXT DEFAULT NULL,
  skills_param TEXT[] DEFAULT NULL,
  experience_level_param TEXT DEFAULT NULL
)
RETURNS SETOF public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    display_name = COALESCE(display_name_param, display_name),
    bio = COALESCE(bio_param, bio),
    avatar_url = COALESCE(avatar_url_param, avatar_url),
    title = COALESCE(title_param, title),
    company = COALESCE(company_param, company),
    location = COALESCE(location_param, location),
    website = COALESCE(website_param, website),
    linkedin_url = COALESCE(linkedin_url_param, linkedin_url),
    github_url = COALESCE(github_url_param, github_url),
    skills = COALESCE(skills_param, skills),
    experience_level = COALESCE(experience_level_param, experience_level),
    updated_at = NOW()
  WHERE user_id = user_uuid
  RETURNING *;
END;
$$;

-- 12. Create handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 13. Create triggers for updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_profiles') THEN
    CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_progress') THEN
    CREATE TRIGGER set_updated_at_user_progress
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_meetings') THEN
    CREATE TRIGGER set_updated_at_user_meetings
    BEFORE UPDATE ON public.user_meetings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_onboarding') THEN
    CREATE TRIGGER set_updated_at_user_onboarding
    BEFORE UPDATE ON public.user_onboarding
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 14. RLS Policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.user_profiles;
CREATE POLICY "Allow authenticated users to read their own profile"
  ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to update their own profile"
  ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to insert their own profile"
  ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 15. RLS Policies for user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own progress" ON public.user_progress;
CREATE POLICY "Allow authenticated users to manage their own progress"
  ON public.user_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 16. RLS Policies for user_meetings
ALTER TABLE public.user_meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own meetings" ON public.user_meetings;
CREATE POLICY "Allow authenticated users to manage their own meetings"
  ON public.user_meetings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 17. RLS Policies for user_activity_logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Allow authenticated users to read their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Allow authenticated users to insert their own activity logs"
  ON public.user_activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to read their own activity logs"
  ON public.user_activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 18. RLS Policies for user_onboarding
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own onboarding" ON public.user_onboarding;
CREATE POLICY "Allow authenticated users to manage their own onboarding"
  ON public.user_onboarding FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 19. RLS Policies for admin_activity_logs
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to manage admin activity logs" ON public.admin_activity_logs;
CREATE POLICY "Allow admins to manage admin activity logs"
  ON public.admin_activity_logs FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
    )
  );

-- 20. Grant permissions to authenticated users for functions
GRANT EXECUTE ON FUNCTION public.log_user_activity(UUID, TEXT, JSONB, TEXT, TEXT, INET, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_details_with_emails(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT) TO authenticated;

-- 21. Force create your admin profile
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  is_admin,
  is_super_admin,
  is_senior_admin,
  has_completed_onboarding,
  created_at,
  updated_at
) 
SELECT 
  au.id,
  'Super Admin',
  true,
  true,
  true,
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'techascendconsulting1@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  is_admin = true,
  is_super_admin = true,
  is_senior_admin = true,
  has_completed_onboarding = true,
  updated_at = NOW();

-- 22. Test the setup
SELECT 'Database setup complete!' as status;
SELECT 'Your admin profile:' as info, * FROM public.user_profiles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'techascendconsulting1@gmail.com'
);
