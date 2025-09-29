/*
  # Add missing youtube_url column to patient_stories

  1. New Columns
    - `youtube_url` (text, nullable) - YouTube video URL for video content type
  
  2. Changes
    - Add youtube_url column to patient_stories table
    - Update content_type check constraint to ensure proper validation
  
  3. Notes
    - This enables video content support for patient stories
    - Maintains backward compatibility with existing data
*/

-- Add youtube_url column to patient_stories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_stories' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE patient_stories ADD COLUMN youtube_url text;
  END IF;
END $$;

-- Ensure content_type constraint includes video option
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patient_stories_content_type_check' 
    AND table_name = 'patient_stories'
  ) THEN
    ALTER TABLE patient_stories DROP CONSTRAINT patient_stories_content_type_check;
  END IF;
  
  -- Add updated constraint
  ALTER TABLE patient_stories ADD CONSTRAINT patient_stories_content_type_check 
    CHECK (content_type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text]));
END $$;