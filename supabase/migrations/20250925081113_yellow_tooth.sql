/*
  # Shifokorlar uchun baholash va kommentariya tizimi

  1. Yangi jadval
    - `doctor_reviews`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, foreign key to doctor_profiles)
      - `user_id` (uuid, foreign key to profiles)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `anonymous` (boolean)
      - `reviewer_name` (text, anonim uchun)
      - `approved` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Xavfsizlik
    - RLS yoqilgan
    - Barcha foydalanuvchilar baholash qo'sha oladi
    - Tasdiqlangan baholarni hamma ko'ra oladi
    - Adminlar barcha baholarni boshqara oladi
*/

CREATE TABLE IF NOT EXISTS doctor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  user_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  anonymous boolean DEFAULT false,
  reviewer_name text,
  approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT doctor_reviews_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  CONSTRAINT doctor_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor_id ON doctor_reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_user_id ON doctor_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_rating ON doctor_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_approved ON doctor_reviews(approved);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_created_at ON doctor_reviews(created_at);

-- RLS
ALTER TABLE doctor_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view approved reviews"
  ON doctor_reviews
  FOR SELECT
  TO public
  USING (approved = true);

CREATE POLICY "Authenticated users can create reviews"
  ON doctor_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous users can create reviews"
  ON doctor_reviews
  FOR INSERT
  TO anon
  WITH CHECK (approved = true);

CREATE POLICY "Users can update their own reviews"
  ON doctor_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON doctor_reviews
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

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_doctor_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctor_reviews_updated_at
  BEFORE UPDATE ON doctor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_reviews_updated_at();