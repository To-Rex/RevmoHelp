/*
  # Create diseases table and translations

  1. New Tables
    - `diseases`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `symptoms` (text array)
      - `treatment_methods` (text array)
      - `prevention_tips` (text array)
      - `featured_image_url` (text, optional)
      - `youtube_url` (text, optional)
      - `meta_title` (text, optional)
      - `meta_description` (text, optional)
      - `active` (boolean, default true)
      - `featured` (boolean, default false)
      - `order_index` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `disease_translations`
      - `id` (uuid, primary key)
      - `disease_id` (uuid, foreign key)
      - `language` (text, check constraint)
      - `name` (text)
      - `description` (text)
      - `symptoms` (text array)
      - `treatment_methods` (text array)
      - `prevention_tips` (text array)
      - `meta_title` (text, optional)
      - `meta_description` (text, optional)
      - `slug` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin management

  3. Indexes
    - Add indexes for performance optimization
    - Add unique constraints for slugs

  4. Triggers
    - Add updated_at triggers for both tables
</*/

-- Create diseases table
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  symptoms text[] DEFAULT '{}',
  treatment_methods text[] DEFAULT '{}',
  prevention_tips text[] DEFAULT '{}',
  featured_image_url text,
  youtube_url text,
  meta_title text,
  meta_description text,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create disease translations table
CREATE TABLE IF NOT EXISTS disease_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  name text NOT NULL,
  description text DEFAULT '',
  symptoms text[] DEFAULT '{}',
  treatment_methods text[] DEFAULT '{}',
  prevention_tips text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  slug text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(disease_id, language),
  UNIQUE(language, slug)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_diseases_active ON diseases(active);
CREATE INDEX IF NOT EXISTS idx_diseases_featured ON diseases(featured);
CREATE INDEX IF NOT EXISTS idx_diseases_order ON diseases(order_index);
CREATE INDEX IF NOT EXISTS idx_diseases_slug ON diseases(slug);

CREATE INDEX IF NOT EXISTS idx_disease_translations_disease_id ON disease_translations(disease_id);
CREATE INDEX IF NOT EXISTS idx_disease_translations_language ON disease_translations(language);
CREATE INDEX IF NOT EXISTS idx_disease_translations_slug ON disease_translations(slug);

-- Enable RLS
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diseases
CREATE POLICY "Anyone can view active diseases"
  ON diseases
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Admins can manage all diseases"
  ON diseases
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

-- RLS Policies for disease translations
CREATE POLICY "Anyone can view disease translations for active diseases"
  ON disease_translations
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM diseases 
      WHERE diseases.id = disease_translations.disease_id 
      AND diseases.active = true
    )
  );

CREATE POLICY "Admins can manage all disease translations"
  ON disease_translations
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

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_diseases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_disease_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_diseases_updated_at ON diseases;
CREATE TRIGGER update_diseases_updated_at
  BEFORE UPDATE ON diseases
  FOR EACH ROW
  EXECUTE FUNCTION update_diseases_updated_at();

DROP TRIGGER IF EXISTS update_disease_translations_updated_at ON disease_translations;
CREATE TRIGGER update_disease_translations_updated_at
  BEFORE UPDATE ON disease_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_disease_translations_updated_at();

