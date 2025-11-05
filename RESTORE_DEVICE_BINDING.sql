-- Restore device binding for admin@batraining.com
UPDATE user_profiles 
SET registered_device = 'test-device-123'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@batraining.com'
);














