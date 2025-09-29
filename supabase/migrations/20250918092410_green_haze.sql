/*
  # Admin panel uchun alohida admins table yaratish

  1. Yangi Tablalar
    - `admins`
      - `id` (uuid, primary key)
      - `login` (text, unique) - admin panel uchun login
      - `password_hash` (text) - shifrlangan parol
      - `full_name` (text) - to'liq ism
      - `phone` (text) - telefon raqam
      - `role` (text) - admin yoki moderator
      - `active` (boolean) - faol/nofaol
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Xavfsizlik
    - RLS yoqilgan
    - Faqat adminlar boshqara oladi
    - Default admin hisobi yaratiladi (login: admin, parol: admin)

  3. Funksiyalar
    - Parolni tekshirish funksiyasi
    - Parolni shifrlash funksiyasi
*/

-- Parolni shifrlash uchun extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admins table yaratish
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS yoqish
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Faqat adminlar boshqara oladi
CREATE POLICY "Only admins can manage admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE login = current_setting('app.current_admin_login', true) 
      AND role = 'admin' 
      AND active = true
    )
  );

-- Parolni tekshirish funksiyasi
CREATE OR REPLACE FUNCTION verify_admin_password(input_login text, input_password text)
RETURNS TABLE(admin_id uuid, admin_login text, admin_full_name text, admin_role text, admin_phone text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.login,
    a.full_name,
    a.role,
    a.phone
  FROM admins a
  WHERE a.login = input_login 
    AND a.password_hash = crypt(input_password, a.password_hash)
    AND a.active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yangi admin yaratish funksiyasi
CREATE OR REPLACE FUNCTION create_admin(
  input_login text,
  input_password text,
  input_full_name text,
  input_phone text DEFAULT NULL,
  input_role text DEFAULT 'moderator'
)
RETURNS uuid AS $$
DECLARE
  new_admin_id uuid;
BEGIN
  INSERT INTO admins (login, password_hash, full_name, phone, role)
  VALUES (
    input_login,
    crypt(input_password, gen_salt('bf')),
    input_full_name,
    input_phone,
    input_role
  )
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Parolni o'zgartirish funksiyasi
CREATE OR REPLACE FUNCTION update_admin_password(
  admin_id uuid,
  new_password text
)
RETURNS boolean AS $$
BEGIN
  UPDATE admins 
  SET 
    password_hash = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = admin_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger yaratish
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admins_updated_at();

-- Default admin hisobini yaratish (login: admin, parol: admin)
INSERT INTO admins (login, password_hash, full_name, role)
VALUES (
  'admin',
  crypt('admin', gen_salt('bf')),
  'Super Admin',
  'admin'
) ON CONFLICT (login) DO NOTHING;