/*
  # Oddiy admin tizimi - RLS policy-larsiz

  1. Yangi jadval
    - `simple_admins` jadvali
    - `id`, `login`, `password`, `full_name`, `role`, `active`
  
  2. RLS o'chirilgan
    - Hech qanday policy yo'q
    - Oddiy CRUD operatsiyalar
  
  3. Demo adminlar
    - admin/admin123 (super admin)
    - moderator/mod123 (moderator)
*/

-- Eski jadval va funksiyalarni o'chirish
DROP TABLE IF EXISTS admin_users CASCADE;
DROP FUNCTION IF EXISTS authenticate_admin CASCADE;
DROP FUNCTION IF EXISTS set_admin_session CASCADE;
DROP FUNCTION IF EXISTS clear_admin_session CASCADE;
DROP FUNCTION IF EXISTS hash_password CASCADE;

-- Oddiy admin jadvali yaratish
CREATE TABLE IF NOT EXISTS simple_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login text UNIQUE NOT NULL,
  password text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS o'chirish
ALTER TABLE simple_admins DISABLE ROW LEVEL SECURITY;

-- Demo adminlarni qo'shish
INSERT INTO simple_admins (login, password, full_name, role) VALUES
('admin', 'admin123', 'Super Admin', 'admin'),
('moderator', 'mod123', 'Moderator User', 'moderator')
ON CONFLICT (login) DO NOTHING;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_simple_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_simple_admins_updated_at
  BEFORE UPDATE ON simple_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_simple_admins_updated_at();