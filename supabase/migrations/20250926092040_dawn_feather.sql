/*
  # Combined Doctors Function

  1. New Functions
    - `get_all_doctors_combined(language, active_only, verified_only, limit_count)`
      - Combines data from both `doctors` and `doctor_profiles` tables
      - Returns unified doctor data with translations
      - Supports language-specific content
    
  2. Features
    - Fetches admin-added doctors from `doctors` table
    - Fetches user-created profiles from `doctor_profiles` table
    - Applies translations based on language parameter
    - Filters by active/verified status
    - Orders by experience_years descending
    
  3. Performance
    - Single function call instead of multiple queries
    - Server-side processing and filtering
    - Optimized for fast response times
*/

-- Function to get combined doctors from both tables
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
    -- Get doctors from legacy doctors table
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
    
    -- Get doctors from doctor_profiles table
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

-- Function to get single doctor by ID from both tables
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
  -- First try doctor_profiles table
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
  
  -- If not found, try legacy doctors table
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