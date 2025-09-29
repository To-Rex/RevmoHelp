/*
  # Create doctor profiles system

  1. New Tables
    - `doctor_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `full_name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `specialization` (text)
      - `experience_years` (integer)
      - `bio` (text, optional)
      - `avatar_url` (text, optional)
      - `certificates` (text array)
      - `education` (text array)
      - `languages` (text array)
      - `consultation_fee` (integer, optional)
      - `consultation_duration` (integer, optional)
      - `working_hours` (jsonb, optional)
      - `verified` (boolean, default false)
      - `active` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `doctor_profile_translations`
      - `id` (uuid, primary key)
      - `doctor_profile_id` (uuid, foreign key)
      - `language` (text, check constraint)
      - `bio` (text, optional)
      - `specialization` (text, optional)
      - `education` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for doctors to manage their own profiles
    - Add policies for admins to manage all profiles
    - Add policies for public to view verified profiles
*/

-- Create doctor_profiles table
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  specialization text NOT NULL,
  experience_years integer DEFAULT 0 NOT NULL,
  bio text,
  avatar_url text,
  certificates text[] DEFAULT '{}',
  education text[] DEFAULT '{}',
  languages text[] DEFAULT '{"uz"}',
  consultation_fee integer DEFAULT 0,
  consultation_duration integer DEFAULT 30,
  working_hours jsonb DEFAULT '{}',
  verified boolean DEFAULT false,
  active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create doctor_profile_translations table
CREATE TABLE IF NOT EXISTS doctor_profile_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_profile_id uuid REFERENCES doctor_profiles(id) ON DELETE CASCADE NOT NULL,
  language text NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  bio text,
  specialization text,
  education text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(doctor_profile_id, language)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verified ON doctor_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_active ON doctor_profiles(active);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialization ON doctor_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_profile_translations_profile_id ON doctor_profile_translations(doctor_profile_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profile_translations_language ON doctor_profile_translations(language);

-- Enable RLS
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profile_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctor_profiles
CREATE POLICY "Doctors can view and edit their own profile"
  ON doctor_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all doctor profiles"
  ON doctor_profiles
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

CREATE POLICY "Anyone can view verified and active doctor profiles"
  ON doctor_profiles
  FOR SELECT
  TO public
  USING (verified = true AND active = true);

-- RLS Policies for doctor_profile_translations
CREATE POLICY "Doctors can manage their own profile translations"
  ON doctor_profile_translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles 
      WHERE doctor_profiles.id = doctor_profile_translations.doctor_profile_id 
      AND doctor_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctor_profiles 
      WHERE doctor_profiles.id = doctor_profile_translations.doctor_profile_id 
      AND doctor_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all doctor profile translations"
  ON doctor_profile_translations
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

CREATE POLICY "Anyone can view translations for verified doctor profiles"
  ON doctor_profile_translations
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles 
      WHERE doctor_profiles.id = doctor_profile_translations.doctor_profile_id 
      AND doctor_profiles.verified = true 
      AND doctor_profiles.active = true
    )
  );

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_doctor_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_doctor_profile_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_doctor_profiles_updated_at ON doctor_profiles;
CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_profiles_updated_at();

DROP TRIGGER IF EXISTS update_doctor_profile_translations_updated_at ON doctor_profile_translations;
CREATE TRIGGER update_doctor_profile_translations_updated_at
  BEFORE UPDATE ON doctor_profile_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_profile_translations_updated_at();