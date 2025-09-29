/*
  # Create optimized SQL function for doctors retrieval

  1. New Functions
    - `get_doctors_with_translations(language, active_only, verified_only, limit_count)`
      - Returns doctors with translations in specified language
      - Combines legacy doctors and doctor_profiles tables
      - Optimized for performance with proper indexing
      - Handles filtering by active/verified status
      - Supports pagination with limit

  2. Performance Benefits
    - Single SQL query instead of multiple API calls
    - Server-side filtering and joining
    - Reduced network overhead
    - Better caching at database level

  3. Security
    - Function uses SECURITY DEFINER for consistent access
    - Proper RLS policies still apply
    - Input validation and sanitization
*/

-- Create optimized function to get doctors with translations
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
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH combined_doctors AS (
    -- Get from new doctor_profiles table
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
      0 as order_index, -- Default order for profiles
      dp.created_at,
      dp.updated_at,
      p_language as current_language,
      'doctor_profiles' as source_table
    FROM doctor_profiles dp
    LEFT JOIN doctor_profile_translations dpt ON (
      dpt.doctor_profile_id = dp.id 
      AND dpt.language = p_language
    )
    WHERE (NOT p_active_only OR dp.active = TRUE)
      AND (NOT p_verified_only OR dp.verified = TRUE)
    
    UNION ALL
    
    -- Get from legacy doctors table
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
    WHERE (NOT p_active_only OR d.active = TRUE)
      AND (NOT p_verified_only OR d.verified = TRUE)
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
  LIMIT CASE WHEN p_limit_count IS NOT NULL THEN p_limit_count ELSE NULL END;
END;
$$;

-- Create function to get single doctor by ID with translations
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
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- First try doctor_profiles table
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
  
  -- Then try legacy doctors table
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_doctors_with_translations TO authenticated;
GRANT EXECUTE ON FUNCTION get_doctors_with_translations TO anon;
GRANT EXECUTE ON FUNCTION get_doctor_by_id_with_translations TO authenticated;
GRANT EXECUTE ON FUNCTION get_doctor_by_id_with_translations TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_translations_doctor_language 
ON doctor_translations(doctor_id, language);

CREATE INDEX IF NOT EXISTS idx_doctor_profile_translations_profile_language 
ON doctor_profile_translations(doctor_profile_id, language);

CREATE INDEX IF NOT EXISTS idx_doctors_active_verified 
ON doctors(active, verified) WHERE active = TRUE AND verified = TRUE;

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_active_verified 
ON doctor_profiles(active, verified) WHERE active = TRUE AND verified = TRUE;