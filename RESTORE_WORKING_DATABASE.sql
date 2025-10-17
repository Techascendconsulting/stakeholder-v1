-- ====================================================================
-- RESTORE WORKING DATABASE - Complete Database Restoration
-- Run this in your Supabase SQL Editor to restore the working database
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
  is_public BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_senior_admin BOOLEAN DEFAULT FALSE,
  registered_device TEXT,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_projects_started INTEGER DEFAULT 0,
  total_projects_completed INTEGER DEFAULT 0,
  total_meetings_conducted INTEGER DEFAULT 0,
  total_deliverables_created INTEGER DEFAULT 0,
  total_voice_meetings INTEGER DEFAULT 0,
  total_transcript_meetings INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
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

-- 6. Create the log_user_activity function
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
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meetings_user_id ON public.user_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meetings_created_at ON public.user_meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);

-- 8. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
-- User profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- User progress policies
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.user_progress;
CREATE POLICY "Users can manage their own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User meetings policies
DROP POLICY IF EXISTS "Users can manage their own meetings" ON public.user_meetings;
CREATE POLICY "Users can manage their own meetings" ON public.user_meetings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User activity logs policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can view their own activity logs" ON public.user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activity logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON public.user_profiles;
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_progress ON public.user_progress;
CREATE TRIGGER set_updated_at_user_progress
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_meetings ON public.user_meetings;
CREATE TRIGGER set_updated_at_user_meetings
  BEFORE UPDATE ON public.user_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 11. Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_progress TO authenticated;
GRANT ALL ON public.user_meetings TO authenticated;
GRANT ALL ON public.user_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;

-- 12. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '====================================================================';
  RAISE NOTICE 'WORKING DATABASE RESTORED SUCCESSFULLY!';
  RAISE NOTICE '- user_profiles table created with admin fields';
  RAISE NOTICE '- user_progress table created';
  RAISE NOTICE '- user_meetings table created';
  RAISE NOTICE '- user_activity_logs table created';
  RAISE NOTICE '- log_user_activity function created';
  RAISE NOTICE '- RLS policies configured';
  RAISE NOTICE '- Indexes created for performance';
  RAISE NOTICE '- Triggers set up for updated_at';
  RAISE NOTICE '====================================================================';
END $$;







