-- Check which table has the user's progress data
-- Replace 'USER_EMAIL_HERE' with the actual user's email

-- Check OLD table (learning_progress)
SELECT 
  'OLD learning_progress table' as source,
  au.email,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE lp.status = 'completed') as completed_count,
  json_agg(
    json_build_object(
      'module_id', lp.module_id,
      'status', lp.status,
      'assignment_completed', lp.assignment_completed
    ) ORDER BY lp.module_id
  ) FILTER (WHERE lp.module_id IS NOT NULL) as records
FROM auth.users au
LEFT JOIN learning_progress lp ON au.id = lp.user_id
WHERE au.email = 'USER_EMAIL_HERE'
GROUP BY au.email

UNION ALL

-- Check NEW table (user_progress)
SELECT 
  'NEW user_progress table' as source,
  au.email,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE up.status = 'completed') as completed_count,
  json_agg(
    json_build_object(
      'stable_key', up.stable_key,
      'unit_type', up.unit_type,
      'status', up.status,
      'percent', up.percent
    ) ORDER BY up.stable_key
  ) FILTER (WHERE up.stable_key IS NOT NULL) as records
FROM auth.users au
LEFT JOIN user_progress up ON au.id = up.user_id
WHERE au.email = 'USER_EMAIL_HERE'
GROUP BY au.email;



