/*
  # Optimized Doctor Functions with Translations

  1. New Functions
    - `get_doctors_optimized(language, active_only, verified_only, limit_count)`
      - Combines doctors and doctor_profiles tables
      - Includes translations based on language
      - Server-side filtering for better performance
    - `get_doctor_by_id_optimized(doctor_id, language)`
      - Single doctor retrieval with translations
      - Searches both tables efficiently

  2. Performance Benefits
    - Single SQL query instead of multiple
    - Server-side JOIN operations
    - Reduced network traffic
    - Built-in translation handling

  3. Language Support
    - Automatic translation selection
    - Fallback to default language
    - Optimized for uz, ru, en languages
*/

-- Function to get all doctors with translations and optimizations
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
    -- Legacy doctors table (admin added)
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
    WHERE (NOT p_active_only OR d.active = TRUE)
      AND (NOT p_verified_only OR d.verified = TRUE)
    
    UNION ALL
    
    -- New doctor_profiles table (user registered)
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
      0 as order_index, -- Default order for user profiles
      dp.created_at,
      dp.updated_at,
      p_language as current_language,
      'doctor_profiles' as source_table
    FROM doctor_profiles dp
    LEFT JOIN doctor_profile_translations dpt ON dp.id = dpt.doctor_profile_id AND dpt.language = p_language
    WHERE (NOT p_active_only OR dp.active = TRUE)
      AND (NOT p_verified_only OR dp.verified = TRUE)
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
  LIMIT COALESCE(p_limit_count, 1000);
END;
$$;

-- Function to get single doctor by ID with translations
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
  -- First try legacy doctors table
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
  
  -- If not found, try doctor_profiles table
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