-- Ensure the current admin users are recognized by RLS policies on community tables
-- Update emails below as needed

UPDATE public.profiles AS p
SET 
  role = 'admin',
  is_admin = true,
  is_super_admin = COALESCE(p.is_super_admin, false),
  is_senior_admin = COALESCE(p.is_senior_admin, false)
FROM auth.users AS au
WHERE p.id = au.id
  AND au.email IN ('techascendconsulting1@gmail.com','admin@batraining.com');

-- Verify
SELECT id, email, role, is_admin, is_super_admin, is_senior_admin
FROM public.profiles
WHERE email IN ('techascendconsulting1@gmail.com','admin@batraining.com');

