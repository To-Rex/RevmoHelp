/*
  # Hamkorlar jadvali yaratish

  1. Yangi jadvallar
    - `partners`
      - `id` (uuid, primary key)
      - `name` (text, hamkor nomi)
      - `slug` (text, unique, URL uchun)
      - `logo_url` (text, logo rasmi)
      - `website_url` (text, veb-sayt)
      - `description` (text, tavsif)
      - `contact_email` (text, aloqa email)
      - `contact_phone` (text, aloqa telefon)
      - `address` (text, manzil)
      - `partnership_type` (text, hamkorlik turi)
      - `active` (boolean, faol holat)
      - `featured` (boolean, asosiy hamkorlar)
      - `order_index` (integer, tartib)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Xavfsizlik
    - RLS yoqish
    - Ommaga ko'rish ruxsati
    - Adminlarga boshqarish ruxsati

  3. Indekslar
    - Slug uchun unique indeks
    - Active va featured uchun indekslar
*/

-- Hamkorlar jadvali yaratish
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  website_url text,
  description text,
  contact_email text,
  contact_phone text,
  address text,
  partnership_type text DEFAULT 'general',
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS yoqish
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Ommaga ko'rish ruxsati (faqat faol hamkorlar)
CREATE POLICY "Anyone can view active partners"
  ON partners
  FOR SELECT
  TO public
  USING (active = true);

-- Adminlarga to'liq boshqaruv ruxsati
CREATE POLICY "Admins can manage all partners"
  ON partners
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
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_partners_updated_at();

-- Indekslar yaratish
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(active);
CREATE INDEX IF NOT EXISTS idx_partners_featured ON partners(featured);
CREATE INDEX IF NOT EXISTS idx_partners_order ON partners(order_index);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partnership_type);

-- Demo ma'lumotlar qo'shish
INSERT INTO partners (name, slug, logo_url, website_url, description, contact_email, contact_phone, address, partnership_type, active, featured, order_index) VALUES
('Toshkent Tibbiyot Akademiyasi', 'toshkent-tibbiyot-akademiyasi', 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://tma.uz', 'O''zbekistonning yetakchi tibbiyot ta''lim muassasasi. Yuqori malakali shifokorlar tayyorlaydi.', 'info@tma.uz', '+998 71 150 78 00', 'Toshkent, Farabi ko''chasi 2', 'education', true, true, 1),
('Respublika Ixtisoslashtirilgan Terapiya Markazi', 'respublika-terapiya-markazi', 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://therapy.uz', 'Terapiya va tibbiy reabilitatsiya bo''yicha ixtisoslashgan markaz.', 'info@therapy.uz', '+998 71 120 45 67', 'Toshkent, Navoi ko''chasi 78', 'medical', true, true, 2),
('O''zbekiston Revmatologlar Assotsiatsiyasi', 'uzbekiston-revmatologlar-assotsiatsiyasi', 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://rheumatology.uz', 'O''zbekiston revmatologlarining professional birlashmasi.', 'info@rheumatology.uz', '+998 71 234 56 78', 'Toshkent, Amir Temur ko''chasi 15', 'association', true, true, 3),
('Xalqaro Tibbiyot Markazi', 'xalqaro-tibbiyot-markazi', 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://imc.uz', 'Xalqaro standartlarda tibbiy xizmatlar ko''rsatuvchi markaz.', 'info@imc.uz', '+998 71 345 67 89', 'Toshkent, Mirzo Ulug''bek ko''chasi 56', 'medical', true, false, 4),
('Tibbiy Texnologiyalar Instituti', 'tibbiy-texnologiyalar-instituti', 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://medtech.uz', 'Zamonaviy tibbiy texnologiyalar va innovatsiyalar markazi.', 'info@medtech.uz', '+998 71 456 78 90', 'Toshkent, Chilonzor tumani', 'technology', true, false, 5),
('Oila Shifokorlari Markazi', 'oila-shifokorlari-markazi', 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://familydoc.uz', 'Oila shifokorlari xizmatlari va birlamchi tibbiy yordam.', 'info@familydoc.uz', '+998 71 567 89 01', 'Toshkent, Yashnobod tumani', 'medical', false, false, 6)
ON CONFLICT (slug) DO NOTHING;