-- Insert initial diseases data
INSERT INTO diseases (name, slug, description, symptoms, treatment_methods, prevention_tips, active, featured, order_index) VALUES
(
  'Аксиальный спондилоартрит',
  'aksialniy-spondiloartrit',
  'Аксиальный спондилоартрит - это хроническое воспалительное заболевание, которое в основном поражает позвоночник и крестцово-подвздошные суставы.',
  ARRAY['Боль в пояснице', 'Утренняя скованность', 'Ограничение подвижности позвоночника', 'Усталость'],
  ARRAY['Противовоспалительные препараты', 'Биологическая терапия', 'Физиотерапия', 'Лечебная физкультура'],
  ARRAY['Регулярные физические упражнения', 'Правильная осанка', 'Отказ от курения', 'Здоровое питание'],
  true,
  true,
  1
),
(
  'Ревматоидный артрит',
  'revmatoidniy-artrit',
  'Ревматоидный артрит - это хроническое аутоиммунное заболевание, которое вызывает воспаление суставов.',
  ARRAY['Боль в суставах', 'Отек суставов', 'Утренняя скованность', 'Усталость', 'Повышение температуры'],
  ARRAY['Метотрексат', 'Биологические препараты', 'Кортикостероиды', 'Физиотерапия'],
  ARRAY['Здоровый образ жизни', 'Регулярные упражнения', 'Сбалансированное питание', 'Отказ от курения'],
  true,
  true,
  2
),
(
  'Псориатический артрит',
  'psoriaticheskiy-artrit',
  'Псориатический артрит - это воспалительное заболевание суставов, которое развивается у людей с псориазом.',
  ARRAY['Боль в суставах', 'Отек пальцев', 'Поражение кожи', 'Изменения ногтей'],
  ARRAY['Противовоспалительные препараты', 'Иммуносупрессоры', 'Биологическая терапия', 'Местное лечение'],
  ARRAY['Контроль веса', 'Защита от травм', 'Уход за кожей', 'Регулярные осмотры'],
  true,
  true,
  3
),
(
  'Системная красная волчанка',
  'sistemnaya-krasnaya-volchanка',
  'Системная красная волчанка - это аутоиммунное заболевание, которое может поражать многие органы и системы.',
  ARRAY['Сыпь на лице', 'Боль в суставах', 'Усталость', 'Повышение температуры', 'Выпадение волос'],
  ARRAY['Иммуносупрессивная терапия', 'Кортикостероиды', 'Антималярийные препараты', 'Биологическая терапия'],
  ARRAY['Защита от солнца', 'Здоровый образ жизни', 'Регулярные обследования', 'Избегание стресса'],
  true,
  true,
  4
);

-- Insert Uzbek translations
INSERT INTO disease_translations (disease_id, language, name, description, symptoms, treatment_methods, prevention_tips, slug) 
SELECT 
  d.id,
  'uz',
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN 'Aksiyal spondiloartrit'
    WHEN d.name = 'Ревматоидный артрит' THEN 'Revmatoid artrit'
    WHEN d.name = 'Псориатический артрит' THEN 'Psoriatik artrit'
    WHEN d.name = 'Системная красная волчанка' THEN 'Tizimli qizil bo''richa'
  END,
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN 'Aksiyal spondiloartrit - bu asosan umurtqa pog''onasi va sakroiliak bo''g''imlarni zararlantiruvchi surunkali yallig''lanish kasalligi.'
    WHEN d.name = 'Ревматоидный артрит' THEN 'Revmatoid artrit - bu bo''g''imlarda yallig''lanish keltirib chiqaruvchi surunkali autoimmun kasallik.'
    WHEN d.name = 'Псориатический артрит' THEN 'Psoriatik artrit - bu psoriaz kasalligi bor odamlarda rivojlanadigan bo''g''im yallig''lanish kasalligi.'
    WHEN d.name = 'Системная красная волчанка' THEN 'Tizimli qizil bo''richa - bu ko''plab organ va tizimlarni zararlantirishi mumkin bo''lgan autoimmun kasallik.'
  END,
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN ARRAY['Bel og''riqlari', 'Ertalabki qotishlik', 'Umurtqa pog''onasi harakatchanligining cheklanishi', 'Charchoq']
    WHEN d.name = 'Ревматоидный артрит' THEN ARRAY['Bo''g''im og''riqlari', 'Bo''g''im shishishi', 'Ertalabki qotishlik', 'Charchoq', 'Harorat ko''tarilishi']
    WHEN d.name = 'Псориатический артрит' THEN ARRAY['Bo''g''im og''riqlari', 'Barmoq shishishi', 'Teri zararlari', 'Tirnoq o''zgarishlari']
    WHEN d.name = 'Системная красная волчанка' THEN ARRAY['Yuzdagi toshma', 'Bo''g''im og''riqlari', 'Charchoq', 'Harorat ko''tarilishi', 'Soch to''kilishi']
  END,
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN ARRAY['Yallig''lanishga qarshi dorilar', 'Biologik terapiya', 'Fizioterapiya', 'Davolovchi jismoniy mashqlar']
    WHEN d.name = 'Ревматоидный артрит' THEN ARRAY['Metotreksat', 'Biologik preparatlar', 'Kortikosteroidlar', 'Fizioterapiya']
    WHEN d.name = 'Псориатический артрит' THEN ARRAY['Yallig''lanishga qarshi dorilar', 'Immunosupressorlar', 'Biologik terapiya', 'Mahalliy davolash']
    WHEN d.name = 'Системная красная волчанка' THEN ARRAY['Immunosupressiv terapiya', 'Kortikosteroidlar', 'Antimalyariya preparatlari', 'Biologik terapiya']
  END,
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN ARRAY['Muntazam jismoniy mashqlar', 'To''g''ri gavda holati', 'Chekishni tashlab qo''yish', 'Sog''lom ovqatlanish']
    WHEN d.name = 'Ревматоидный артрит' THEN ARRAY['Sog''lom turmush tarzi', 'Muntazam mashqlar', 'Muvozanatli ovqatlanish', 'Chekishni tashlab qo''yish']
    WHEN d.name = 'Псориатический артрит' THEN ARRAY['Vazn nazorati', 'Jarohatlardan himoyalanish', 'Teri parvarishi', 'Muntazam ko''riklar']
    WHEN d.name = 'Системная красная волчанка' THEN ARRAY['Quyoshdan himoyalanish', 'Sog''lom turmush tarzi', 'Muntazam tekshiruvlar', 'Stressdan qochish']
  END,
  d.slug || '-uz'
