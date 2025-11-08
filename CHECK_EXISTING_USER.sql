-- Check which user is having access issues
SELECT 
    u.email,
    p.user_type,
    p.is_admin,
    p.is_super_admin,
    p.is_senior_admin,
    p.locked,
    p.blocked,
    p.display_name
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE 
    u.email NOT LIKE '%test%'
    AND u.email NOT LIKE '%demo%'
ORDER BY u.created_at DESC
LIMIT 10;







