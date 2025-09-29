/*
  # Update user roles and admin access

  1. Functions
    - Update handle_new_user function to properly set user metadata
    - Add function to update user roles
  
  2. Security
    - Update RLS policies for admin access
    - Ensure proper role management
  
  3. Sample Data
    - Create sample admin user for testing
*/

-- Update the handle_new_user function to properly handle user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'role', 'patient'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;
  
  -- Update the role
  UPDATE profiles 
  SET role = new_role, updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update posts policies to allow proper access
DROP POLICY IF EXISTS "Doctors and admins can create posts" ON posts;
CREATE POLICY "Doctors and admins can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator', 'doctor')
    )
  );

-- Create a sample admin user (you can update this email to your own)
-- Note: This will only work if the user exists in auth.users
DO $$
BEGIN
  -- Try to create an admin profile if it doesn't exist
  INSERT INTO public.profiles (id, full_name, role, verified)
  SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Admin User'),
    'admin',
    true
  FROM auth.users 
  WHERE email = 'admin@revmoinfo.uz'
  ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    verified = true,
    updated_at = now();
    
  -- Also try with any existing Google user to make them admin
  UPDATE public.profiles 
  SET role = 'admin', verified = true, updated_at = now()
  WHERE id IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'provider' = 'google'
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if users don't exist yet
    NULL;
END $$;