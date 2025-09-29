/*
  # Kommentariyalar jadvali yaratish

  1. Yangi jadval
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `user_id` (uuid, foreign key to profiles, nullable for anonymous)
      - `author_name` (text, for anonymous users)
      - `content` (text)
      - `parent_id` (uuid, for replies, nullable)
      - `approved` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Xavfsizlik
    - RLS yoqilgan
    - Barcha foydalanuvchilar tasdiqlangan kommentariyalarni ko'ra oladi
    - Foydalanuvchilar o'z kommentariyalarini tahrirlashi mumkin
    - Adminlar barcha kommentariyalarni boshqarishi mumkin

  3. Indekslar
    - post_id bo'yicha indeks
    - user_id bo'yicha indeks
    - parent_id bo'yicha indeks
    - approved bo'yicha indeks
*/

-- Kommentariyalar jadvali yaratish
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  author_name text,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS yoqish
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Indekslar yaratish
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- RLS siyosatlari
CREATE POLICY "Anyone can view approved comments"
  ON comments
  FOR SELECT
  TO public
  USING (approved = true);

CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can edit their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all comments"
  ON comments
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

-- Updated_at trigger yaratish
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();