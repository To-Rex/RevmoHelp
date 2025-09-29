/*
  # Add missing columns to patient_stories table

  1. New Columns
    - `lifestyle_changes` (text) - Lifestyle changes made by patient
    - `symptoms` (text[]) - Array of symptoms experienced
    - `treatment_methods` (text[]) - Array of treatment methods used
    - `medications` (text[]) - Array of medications taken
    - `rating` (integer) - Patient satisfaction rating (1-5)
    - `meta_title` (text) - SEO meta title
    - `meta_description` (text) - SEO meta description

  2. Indexes
    - Add indexes for better query performance

  3. Data Migration
    - Set default values for existing records
*/

-- Add missing columns to patient_stories table
DO $$
BEGIN
  -- Add lifestyle_changes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'lifestyle_changes'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN lifestyle_changes text DEFAULT '';
  END IF;

  -- Add symptoms column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'symptoms'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN symptoms text[] DEFAULT '{}';
  END IF;

  -- Add treatment_methods column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'treatment_methods'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN treatment_methods text[] DEFAULT '{}';
  END IF;

  -- Add medications column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'medications'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN medications text[] DEFAULT '{}';
  END IF;

  -- Add rating column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'rating'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5);
  END IF;

  -- Add meta_title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN meta_title text;
  END IF;

  -- Add meta_description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN meta_description text;
  END IF;
END $$;

-- Add missing columns to patient_story_translations table
DO $$
BEGIN
  -- Add lifestyle_changes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_story_translations' AND column_name = 'lifestyle_changes'
  ) THEN
    ALTER TABLE patient_story_translations ADD COLUMN lifestyle_changes text DEFAULT '';
  END IF;

  -- Add symptoms column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_story_translations' AND column_name = 'symptoms'
  ) THEN
    ALTER TABLE patient_story_translations ADD COLUMN symptoms text[] DEFAULT '{}';
  END IF;

  -- Add treatment_methods column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_story_translations' AND column_name = 'treatment_methods'
  ) THEN
    ALTER TABLE patient_story_translations ADD COLUMN treatment_methods text[] DEFAULT '{}';
  END IF;

  -- Add medications column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_story_translations' AND column_name = 'medications'
  ) THEN
    ALTER TABLE patient_story_translations ADD COLUMN medications text[] DEFAULT '{}';
  END IF;

  -- Add meta_title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_story_translations' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE patient_story_translations ADD COLUMN meta_title text;
  END IF;

  -- Add meta_description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_story_translations' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE patient_story_translations ADD COLUMN meta_description text;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_stories_rating ON patient_stories(rating);
CREATE INDEX IF NOT EXISTS idx_patient_stories_symptoms ON patient_stories USING GIN(symptoms);
CREATE INDEX IF NOT EXISTS idx_patient_stories_medications ON patient_stories USING GIN(medications);
CREATE INDEX IF NOT EXISTS idx_patient_stories_treatment_methods ON patient_stories USING GIN(treatment_methods);

-- Update existing records with default values
UPDATE patient_stories 
SET 
  lifestyle_changes = COALESCE(lifestyle_changes, ''),
  symptoms = COALESCE(symptoms, '{}'),
  treatment_methods = COALESCE(treatment_methods, '{}'),
  medications = COALESCE(medications, '{}'),
  rating = COALESCE(rating, 5),
  meta_title = COALESCE(meta_title, patient_name || ' - ' || diagnosis),
  meta_description = COALESCE(meta_description, LEFT(story_content, 160))
WHERE 
  lifestyle_changes IS NULL 
  OR symptoms IS NULL 
  OR treatment_methods IS NULL 
  OR medications IS NULL 
  OR rating IS NULL;

-- Update existing translations with default values
UPDATE patient_story_translations 
SET 
  lifestyle_changes = COALESCE(lifestyle_changes, ''),
  symptoms = COALESCE(symptoms, '{}'),
  treatment_methods = COALESCE(treatment_methods, '{}'),
  medications = COALESCE(medications, '{}'),
  meta_title = COALESCE(meta_title, patient_name || ' - ' || diagnosis),
  meta_description = COALESCE(meta_description, LEFT(story_content, 160))
WHERE 
  lifestyle_changes IS NULL 
  OR symptoms IS NULL 
  OR treatment_methods IS NULL 
  OR medications IS NULL;