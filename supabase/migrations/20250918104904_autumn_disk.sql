/*
  # Disable RLS for posts table

  1. Changes
    - Disable Row Level Security on posts table
    - Remove all existing policies
    - Allow public access to posts data

  2. Security
    - Posts will be publicly accessible without authentication
    - No policies needed for basic read operations
*/

-- Disable RLS on posts table
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on posts table
DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can delete posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Authors can view their own posts" ON posts;
DROP POLICY IF EXISTS "Doctors and admins can create posts" ON posts;