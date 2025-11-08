-- Check admin@batraining.com profile
SELECT 
    u.id as user_id,
    u.email,
    p.user_type,
    p.is_admin,
    p.is_super_admin,
    p.is_senior_admin,
    p.locked,
    p.blocked,
    p.registered_device,
    p.display_name
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.email = 'admin@batraining.com';











