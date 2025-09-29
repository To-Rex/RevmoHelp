-- Barcha jadvallarda RLS ni o'chirish
--ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS post_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_story_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctor_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS homepage_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS homepage_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctor_profile_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctor_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consultation_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS global_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diseases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS disease_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS question_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS answer_votes DISABLE ROW LEVEL SECURITY;

-- Categories jadvali (questions uchun kerak)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles jadvali
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('admin', 'moderator', 'doctor', 'patient', 'guest')),
  avatar_url text,
  bio text,
  specialization text,
  experience_years integer,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts jadvali
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  slug text UNIQUE NOT NULL,
  meta_title text,
  meta_description text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post translations jadvali
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
  UNIQUE(post_id, language),
  UNIQUE(language, slug)
);

-- Notifications jadvali
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  target_type text DEFAULT 'individual' CHECK (target_type IN ('individual', 'broadcast')),
  target_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  read_by jsonb DEFAULT '[]'::jsonb,
  sent_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Partners jadvali
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

-- Patient stories jadvali
CREATE TABLE IF NOT EXISTS patient_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  age integer DEFAULT 0,
  diagnosis text NOT NULL,
  story_content text NOT NULL,
  treatment_duration text DEFAULT '',
  outcome text DEFAULT '',
  doctor_name text DEFAULT '',
  featured_image_url text,
  published boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  lifestyle_changes text DEFAULT '',
  symptoms text[] DEFAULT '{}',
  treatment_methods text[] DEFAULT '{}',
  medications text[] DEFAULT '{}',
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  meta_title text,
  meta_description text,
  featured boolean DEFAULT false,
  content_type text DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video')),
  youtube_url text
);

-- Patient story translations jadvali
CREATE TABLE IF NOT EXISTS patient_story_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES patient_stories(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language = ANY (ARRAY['uz'::text, 'ru'::text, 'en'::text])),
  patient_name text NOT NULL,
  diagnosis text NOT NULL,
  story_content text NOT NULL,
  treatment_duration text DEFAULT '',
  outcome text DEFAULT '',
  doctor_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  lifestyle_changes text DEFAULT '',
  symptoms text[] DEFAULT '{}',
  treatment_methods text[] DEFAULT '{}',
  medications text[] DEFAULT '{}',
  meta_title text,
  meta_description text
);

-- Doctors jadvali
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  specialization text NOT NULL,
  experience_years integer DEFAULT 0,
  bio text,
  avatar_url text,
  certificates text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctor translations jadvali
CREATE TABLE IF NOT EXISTS doctor_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language = ANY (ARRAY['uz'::text, 'ru'::text, 'en'::text])),
  bio text,
  specialization text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, language)
);

-- Homepage settings jadvali
CREATE TABLE IF NOT EXISTS homepage_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle_authenticated text,
  subtitle_unauthenticated text,
  stats jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Homepage translations jadvali
CREATE TABLE IF NOT EXISTS homepage_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL DEFAULT 'hero',
  language text NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  title text NOT NULL,
  subtitle_authenticated text,
  subtitle_unauthenticated text,
  stats jsonb DEFAULT '{
    "articles": {"value": 500, "label": "Tibbiy Maqolalar", "suffix": "+"},
    "doctors": {"value": 50, "label": "Ekspert Shifokorlar", "suffix": "+"},
    "patients": {"value": 10000, "label": "Yordam Berilgan Bemorlar", "suffix": "+"}
  }'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, language)
);

-- Comments jadvali
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  author_name text,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctor profiles jadvali
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

-- Doctor profile translations jadvali
CREATE TABLE IF NOT EXISTS doctor_profile_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_profile_id uuid NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  bio text,
  specialization text,
  education text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(doctor_profile_id, language)
);

-- Doctor reviews jadvali
CREATE TABLE IF NOT EXISTS doctor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  anonymous boolean DEFAULT false,
  reviewer_name text,
  approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Consultation requests jadvali
CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 1 AND age <= 120),
  disease_type text NOT NULL,
  phone text NOT NULL,
  comments text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Global settings jadvali
CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Diseases jadvali
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  symptoms text[] DEFAULT '{}',
  treatment_methods text[] DEFAULT '{}',
  prevention_tips text[] DEFAULT '{}',
  featured_image_url text,
  youtube_url text,
  meta_title text,
  meta_description text,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Disease translations jadvali
