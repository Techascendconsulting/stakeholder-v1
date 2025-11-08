-- ====================================================================
-- FIX DATABASE FUNCTIONS - Handle Existing Functions Properly
-- Run this in your Supabase SQL Editor to fix the function conflicts
-- ====================================================================

-- 1. Drop all existing log_user_activity function variants
DROP FUNCTION IF EXISTS public.log_user_activity(TEXT, JSONB, TEXT, UUID);
DROP FUNCTION IF EXISTS public.log_user_activity(TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS public.log_user_activity(TEXT, JSONB);
DROP FUNCTION IF EXISTS public.log_user_activity(TEXT);
DROP FUNCTION IF EXISTS public.log_user_activity(UUID, TEXT, JSONB, TEXT, TEXT, INET, TEXT, BOOLEAN);

-- 2. Create the correct log_user_activity function that matches what the app expects
CREATE OR REPLACE FUNCTION public.log_user_activity(
  activity_type TEXT,
  activity_data JSONB DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  user_uuid UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_data,
    user_agent,
    created_at
  ) VALUES (
    COALESCE(user_uuid, auth.uid()),
    activity_type,
    activity_data,
    user_agent_param,
    NOW()
  );
END;
$$;

-- 3. Drop and recreate get_user_details_with_emails function
DROP FUNCTION IF EXISTS public.get_user_details_with_emails(UUID);
DROP FUNCTION IF EXISTS public.get_user_details_with_emails();

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
    au.email,
    up.display_name,
    up.bio,
    up.avatar_url,
    up.title,
    up.company,
    up.location,
    up.website,
    up.linkedin_url,
    up.github_url,
    up.skills,
    up.experience_level,
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

-- 4. Create get_user_profile function
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  user_id UUID,
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
    up.user_id,
    up.display_name,
    up.bio,
    up.avatar_url,
    up.title,
    up.company,
    up.location,
    up.website,
    up.linkedin_url,
    up.github_url,
    up.skills,
    up.experience_level,
    up.is_admin,
    up.is_super_admin,
    up.is_senior_admin,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE (user_id_param IS NULL OR up.user_id = user_id_param);
END;
$$;

-- 5. Create update_user_profile function
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id_param UUID,
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
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id UUID;
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    bio,
    avatar_url,
    title,
    company,
    location,
    website,
    linkedin_url,
    github_url,
    skills,
    experience_level
  ) VALUES (
    user_id_param,
    display_name_param,
    bio_param,
    avatar_url_param,
    title_param,
    company_param,
    location_param,
    website_param,
    linkedin_url_param,
    github_url_param,
    skills_param,
    experience_level_param
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    display_name = COALESCE(display_name_param, user_profiles.display_name),
    bio = COALESCE(bio_param, user_profiles.bio),
    avatar_url = COALESCE(avatar_url_param, user_profiles.avatar_url),
    title = COALESCE(title_param, user_profiles.title),
    company = COALESCE(company_param, user_profiles.company),
    location = COALESCE(location_param, user_profiles.location),
    website = COALESCE(website_param, user_profiles.website),
    linkedin_url = COALESCE(linkedin_url_param, user_profiles.linkedin_url),
    github_url = COALESCE(github_url_param, user_profiles.github_url),
    skills = COALESCE(skills_param, user_profiles.skills),
    experience_level = COALESCE(experience_level_param, user_profiles.experience_level),
    updated_at = NOW()
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.log_user_activity(TEXT, JSONB, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_details_with_emails(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT) TO authenticated;

-- 7. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 8. Add updated_at triggers to tables
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.user_meetings;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.user_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.user_onboarding;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON public.user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_meetings_user_id ON public.user_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meetings_created_at ON public.user_meetings(created_at);

-- 10. Set up RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- User profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.is_admin = true OR up.is_super_admin = true OR up.is_senior_admin = true)
    )
  );

-- Activity logs policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can view their own activity logs" ON public.user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can insert their own activity logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meetings policies
DROP POLICY IF EXISTS "Users can view their own meetings" ON public.user_meetings;
CREATE POLICY "Users can view their own meetings" ON public.user_meetings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own meetings" ON public.user_meetings;
CREATE POLICY "Users can insert their own meetings" ON public.user_meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own meetings" ON public.user_meetings;
CREATE POLICY "Users can update their own meetings" ON public.user_meetings
  FOR UPDATE USING (auth.uid() = user_id);

-- Onboarding policies
DROP POLICY IF EXISTS "Users can view their own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can view their own onboarding" ON public.user_onboarding
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can insert their own onboarding" ON public.user_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can update their own onboarding" ON public.user_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

-- Success message
SELECT 'Database functions fixed successfully! All missing functions have been created.' as status;
















