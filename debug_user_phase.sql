-- Run this query in Supabase SQL Editor to check a user's phase
-- Replace 'USER_EMAIL_HERE' with the actual user's email

SELECT 
  au.email,
  up.user_type,
  COUNT(*) FILTER (WHERE lp.status = 'completed') as completed_modules,
  COUNT(*) FILTER (WHERE lp.status = 'in_progress') as in_progress_modules,
  COUNT(*) FILTER (WHERE lp.status = 'unlocked') as unlocked_modules,
  CASE 
    WHEN COUNT(*) FILTER (WHERE lp.status = 'completed') >= 10 THEN 'hands-on'
    WHEN COUNT(*) FILTER (WHERE lp.status = 'completed') >= 3 THEN 'practice'
    ELSE 'learning'
  END as calculated_phase,
  json_agg(
    json_build_object(
      'module_id', lp.module_id,
      'status', lp.status,
      'assignment_completed', lp.assignment_completed,
      'completed_lessons', array_length(lp.completed_lessons, 1)
    ) ORDER BY lp.module_id
  ) FILTER (WHERE lp.module_id IS NOT NULL) as module_details
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN learning_progress lp ON au.id = lp.user_id
WHERE au.email = 'USER_EMAIL_HERE'
GROUP BY au.email, up.user_type, au.id;
