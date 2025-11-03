-- Emergency script to unlock all locked accounts
-- Run this in Supabase SQL Editor after deploying the device lock fix

-- Unlock all locked accounts
UPDATE user_profiles
SET locked = false
WHERE locked = true;

-- Show how many accounts were unlocked
SELECT 
  COUNT(*) as unlocked_accounts,
  'All accounts have been unlocked' as message
FROM user_profiles
WHERE locked = false;

-- Show current device lock status
SELECT 
  user_id,
  email,
  locked,
  registered_device IS NOT NULL as has_device,
  LEFT(registered_device, 20) as device_preview
FROM user_profiles
ORDER BY email;






