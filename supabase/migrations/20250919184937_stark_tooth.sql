/*
  # Ko'p tilli bosh sahifa sozlamalari

  1. Yangi Jadval
    - `homepage_translations`
      - `id` (uuid, primary key)
      - `section` (text) - qaysi bo'lim (hero, stats, etc.)
      - `language` (text) - til kodi (uz, ru, en)
      - `title` (text) - sarlavha
      - `subtitle_authenticated` (text) - login qilganlar uchun
      - `subtitle_unauthenticated` (text) - mehmonlar uchun
      - `stats` (jsonb) - statistika ma'lumotlari
      - `active` (boolean) - faol/faol emas
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Xavfsizlik
    - RLS yoqilgan
    - Adminlar boshqarishi mumkin
    - Hammaga ko'rish ruxsati

  3. Indekslar
    - section va language bo'yicha unique
    - language bo'yicha qidiruv
    - active bo'yicha filtr

  4. Default Ma'lumotlar
    - 3 xil tilda default content
    - Hero section uchun
*/

-- Ko'p tilli homepage sozlamalari jadvali
CREATE TABLE IF NOT EXISTS homepage_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL DEFAULT 'hero',
  language text NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  title text NOT NULL,
  subtitle_authenticated text,
  subtitle_unauthenticated text,
  stats jsonb DEFAULT '{
    "articles": {"value": 500, "label": "Tibbiy Maqolalar", "suffix": "+"},
    "doctors": {"value": 50, "label": "Ekspert Shifokorlar", "suffix": "+"},
    "patients": {"value": 10000, "label": "Yordam Berilgan Bemorlar", "suffix": "+"}
  }'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, language)
);

-- RLS yoqish
ALTER TABLE homepage_translations ENABLE ROW LEVEL SECURITY;

-- Adminlar boshqarishi mumkin
CREATE POLICY "Admins can manage homepage translations"
  ON homepage_translations
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

-- Hammaga ko'rish ruxsati
CREATE POLICY "Anyone can view active homepage translations"
  ON homepage_translations
  FOR SELECT
  TO public
  USING (active = true);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_homepage_translations_language ON homepage_translations(language);
CREATE INDEX IF NOT EXISTS idx_homepage_translations_section ON homepage_translations(section);
CREATE INDEX IF NOT EXISTS idx_homepage_translations_active ON homepage_translations(active);

-- Updated_at trigger yaratish
CREATE OR REPLACE FUNCTION update_homepage_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_homepage_translations_updated_at
  BEFORE UPDATE ON homepage_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_translations_updated_at();

-- Default ma'lumotlar qo'shish
INSERT INTO homepage_translations (section, language, title, subtitle_authenticated, subtitle_unauthenticated, stats) VALUES
-- O'zbek tili
('hero', 'uz', 
 'Revmatik kasalliklar haqida ishonchli ma''lumot',
 'Bemor va shifokorlar uchun professional tibbiy ma''lumot va yo''riqnoma platformasi',
 'Agar bemor bo''lsangiz, ro''yxatdan o''ting va professional maslahat oling',
 '{
   "articles": {"value": 500, "label": "Tibbiy Maqolalar", "suffix": "+"},
   "doctors": {"value": 50, "label": "Ekspert Shifokorlar", "suffix": "+"},
   "patients": {"value": 10000, "label": "Yordam Berilgan Bemorlar", "suffix": "+"}
 }'::jsonb),

-- Rus tili
('hero', 'ru',
 'Достоверная информация о ревматических заболеваниях',
 'Профессиональная медицинская информационная платформа для пациентов и врачей',
 'Если вы пациент, зарегистрируйтесь и получите профессиональную консультацию',
 '{
   "articles": {"value": 500, "label": "Медицинские Статьи", "suffix": "+"},
   "doctors": {"value": 50, "label": "Врачи-Эксперты", "suffix": "+"},
   "patients": {"value": 10000, "label": "Пациентов Получили Помощь", "suffix": "+"}
 }'::jsonb),

-- Ingliz tili
('hero', 'en',
 'Reliable information about rheumatic diseases',
 'Professional medical information platform for patients and doctors',
 'If you are a patient, register and get professional advice',
 '{
   "articles": {"value": 500, "label": "Medical Articles", "suffix": "+"},
   "doctors": {"value": 50, "label": "Expert Doctors", "suffix": "+"},
   "patients": {"value": 10000, "label": "Patients Helped", "suffix": "+"}
 }'::jsonb)

ON CONFLICT (section, language) DO NOTHING;