FROM diseases d;

-- Insert Russian translations (keep original)
INSERT INTO disease_translations (disease_id, language, name, description, symptoms, treatment_methods, prevention_tips, slug) 
SELECT 
  d.id,
  'ru',
  d.name,
  d.description,
  d.symptoms,
  d.treatment_methods,
  d.prevention_tips,
  d.slug || '-ru'
FROM diseases d;

-- Insert English translations
INSERT INTO disease_translations (disease_id, language, name, description, symptoms, treatment_methods, prevention_tips, slug) 
SELECT 
  d.id,
  'en',
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN 'Axial Spondyloarthritis'
    WHEN d.name = 'Ревматоидный артрит' THEN 'Rheumatoid Arthritis'
    WHEN d.name = 'Псориатический артрит' THEN 'Psoriatic Arthritis'
    WHEN d.name = 'Системная красная волчанка' THEN 'Systemic Lupus Erythematosus'
  END,
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN 'Axial spondyloarthritis is a chronic inflammatory disease that primarily affects the spine and sacroiliac joints.'
    WHEN d.name = 'Ревматоидный артрит' THEN 'Rheumatoid arthritis is a chronic autoimmune disease that causes joint inflammation.'
    WHEN d.name = 'Псориатический артрит' THEN 'Psoriatic arthritis is an inflammatory joint disease that develops in people with psoriasis.'
    WHEN d.name = 'Системная красная волчанка' THEN 'Systemic lupus erythematosus is an autoimmune disease that can affect many organs and systems.'
  END,
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN ARRAY['Lower back pain', 'Morning stiffness', 'Limited spinal mobility', 'Fatigue']
    WHEN d.name = 'Ревматоидный артрит' THEN ARRAY['Joint pain', 'Joint swelling', 'Morning stiffness', 'Fatigue', 'Fever']
    WHEN d.name = 'Псориатический артрит' THEN ARRAY['Joint pain', 'Finger swelling', 'Skin lesions', 'Nail changes']
    WHEN d.name = 'Системная красная волчанка' THEN ARRAY['Facial rash', 'Joint pain', 'Fatigue', 'Fever', 'Hair loss']
  END,
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN ARRAY['Anti-inflammatory drugs', 'Biological therapy', 'Physiotherapy', 'Therapeutic exercises']
    WHEN d.name = 'Ревматоидный артрит' THEN ARRAY['Methotrexate', 'Biological drugs', 'Corticosteroids', 'Physiotherapy']
    WHEN d.name = 'Псориатический артрит' THEN ARRAY['Anti-inflammatory drugs', 'Immunosuppressants', 'Biological therapy', 'Topical treatment']
    WHEN d.name = 'Системная красная волчанка' THEN ARRAY['Immunosuppressive therapy', 'Corticosteroids', 'Antimalarial drugs', 'Biological therapy']
  END,
  CASE 
    WHEN d.name = 'Аксиальный спондилоартрит' THEN ARRAY['Regular exercise', 'Proper posture', 'Quit smoking', 'Healthy diet']
    WHEN d.name = 'Ревматоидный артрит' THEN ARRAY['Healthy lifestyle', 'Regular exercise', 'Balanced nutrition', 'Quit smoking']
    WHEN d.name = 'Псориатический артрит' THEN ARRAY['Weight control', 'Injury protection', 'Skin care', 'Regular checkups']
    WHEN d.name = 'Системная красная волчанка' THEN ARRAY['Sun protection', 'Healthy lifestyle', 'Regular examinations', 'Stress avoidance']
  END,
  d.slug || '-en'
FROM diseases d;