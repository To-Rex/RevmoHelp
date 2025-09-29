/*
  # Fix comments RLS policy

  1. Security Updates
    - Update INSERT policy to allow comment creation
    - Ensure new comments are created with approved=false
    - Allow both authenticated and anonymous users to create comments
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view approved comments" ON comments;
DROP POLICY IF EXISTS "Users can edit their own comments" ON comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON comments;

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing approved comments (public access)
CREATE POLICY "Anyone can view approved comments"
  ON comments
  FOR SELECT
  TO public
  USING (approved = true);

-- Policy for creating comments (both authenticated and anonymous users)
CREATE POLICY "Anyone can create comments"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (approved = false);

-- Policy for users to edit their own comments
CREATE POLICY "Users can edit their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND approved = false);

-- Policy for admins to manage all comments
CREATE POLICY "Admins can manage all comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );