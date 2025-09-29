/*
  # Kommentariyalarni avtomatik tasdiqlash

  1. Siyosat o'zgarishlari
    - Yangi kommentariyalar avtomatik tasdiqlangan holatda yaratiladi
    - Barcha foydalanuvchilar tasdiqlangan kommentariyalarni ko'ra oladi
    - Admin tasdiqlash shart emas

  2. Xavfsizlik
    - RLS faol qoladi
    - Foydalanuvchilar faqat o'z kommentariyalarini tahrirlashi mumkin
    - Adminlar barcha kommentariyalarni boshqarishi mumkin
*/

-- Eski siyosatlarni o'chirish
DROP POLICY IF EXISTS "Anyone can create comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view approved comments" ON comments;
DROP POLICY IF EXISTS "Users can edit their own comments" ON comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON comments;

-- Yangi siyosatlar - avtomatik tasdiqlash bilan
CREATE POLICY "Anyone can create approved comments"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (approved = true);

CREATE POLICY "Anyone can view all comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

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