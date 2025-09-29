/*
  # Bemorlar tarixi jadvali yaratish

  1. Yangi jadvallar
    - `patient_stories`
      - `id` (uuid, primary key)
      - `patient_name` (text)
      - `age` (integer)
      - `diagnosis` (text)
      - `story_content` (text)
      - `treatment_duration` (text)
      - `outcome` (text)
      - `doctor_name` (text)
      - `featured_image_url` (text, optional)
      - `published` (boolean)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `patient_story_translations`
      - `id` (uuid, primary key)
      - `story_id` (uuid, foreign key)
      - `language` (text)
      - `patient_name` (text)
      - `diagnosis` (text)
      - `story_content` (text)
      - `treatment_duration` (text)
      - `outcome` (text)
      - `doctor_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Xavfsizlik
    - RLS yoqish
    - Adminlar uchun boshqaruv siyosati
    - Ommaviy ko'rish siyosati
*/

-- Bemorlar tarixi jadvali
CREATE TABLE IF NOT EXISTS patient_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  age integer DEFAULT 0,
  diagnosis text NOT NULL,
  story_content text NOT NULL,
  treatment_duration text DEFAULT '',
  outcome text DEFAULT '',
  doctor_name text DEFAULT '',
  featured_image_url text,
  published boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bemorlar tarixi tarjimalari jadvali
CREATE TABLE IF NOT EXISTS patient_story_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES patient_stories(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language = ANY (ARRAY['uz'::text, 'ru'::text, 'en'::text])),
  patient_name text NOT NULL,
  diagnosis text NOT NULL,
  story_content text NOT NULL,
  treatment_duration text DEFAULT '',
  outcome text DEFAULT '',
  doctor_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(story_id, language)
);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_patient_stories_published ON patient_stories(published);
CREATE INDEX IF NOT EXISTS idx_patient_stories_order ON patient_stories(order_index);
CREATE INDEX IF NOT EXISTS idx_patient_story_translations_story_id ON patient_story_translations(story_id);
CREATE INDEX IF NOT EXISTS idx_patient_story_translations_language ON patient_story_translations(language);

-- RLS yoqish
ALTER TABLE patient_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_story_translations ENABLE ROW LEVEL SECURITY;

-- Siyosatlar - patient_stories
CREATE POLICY "Anyone can view published patient stories"
  ON patient_stories
  FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Admins can manage all patient stories"
  ON patient_stories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text])
    )
  );

-- Siyosatlar - patient_story_translations
CREATE POLICY "Anyone can view published story translations"
  ON patient_story_translations
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM patient_stories 
      WHERE patient_stories.id = patient_story_translations.story_id 
      AND patient_stories.published = true
    )
  );

CREATE POLICY "Admins can manage all story translations"
  ON patient_story_translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text])
    )
  );

-- Trigger funksiyalari
CREATE OR REPLACE FUNCTION update_patient_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_patient_story_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggerlar
CREATE TRIGGER update_patient_stories_updated_at
  BEFORE UPDATE ON patient_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_stories_updated_at();

CREATE TRIGGER update_patient_story_translations_updated_at
  BEFORE UPDATE ON patient_story_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_story_translations_updated_at();