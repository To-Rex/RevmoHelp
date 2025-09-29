/*
  # Shifokorlar boshqaruvi uchun jadvallar

  1. Yangi Jadvallar
    - `doctors`
      - `id` (uuid, primary key)
      - `full_name` (text, to'liq ism)
      - `email` (text, email manzil)
      - `phone` (text, telefon)
      - `specialization` (text, mutaxassislik)
      - `experience_years` (integer, tajriba yillari)
      - `bio` (text, biografiya - faqat o'zbek)
      - `avatar_url` (text, rasm URL)
      - `certificates` (text[], sertifikatlar)
      - `verified` (boolean, tasdiqlangan)
      - `active` (boolean, faol)
      - `order_index` (integer, tartib)
      - `created_at`, `updated_at` (timestamps)
    
    - `doctor_translations`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, foreign key)
      - `language` (text, til kodi)
      - `bio` (text, biografiya)
      - `specialization` (text, mutaxassislik)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS on both tables
    - Admin policies for management
    - Public read policies for active doctors
*/

-- Shifokorlar jadvali
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  specialization text NOT NULL,
  experience_years integer DEFAULT 0,
  bio text,
  avatar_url text,
  certificates text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shifokorlar tarjimalari jadvali
CREATE TABLE IF NOT EXISTS doctor_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  bio text,
  specialization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, language)
);

-- Indexlar
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(active);
CREATE INDEX IF NOT EXISTS idx_doctors_verified ON doctors(verified);
CREATE INDEX IF NOT EXISTS idx_doctors_order ON doctors(order_index);
CREATE INDEX IF NOT EXISTS idx_doctor_translations_doctor_id ON doctor_translations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_translations_language ON doctor_translations(language);

-- RLS yoqish
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_translations ENABLE ROW LEVEL SECURITY;

-- Doctors policies
CREATE POLICY "Anyone can view active verified doctors"
  ON doctors
  FOR SELECT
  TO public
  USING (active = true AND verified = true);

CREATE POLICY "Admins can manage all doctors"
  ON doctors
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

-- Doctor translations policies
CREATE POLICY "Anyone can view doctor translations for active doctors"
  ON doctor_translations
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM doctors 
      WHERE doctors.id = doctor_translations.doctor_id 
      AND doctors.active = true 
      AND doctors.verified = true
    )
  );

CREATE POLICY "Admins can manage all doctor translations"
  ON doctor_translations
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

-- Trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_doctors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_doctor_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_doctors_updated_at();

CREATE TRIGGER update_doctor_translations_updated_at
  BEFORE UPDATE ON doctor_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_translations_updated_at();

-- Demo ma'lumotlar
INSERT INTO doctors (full_name, email, phone, specialization, experience_years, bio, avatar_url, certificates, verified, active, order_index) VALUES
('Dr. Aziza Karimova', 'aziza.karimova@revmoinfo.uz', '+998901234567', 'Revmatologiya', 15, 'Revmatologiya bo''yicha 15 yillik tajribaga ega mutaxassis. Revmatoid artrit va boshqa autoimmun kasalliklar bo''yicha ekspert.', 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Revmatologiya diplomi', 'Autoimmun kasalliklar sertifikati'], true, true, 1),
('Dr. Bobur Toshmatov', 'bobur.toshmatov@revmoinfo.uz', '+998901234568', 'Ortopediya va travmatologiya', 12, 'Ortopediya va travmatologiya mutaxassisi. Qo''shma kasalliklari va jarrohlik amaliyotlari bo''yicha tajribali.', 'https://images.pexels.com/photos/6098828/pexels-photo-6098828.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Ortopediya diplomi', 'Jarrohlik sertifikati'], true, true, 2),
('Dr. Nilufar Abdullayeva', 'nilufar.abdullayeva@revmoinfo.uz', '+998901234569', 'Reabilitatsiya va jismoniy terapiya', 10, 'Reabilitatsiya va jismoniy terapiya mutaxassisi. Harakat terapiyasi va bemor reabilitatsiyasi bo''yicha ekspert.', 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Jismoniy terapiya diplomi', 'Reabilitatsiya sertifikati'], true, true, 3),
('Dr. Sardor Rahimov', 'sardor.rahimov@revmoinfo.uz', '+998901234570', 'Ichki kasalliklar, Kardiologiya', 18, 'Ichki kasalliklar va kardiologiya mutaxassisi. Yurak-qon tomir kasalliklari va metabolik buzilishlar bo''yicha tajribali.', 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Ichki kasalliklar diplomi', 'Kardiologiya sertifikati'], true, true, 4)
ON CONFLICT (email) DO NOTHING;

-- Demo tarjimalar
DO $$
DECLARE
    doctor_record RECORD;
BEGIN
    FOR doctor_record IN SELECT id, bio, specialization FROM doctors LOOP
        -- Rus tili tarjimasi
        INSERT INTO doctor_translations (doctor_id, language, bio, specialization) VALUES
        (doctor_record.id, 'ru', '[RU] ' || doctor_record.bio, '[RU] ' || doctor_record.specialization)
        ON CONFLICT (doctor_id, language) DO NOTHING;
        
        -- Ingliz tili tarjimasi
        INSERT INTO doctor_translations (doctor_id, language, bio, specialization) VALUES
        (doctor_record.id, 'en', '[EN] ' || doctor_record.bio, '[EN] ' || doctor_record.specialization)
        ON CONFLICT (doctor_id, language) DO NOTHING;
    END LOOP;
END $$;