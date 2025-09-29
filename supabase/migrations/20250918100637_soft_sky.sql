/*
  # Admin tizimi yaratish

  1. Yangi jadvallar
    - `admin_users`
      - `id` (uuid, primary key)
      - `login` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `phone` (text, optional)
      - `role` (enum: admin, moderator)
      - `active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Xavfsizlik
    - RLS yoqilgan
    - Faqat adminlar boshqara oladi
    - Parollar hash qilingan

  3. Funksiyalar
    - Parol hash qilish
    - Admin autentifikatsiya
    - Updated_at trigger
*/

-- Admin role enum yaratish
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Admin users jadvali yaratish
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role admin_role NOT NULL DEFAULT 'moderator',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS yoqish
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Faqat adminlar boshqara oladi
CREATE POLICY "Only admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.login = current_setting('app.current_admin_login', true)
      AND au.role = 'admin'
      AND au.active = true
    )
  );

-- Updated_at trigger funksiyasi
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

-- Parol hash qilish funksiyasi
CREATE OR REPLACE FUNCTION hash_admin_password(password text)
RETURNS text AS $$
BEGIN
  -- Simple hash (production da bcrypt ishlatish kerak)
  RETURN encode(digest(password || 'revmoinfo_salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Admin autentifikatsiya funksiyasi
CREATE OR REPLACE FUNCTION authenticate_admin(login_param text, password_param text)
RETURNS TABLE(
  admin_id uuid,
  admin_login text,
  admin_full_name text,
  admin_phone text,
  admin_role admin_role,
  admin_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.login,
    au.full_name,
    au.phone,
    au.role,
    au.active
  FROM admin_users au
  WHERE au.login = login_param 
    AND au.password_hash = hash_admin_password(password_param)
    AND au.active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Demo adminlarni qo'shish
INSERT INTO admin_users (login, password_hash, full_name, phone, role) VALUES
  ('admin', hash_admin_password('admin123'), 'Super Admin', '+998901234567', 'admin'),
  ('moderator', hash_admin_password('moderator123'), 'Moderator User', '+998901234568', 'moderator')
ON CONFLICT (login) DO NOTHING;