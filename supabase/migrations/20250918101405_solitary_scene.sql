/*
  # Admin Authentication System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `login` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `phone` (text, optional)
      - `role` (admin_role enum: admin, moderator)
      - `active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `authenticate_admin()` - Admin login authentication
    - `set_admin_session()` - Set admin session context
    - `clear_admin_session()` - Clear admin session
    - `hash_password()` - Password hashing utility

  3. Security
    - Enable RLS on `admin_users` table
    - Add policy for admin management
    - Session-based access control

  4. Demo Data
    - Default admin user (admin/admin123)
    - Default moderator user (moderator/mod123)
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create admin role enum
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    login text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    phone text,
    role admin_role NOT NULL DEFAULT 'moderator',
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create password hashing function
CREATE OR REPLACE FUNCTION hash_password(password_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN encode(digest(password_text || 'revmoinfo_salt', 'sha256'), 'hex');
END;
$$;

-- Create admin authentication function
CREATE OR REPLACE FUNCTION authenticate_admin(
    login_param text,
    password_param text
)
RETURNS TABLE(
    admin_id uuid,
    admin_login text,
    admin_full_name text,
    admin_phone text,
    admin_role admin_role,
    admin_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_record admin_users%ROWTYPE;
    hashed_password text;
BEGIN
    -- Hash the provided password
    hashed_password := hash_password(password_param);
    
    -- Find admin with matching login and password
    SELECT *
    INTO admin_record
    FROM admin_users
    WHERE login = login_param 
      AND password_hash = hashed_password 
      AND active = true;

    -- Return admin data if found
    IF admin_record.id IS NOT NULL THEN
        RETURN QUERY SELECT 
            admin_record.id,
            admin_record.login,
            admin_record.full_name,
            admin_record.phone,
            admin_record.role,
            admin_record.active;
    END IF;
    
    RETURN;
END;
$$;

-- Create session management functions
CREATE OR REPLACE FUNCTION set_admin_session(
    admin_id_input uuid,
    login_input text,
    role_input text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.current_admin_id', admin_id_input::text, false);
    PERFORM set_config('app.current_admin_login', login_input, false);
    PERFORM set_config('app.current_admin_role', role_input, false);
END;
$$;

CREATE OR REPLACE FUNCTION clear_admin_session()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.current_admin_id', '', false);
    PERFORM set_config('app.current_admin_login', '', false);
    PERFORM set_config('app.current_admin_role', '', false);
END;
$$;

-- Create updated_at trigger function for admin_users
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin management
CREATE POLICY "Admin users management policy"
    ON admin_users
    FOR ALL
    TO authenticated
    USING ((current_setting('app.current_admin_id', true))::uuid IS NOT NULL)
    WITH CHECK ((current_setting('app.current_admin_id', true))::uuid IS NOT NULL);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_updated_at();

-- Insert demo admin users
INSERT INTO admin_users (login, password_hash, full_name, phone, role)
VALUES 
    ('admin', hash_password('admin123'), 'Super Admin', '+998901234567', 'admin'),
    ('moderator', hash_password('mod123'), 'Moderator User', '+998901234568', 'moderator')
ON CONFLICT (login) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = now();