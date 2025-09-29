/*
  # Homepage Settings Management

  1. New Tables
    - `homepage_settings`
      - `id` (uuid, primary key)
      - `section` (text) - section identifier (hero, stats, etc.)
      - `title` (text) - main title
      - `subtitle_authenticated` (text) - subtitle for logged in users
      - `subtitle_unauthenticated` (text) - subtitle for guests
      - `stats` (jsonb) - statistics data
      - `active` (boolean) - is section active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `homepage_settings` table
    - Add policy for public read access
    - Add policy for admin write access

  3. Initial Data
    - Insert default hero section settings
*/

-- Create homepage_settings table
CREATE TABLE IF NOT EXISTS homepage_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle_authenticated text,
  subtitle_unauthenticated text,
  stats jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

-- Public can read active settings
CREATE POLICY "Anyone can view active homepage settings"
  ON homepage_settings
  FOR SELECT
  TO public
  USING (active = true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage homepage settings"
  ON homepage_settings
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

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_homepage_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_homepage_settings_updated_at
  BEFORE UPDATE ON homepage_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_settings_updated_at();

-- Insert default hero section data
INSERT INTO homepage_settings (section, title, subtitle_authenticated, subtitle_unauthenticated, stats) VALUES
('hero', 
 'Revmatik kasalliklar haqida ishonchli ma''lumot',
 'Bemor va shifokorlar uchun professional tibbiy ma''lumot va yo''riqnoma platformasi',
 'Agar bemor bo''lsangiz, ro''yxatdan o''ting va professional maslahat oling',
 '{
   "articles": {"value": 500, "label": "Tibbiy Maqolalar", "suffix": "+"},
   "doctors": {"value": 50, "label": "Ekspert Shifokorlar", "suffix": "+"},
   "patients": {"value": 10000, "label": "Yordam Berilgan Bemorlar", "suffix": "+"}
 }'
) ON CONFLICT (section) DO NOTHING;