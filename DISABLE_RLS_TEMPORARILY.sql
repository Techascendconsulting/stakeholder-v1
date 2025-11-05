-- TEMPORARY FIX: Disable RLS on user_profiles to unblock admin access
-- This will allow the app to work while we debug the RLS policies

ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- To re-enable later (after fixing policies):
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
