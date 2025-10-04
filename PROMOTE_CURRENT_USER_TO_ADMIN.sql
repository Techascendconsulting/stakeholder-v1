-- ====================================================================
-- PROMOTE CURRENT USER TO SUPER ADMIN
-- Replace 'your-email@example.com' with your actual email address
-- ====================================================================

-- Replace this email with your actual email address
-- You can find your email in the Supabase Auth dashboard or in your app
\set user_email 'your-email@example.com'

-- Promote the user to Super Admin
SELECT public.promote_user_to_admin(:'user_email', 'super_admin');

-- Check the admin status
SELECT * FROM public.check_admin_status();

-- Show all users and their admin status
SELECT 
  au.email,
  up.display_name,
  up.is_admin,
  up.is_super_admin,
  up.is_senior_admin,
  CASE 
    WHEN up.is_super_admin THEN 'Super Admin'
    WHEN up.is_senior_admin THEN 'Senior Admin'
    WHEN up.is_admin THEN 'Admin'
    ELSE 'Student'
  END as role
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;


