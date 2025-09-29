/*
  # Add featured column to patient_stories table

  1. Changes
    - Add `featured` column to `patient_stories` table
    - Set default value to `false`
    - Add index for better query performance

  2. Security
    - No changes to existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'featured'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;

-- Add index for featured stories
CREATE INDEX IF NOT EXISTS idx_patient_stories_featured ON patient_stories (featured);