CREATE TABLE IF NOT EXISTS disease_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('uz', 'ru', 'en')),
  name text NOT NULL,
  description text DEFAULT '',
  symptoms text[] DEFAULT '{}',
  treatment_methods text[] DEFAULT '{}',
  prevention_tips text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(disease_id, language)
);

-- Questions jadvali
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  slug text UNIQUE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  views_count integer DEFAULT 0,
  votes_count integer DEFAULT 0,
  answers_count integer DEFAULT 0,
  best_answer_id uuid,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Answers jadvali
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_best_answer boolean DEFAULT false,
  votes_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Question votes jadvali
CREATE TABLE IF NOT EXISTS question_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type text CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Answer votes jadvali
CREATE TABLE IF NOT EXISTS answer_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type text CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(active);
CREATE INDEX IF NOT EXISTS idx_partners_featured ON partners(featured);
CREATE INDEX IF NOT EXISTS idx_partners_order ON partners(order_index);
CREATE INDEX IF NOT EXISTS idx_patient_stories_rating ON patient_stories(rating);
CREATE INDEX IF NOT EXISTS idx_patient_stories_symptoms ON patient_stories USING GIN(symptoms);
CREATE INDEX IF NOT EXISTS idx_patient_stories_medications ON patient_stories USING GIN(medications);
CREATE INDEX IF NOT EXISTS idx_patient_stories_treatment_methods ON patient_stories USING GIN(treatment_methods);
CREATE INDEX IF NOT EXISTS idx_patient_stories_featured ON patient_stories(featured);
CREATE INDEX IF NOT EXISTS idx_post_translations_language ON post_translations(language);
CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON post_translations(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctor_id ON doctor_reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_user_id ON doctor_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_rating ON doctor_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_approved ON doctor_reviews(approved);
CREATE INDEX IF NOT EXISTS idx_doctor_reviews_created_at ON doctor_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(active);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read_by ON notifications USING GIN(read_by);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_disease_type ON consultation_requests(disease_type);
CREATE INDEX IF NOT EXISTS idx_doctor_translations_doctor_language ON doctor_translations(doctor_id, language);
CREATE INDEX IF NOT EXISTS idx_doctor_profile_translations_profile_language ON doctor_profile_translations(doctor_profile_id, language);
CREATE INDEX IF NOT EXISTS idx_doctors_active_verified ON doctors(active, verified) WHERE active = TRUE AND verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_active_verified ON doctor_profiles(active, verified) WHERE active = TRUE AND verified = TRUE;

-- Umumiy updated_at trigger funksiyasi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggerlar
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_stories_updated_at BEFORE UPDATE ON patient_stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_story_translations_updated_at BEFORE UPDATE ON patient_story_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_translations_updated_at BEFORE UPDATE ON doctor_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homepage_settings_updated_at BEFORE UPDATE ON homepage_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homepage_translations_updated_at BEFORE UPDATE ON homepage_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_profile_translations_updated_at BEFORE UPDATE ON doctor_profile_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_reviews_updated_at BEFORE UPDATE ON doctor_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON consultation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_global_settings_updated_at BEFORE UPDATE ON global_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diseases_updated_at BEFORE UPDATE ON diseases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disease_translations_updated_at BEFORE UPDATE ON disease_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funksiyalar
CREATE OR REPLACE FUNCTION get_doctors_with_translations(
  p_language TEXT DEFAULT 'uz',
  p_active_only BOOLEAN DEFAULT TRUE,
  p_verified_only BOOLEAN DEFAULT TRUE,
  p_limit_count INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER,
  bio TEXT,
  avatar_url TEXT,
  certificates TEXT[],
  verified BOOLEAN,
  active BOOLEAN,
  order_index INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  current_language TEXT,
  source_table TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH combined_doctors AS (
    SELECT 
      dp.id,
      dp.full_name,
      dp.email,
      dp.phone,
      COALESCE(dpt.specialization, dp.specialization) as specialization,
      dp.experience_years,
      COALESCE(dpt.bio, dp.bio) as bio,
      dp.avatar_url,
      dp.certificates,
      dp.verified,
      dp.active,
      0 as order_index,
      dp.created_at,
      dp.updated_at,
      p_language as current_language,
      'doctor_profiles' as source_table
    FROM doctor_profiles dp
    LEFT JOIN doctor_profile_translations dpt ON (
      dpt.doctor_profile_id = dp.id 
      AND dpt.language = p_language
    )
    WHERE (NOT p_active_only OR dp.active = true)
      AND (NOT p_verified_only OR dp.verified = true)
    
    UNION ALL
    
    SELECT 
      d.id,
      d.full_name,
      d.email,
      d.phone,
      COALESCE(dt.specialization, d.specialization) as specialization,
      d.experience_years,
      COALESCE(dt.bio, d.bio) as bio,
      d.avatar_url,
      d.certificates,
      d.verified,
      d.active,
      d.order_index,
      d.created_at,
      d.updated_at,
      p_language as current_language,
      'doctors' as source_table
    FROM doctors d
    LEFT JOIN doctor_translations dt ON (
      dt.doctor_id = d.id 
      AND dt.language = p_language
    )
    WHERE (NOT p_active_only OR d.active = true)
      AND (NOT p_verified_only OR d.verified = true)
  )
  SELECT 
    cd.id,
    cd.full_name,
    cd.email,
    cd.phone,
    cd.specialization,
    cd.experience_years,
    cd.bio,
    cd.avatar_url,
    cd.certificates,
    cd.verified,
    cd.active,
    cd.order_index,
    cd.created_at,
    cd.updated_at,
    cd.current_language,
    cd.source_table
  FROM combined_doctors cd
  ORDER BY cd.order_index ASC, cd.created_at DESC
  LIMIT p_limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_doctor_by_id_with_translations(
  p_doctor_id UUID,
  p_language TEXT DEFAULT 'uz'
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER,
  bio TEXT,
  avatar_url TEXT,
  certificates TEXT[],
  verified BOOLEAN,
  active BOOLEAN,
  order_index INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  current_language TEXT,
  source_table TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.full_name,
    dp.email,
    dp.phone,
    COALESCE(dpt.specialization, dp.specialization) as specialization,
    dp.experience_years,
    COALESCE(dpt.bio, dp.bio) as bio,
    dp.avatar_url,
    dp.certificates,
    dp.verified,
    dp.active,
    0 as order_index,
    dp.created_at,
    dp.updated_at,
    p_language as current_language,
    'doctor_profiles' as source_table
  FROM doctor_profiles dp
  LEFT JOIN doctor_profile_translations dpt ON (
    dpt.doctor_profile_id = dp.id 
    AND dpt.language = p_language
  )
  WHERE dp.id = p_doctor_id
  
  UNION ALL
  
  SELECT 
    d.id,
    d.full_name,
    d.email,
    d.phone,
    COALESCE(dt.specialization, d.specialization) as specialization,
    d.experience_years,
    COALESCE(dt.bio, d.bio) as bio,
    d.avatar_url,
    d.certificates,
    d.verified,
    d.active,
    d.order_index,
    d.created_at,
    d.updated_at,
    p_language as current_language,
    'doctors' as source_table
  FROM doctors d
  LEFT JOIN doctor_translations dt ON (
    dt.doctor_id = d.id 
    AND dt.language = p_language
  )
  WHERE d.id = p_doctor_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_doctors_optimized(
  p_language TEXT DEFAULT 'uz',
  p_active_only BOOLEAN DEFAULT TRUE,
  p_verified_only BOOLEAN DEFAULT TRUE,
  p_limit_count INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER,
  bio TEXT,
  avatar_url TEXT,
  certificates TEXT[],
  verified BOOLEAN,
  active BOOLEAN,
  order_index INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  current_language TEXT,
  source_table TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH combined_doctors AS (
    SELECT 
      d.id,
      d.full_name,
      d.email,
      d.phone,
      COALESCE(dt.specialization, d.specialization) as specialization,
      d.experience_years,
      COALESCE(dt.bio, d.bio) as bio,
      d.avatar_url,
      d.certificates,
      d.verified,
      d.active,
      d.order_index,
      d.created_at,
      d.updated_at,
      p_language as current_language,
      'doctors' as source_table
    FROM doctors d
    LEFT JOIN doctor_translations dt ON d.id = dt.doctor_id AND dt.language = p_language
    WHERE (NOT p_active_only OR d.active = true)
      AND (NOT p_verified_only OR d.verified = true)
    
    UNION ALL
    
    SELECT 
      dp.id,
      dp.full_name,
      dp.email,
      dp.phone,
      COALESCE(dpt.specialization, dp.specialization) as specialization,
      dp.experience_years,
      COALESCE(dpt.bio, dp.bio) as bio,
      dp.avatar_url,
      dp.certificates,
      dp.verified,
      dp.active,
      0 as order_index,
      dp.created_at,
      dp.updated_at,
      p_language as current_language,
      'doctor_profiles' as source_table
    FROM doctor_profiles dp
    LEFT JOIN doctor_profile_translations dpt ON dp.id = dpt.doctor_profile_id AND dpt.language = p_language
    WHERE (NOT p_active_only OR dp.active = true)
      AND (NOT p_verified_only OR dp.verified = true)
  )
  SELECT cd.*
  FROM combined_doctors cd
  ORDER BY cd.order_index ASC, cd.created_at DESC
  LIMIT COALESCE(p_limit_count, 1000);
END;
$$;

CREATE OR REPLACE FUNCTION get_doctor_by_id_optimized(
  p_doctor_id UUID,
  p_language TEXT DEFAULT 'uz'
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER,
  bio TEXT,
  avatar_url TEXT,
  certificates TEXT[],
  verified BOOLEAN,
  active BOOLEAN,
  order_index INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  current_language TEXT,
  source_table TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.full_name,
    d.email,
    d.phone,
    COALESCE(dt.specialization, d.specialization) as specialization,
    d.experience_years,
    COALESCE(dt.bio, d.bio) as bio,
    d.avatar_url,
    d.certificates,
    d.verified,
    d.active,
    d.order_index,
    d.created_at,
    d.updated_at,
    p_language as current_language,
    'doctors' as source_table
  FROM doctors d
  LEFT JOIN doctor_translations dt ON d.id = dt.doctor_id AND dt.language = p_language
  WHERE d.id = p_doctor_id;
  
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      dp.id,
      dp.full_name,
      dp.email,
      dp.phone,
      COALESCE(dpt.specialization, dp.specialization) as specialization,
      dp.experience_years,
      COALESCE(dpt.bio, dp.bio) as bio,
      dp.avatar_url,
      dp.certificates,
      dp.verified,
      dp.active,
      0 as order_index,
      dp.created_at,
      dp.updated_at,
      p_language as current_language,
      'doctor_profiles' as source_table
    FROM doctor_profiles dp
    LEFT JOIN doctor_profile_translations dpt ON dp.id = dpt.doctor_profile_id AND dpt.language = p_language
    WHERE dp.id = p_doctor_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_all_doctors_combined(
  p_language TEXT DEFAULT 'uz',
  p_active_only BOOLEAN DEFAULT true,
  p_verified_only BOOLEAN DEFAULT true,
  p_limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER,
  bio TEXT,
  avatar_url TEXT,
  certificates TEXT[],
  verified BOOLEAN,
  active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  source_table TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH combined_doctors AS (
    SELECT 
      d.id,
      d.full_name,
      d.email,
      d.phone,
      COALESCE(dt.specialization, d.specialization) as specialization,
      d.experience_years,
      COALESCE(dt.bio, d.bio) as bio,
      d.avatar_url,
      d.certificates,
      d.verified,
      d.active,
      d.created_at,
      d.updated_at,
      'doctors'::TEXT as source_table
    FROM doctors d
    LEFT JOIN doctor_translations dt ON d.id = dt.doctor_id AND dt.language = p_language
    WHERE (NOT p_active_only OR d.active = true)
      AND (NOT p_verified_only OR d.verified = true)
    
    UNION ALL
    
    SELECT 
      dp.id,
      dp.full_name,
      dp.email,
      dp.phone,
      COALESCE(dpt.specialization, dp.specialization) as specialization,
      dp.experience_years,
      COALESCE(dpt.bio, dp.bio) as bio,
      dp.avatar_url,
      dp.certificates,
      dp.verified,
      dp.active,
      dp.created_at,
      dp.updated_at,
      'doctor_profiles'::TEXT as source_table
    FROM doctor_profiles dp
    LEFT JOIN doctor_profile_translations dpt ON dp.id = dpt.doctor_profile_id AND dpt.language = p_language
    WHERE (NOT p_active_only OR dp.active = true)
      AND (NOT p_verified_only OR dp.verified = true)
  )
  SELECT 
    cd.id,
    cd.full_name,
    cd.email,
    cd.phone,
    cd.specialization,
    cd.experience_years,
    cd.bio,
    cd.avatar_url,
    cd.certificates,
    cd.verified,
    cd.active,
    cd.created_at,
    cd.updated_at,
    cd.source_table
  FROM combined_doctors cd
  ORDER BY cd.experience_years DESC, cd.created_at DESC
  LIMIT p_limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_doctor_by_id_combined(
  p_doctor_id UUID,
  p_language TEXT DEFAULT 'uz'
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER,
  bio TEXT,
  avatar_url TEXT,
  certificates TEXT[],
  verified BOOLEAN,
  active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  source_table TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.full_name,
    dp.email,
    dp.phone,
    COALESCE(dpt.specialization, dp.specialization) as specialization,
    dp.experience_years,
    COALESCE(dpt.bio, dp.bio) as bio,
    dp.avatar_url,
    dp.certificates,
    dp.verified,
    dp.active,
    dp.created_at,
    dp.updated_at,
    'doctor_profiles'::TEXT as source_table
  FROM doctor_profiles dp
  LEFT JOIN doctor_profile_translations dpt ON dp.id = dpt.doctor_profile_id AND dpt.language = p_language
  WHERE dp.id = p_doctor_id;
  
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      d.id,
      d.full_name,
      d.email,
      d.phone,
      COALESCE(dt.specialization, d.specialization) as specialization,
      d.experience_years,
      COALESCE(dt.bio, d.bio) as bio,
      d.avatar_url,
      d.certificates,
      d.verified,
      d.active,
      d.created_at,
      d.updated_at,
      'doctors'::TEXT as source_table
    FROM doctors d
    LEFT JOIN doctor_translations dt ON d.id = dt.doctor_id AND dt.language = p_language
    WHERE d.id = p_doctor_id;
  END IF;
END;
$$;

-- Q&A uchun funksiyalar
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions
  SET answers_count = (SELECT COUNT(*) FROM answers WHERE question_id = NEW.question_id),
      status = CASE WHEN (SELECT COUNT(*) FROM answers WHERE question_id = NEW.question_id) > 0 THEN 'answered' ELSE 'open' END
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_question_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions
  SET votes_count = (
    SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - COUNT(*) FILTER (WHERE vote_type = 'down')
    FROM question_votes WHERE question_id = NEW.question_id
  )
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_answer_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE answers
  SET votes_count = (
    SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - COUNT(*) FILTER (WHERE vote_type = 'down')
    FROM answer_votes WHERE answer_id = NEW.answer_id
  )
  WHERE id = NEW.answer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Q&A triggerlar
CREATE TRIGGER update_question_stats_trigger AFTER INSERT ON answers FOR EACH ROW EXECUTE FUNCTION update_question_stats();
CREATE TRIGGER update_question_votes_count_trigger AFTER INSERT OR UPDATE OR DELETE ON question_votes FOR EACH ROW EXECUTE FUNCTION update_question_votes_count();
CREATE TRIGGER update_answer_votes_count_trigger AFTER INSERT OR UPDATE OR DELETE ON answer_votes FOR EACH ROW EXECUTE FUNCTION update_answer_votes_count();

-- Test ma'lumotlari
INSERT INTO categories (name, slug, description) VALUES
('Artrit', 'artrit', 'Artrit bilan bog''liq kategoriya'),
('Artroz', 'artroz', 'Artroz bilan bog''liq kategoriya')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO posts (author_id, title, content, excerpt, slug, published) VALUES
((SELECT id FROM auth.users LIMIT 1), 'Revmatoid artrit haqida', 'Revmatoid artrit haqida umumiy ma''lumot...', 'Revmatoid artrit haqida qisqacha', 'revmatoid-artrit-haqida', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO partners (name, slug, logo_url, website_url, description, contact_email, contact_phone, address, partnership_type, active, featured, order_index) VALUES
('Toshkent Tibbiyot Akademiyasi', 'toshkent-tibbiyot-akademiyasi', 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://tma.uz', 'O''zbekistonning yetakchi tibbiyot ta''lim muassasasi.', 'info@tma.uz', '+998 71 150 78 00', 'Toshkent, Farabi ko''chasi 2', 'education', true, true, 1),
('Respublika Ixtisoslashtirilgan Terapiya Markazi', 'respublika-terapiya-markazi', 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://ritm.uz', 'Terapiya va revmatologiya bo''yicha ixtisoslashgan markaz.', 'info@ritm.uz', '+998 71 123 45 67', 'Toshkent, Navoiy ko''chasi 78', 'medical', true, true, 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO patient_stories (patient_name, age, diagnosis, story_content, treatment_duration, outcome, doctor_name, featured_image_url, published, order_index) VALUES
('Ali Valiyev', 45, 'Revmatoid artrit', 'Bemorning hikoyasi...', '6 oy', 'Yaxshilangan', 'Dr. Ahmadov', 'https://example.com/image.jpg', true, 1)
ON CONFLICT DO NOTHING;

INSERT INTO doctors (full_name, email, phone, specialization, experience_years, bio, avatar_url, certificates, verified, active, order_index) VALUES
('Dr. Ahmad Ahmadov', 'ahmad.ahmadov@revmoinfo.uz', '+998901234567', 'Revmatologiya', 15, 'Revmatologiya mutaxassisi.', 'https://images.pexels.com/photos/5452291/pexels-photo-5452291.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Revmatologiya diplomi', 'Xalqaro sertifikat'], true, true, 1)
ON CONFLICT (email) DO NOTHING;

INSERT INTO homepage_settings (section, title, subtitle_authenticated, subtitle_unauthenticated, stats) VALUES
('hero', 'Revmatik kasalliklar haqida ishonchli ma''lumot', 'Bemor va shifokorlar uchun professional tibbiy ma''lumot va yo''riqnoma platformasi', 'Agar bemor bo''lsangiz, ro''yxatdan o''ting va professional maslahat oling', '{
   "articles": {"value": 500, "label": "Tibbiy Maqolalar", "suffix": "+"},
   "doctors": {"value": 50, "label": "Ekspert Shifokorlar", "suffix": "+"},
   "patients": {"value": 10000, "label": "Yordam Berilgan Bemorlar", "suffix": "+"}
 }')
ON CONFLICT (section) DO NOTHING;

INSERT INTO homepage_translations (section, language, title, subtitle_authenticated, subtitle_unauthenticated, stats) VALUES
('hero', 'uz', 'Revmatik kasalliklar haqida ishonchli ma''lumot', 'Bemor va shifokorlar uchun professional tibbiy ma''lumot va yo''riqnoma platformasi', 'Agar bemor bo''lsangiz, ro''yxatdan o''ting va professional maslahat oling', '{
   "articles": {"value": 500, "label": "Tibbiy Maqolalar", "suffix": "+"},
   "doctors": {"value": 50, "label": "Ekspert Shifokorlar", "suffix": "+"},
   "patients": {"value": 10000, "label": "Yordam Berilgan Bemorlar", "suffix": "+"}
 }'::jsonb)
ON CONFLICT (section, language) DO NOTHING;

INSERT INTO diseases (name, slug, description, symptoms, treatment_methods, prevention_tips, featured_image_url, active, featured, order_index) VALUES
('Revmatoid artrit', 'revmatoid-artrit', 'Revmatoid artrit tavsifi...', ARRAY['Og''riq', 'Shishish'], ARRAY['Dori-darmon', 'Fizioterapiya'], ARRAY['Sport', 'Oziq-ovqat'], 'https://example.com/image.jpg', true, true, 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (title, content, slug, author_id, category_id, tags, status) VALUES
('Revmatoid artrit belgilari qanday?', 'Menda qo''llarimda og''riq va shishish bor.', 'revmatoid-artrit-belgilari', (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM categories LIMIT 1), ARRAY['artrit', 'belgilar'], 'open')
ON CONFLICT (slug) DO NOTHING;