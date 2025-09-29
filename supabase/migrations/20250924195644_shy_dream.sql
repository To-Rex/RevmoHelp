/*
  # Create global settings table for site-wide configurations

  1. New Tables
    - `global_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique) - e.g., 'color_scheme'
      - `setting_value` (jsonb) - flexible JSON data
      - `updated_by` (uuid) - admin who made the change
      - `active` (boolean) - whether setting is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `global_settings` table
    - Add policy for public read access to active settings
    - Add policy for admin write access

  3. Initial Data
    - Insert default color scheme settings
*/

-- Create global_settings table
CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active global settings"
  ON global_settings
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Admins can manage global settings"
  ON global_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY(ARRAY['admin', 'moderator'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY(ARRAY['admin', 'moderator'])
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_global_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_global_settings_updated_at
  BEFORE UPDATE ON global_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_global_settings_updated_at();

-- Insert default color scheme
INSERT INTO global_settings (setting_key, setting_value, active) VALUES (
  'color_scheme',
  '{
    "scheme": "default",
    "name": "Revmoinfo Default",
    "background": "#CAD8D6",
    "primary": "#90978C",
    "primaryHover": "#7A8177",
    "primaryActive": "#6B7268",
    "items": "#FFFFFF",
    "appliedAt": "2024-01-01T00:00:00Z",
    "appliedBy": "system"
  }',
  true
) ON CONFLICT (setting_key) DO NOTHING;