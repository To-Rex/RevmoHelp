/*
  # Multilingual Posts System

  1. New Tables
    - `post_translations` - maqola tarjimalari
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `language` (text, 'uz'|'ru'|'en')
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `meta_title` (text)
      - `meta_description` (text)
      - `slug` (text, unique per language)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes to existing tables
    - `posts` table - asosiy maqola ma'lumotlari
    - Default language 'uz' sifatida qoladi

  3. Security
    - Enable RLS on `post_translations` table
    - Add policies for public read access
    - Add policies for admin/author write access

  4. Indexes
    - Unique index on (post_id, language)
    - Index on language for filtering
    - Index on slug for URL lookup
*/

-- Create post_translations table
CREATE TABLE IF NOT EXISTS post_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  meta_title text,
  meta_description text,
  slug text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique language per post
  UNIQUE(post_id, language),
  -- Ensure unique slug per language
  UNIQUE(language, slug)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_translations_language ON post_translations(language);
CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON post_translations(slug);

-- Enable RLS
ALTER TABLE post_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published post translations"
  ON post_translations
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_translations.post_id 
      AND posts.published = true
    )
  );

CREATE POLICY "Authors can manage their post translations"
  ON post_translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_translations.post_id 
      AND posts.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_translations.post_id 
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all post translations"
  ON post_translations
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
CREATE OR REPLACE FUNCTION update_post_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_translations_updated_at
  BEFORE UPDATE ON post_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_post_translations_updated_at();

-- Insert default Uzbek translations for existing posts
DO $$
BEGIN
  -- Only insert if no translations exist yet
  IF NOT EXISTS (SELECT 1 FROM post_translations LIMIT 1) THEN
    INSERT INTO post_translations (post_id, language, title, content, excerpt, meta_title, meta_description, slug)
    SELECT 
      id,
      'uz' as language,
      title,
      content,
      excerpt,
      meta_title,
      meta_description,
      slug
    FROM posts
    WHERE published = true;
  END IF;
END $$;