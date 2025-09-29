/*
  # Set specific user as admin

  1. Updates
    - Set torex.amaki@gmail.com as admin role
    - Ensure admin access for this specific user
  
  2. Security
    - Only updates the specific user role
    - Maintains existing RLS policies
*/

-- Update the specific user to admin role
UPDATE profiles 
SET role = 'admin', 
    updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'torex.amaki@gmail.com'
);

-- If the profile doesn't exist, create it
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
  'admin',
  created_at,
  now()
FROM auth.users 
WHERE email = 'torex.amaki@gmail.com'
  AND id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = now();