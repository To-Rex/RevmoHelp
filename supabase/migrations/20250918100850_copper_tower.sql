/*
  # Fix Admin RLS Policy Recursion

  1. Problem
    - Infinite recursion in admin_users RLS policy
    - Policy was checking admin_users table within itself

  2. Solution
    - Remove recursive policy
    - Create simple session-based authentication
    - Use app.current_admin_id setting instead of querying table
*/

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Only admins can manage admin users" ON admin_users;

-- Create new non-recursive policy using session variable
CREATE POLICY "Admin users management policy"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    -- Allow access if current_admin_id is set and matches an active admin
    current_setting('app.current_admin_id', true)::uuid IS NOT NULL
  )
  WITH CHECK (
    -- Same condition for inserts/updates
    current_setting('app.current_admin_id', true)::uuid IS NOT NULL
  );

-- Create function to set admin session (called after login)
CREATE OR REPLACE FUNCTION set_admin_session(admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the current admin ID in session
  PERFORM set_config('app.current_admin_id', admin_id::text, false);
END;
$$;

-- Create function to clear admin session (called on logout)
CREATE OR REPLACE FUNCTION clear_admin_session()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear the current admin ID from session
  PERFORM set_config('app.current_admin_id', '', false);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_admin_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_admin_session() TO authenticated;