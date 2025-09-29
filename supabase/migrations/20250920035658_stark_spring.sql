/*
  # Add content_type column to patient_stories table

  1. Changes
    - Add `content_type` column to `patient_stories` table
    - Set default value to 'text'
    - Update existing records to have 'text' as content_type

  2. Security
    - No changes to RLS policies needed
*/

-- Add content_type column to patient_stories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN content_type text DEFAULT 'text';
  END IF;
END $$;

-- Update existing records to have 'text' as default content_type
UPDATE patient_stories 
SET content_type = 'text' 
WHERE content_type IS NULL;

-- Add constraint to ensure valid content types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'patient_stories_content_type_check'
  ) THEN
    ALTER TABLE patient_stories 
    ADD CONSTRAINT patient_stories_content_type_check 
    CHECK (content_type IN ('text', 'image', 'video'));
  END IF;
END $$;