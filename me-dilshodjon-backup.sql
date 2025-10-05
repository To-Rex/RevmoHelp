


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."admin_role" AS ENUM (
    'admin',
    'moderator'
);


ALTER TYPE "public"."admin_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."authenticate_admin"("login_param" "text", "password_param" "text") RETURNS TABLE("admin_id" "uuid", "admin_login" "text", "admin_full_name" "text", "admin_phone" "text", "admin_role" "public"."admin_role", "admin_active" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    admin_record admin_users%ROWTYPE;
    hashed_password text;
BEGIN
    -- Hash the provided password
    hashed_password := hash_password(password_param);
    
    -- Find admin with matching login and password
    SELECT *
    INTO admin_record
    FROM admin_users
    WHERE login = login_param 
      AND password_hash = hashed_password 
      AND active = true;

    -- Return admin data if found
    IF admin_record.id IS NOT NULL THEN
        RETURN QUERY SELECT 
            admin_record.id,
            admin_record.login,
            admin_record.full_name,
            admin_record.phone,
            admin_record.role,
            admin_record.active;
    END IF;
    
    RETURN;
END;
$$;


ALTER FUNCTION "public"."authenticate_admin"("login_param" "text", "password_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clear_admin_session"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    PERFORM set_config('app.current_admin_id', '', false);
    PERFORM set_config('app.current_admin_login', '', false);
    PERFORM set_config('app.current_admin_role', '', false);
END;
$$;


ALTER FUNCTION "public"."clear_admin_session"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_admin"("input_login" "text", "input_password" "text", "input_full_name" "text", "input_phone" "text" DEFAULT NULL::"text", "input_role" "text" DEFAULT 'moderator'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_admin_id uuid;
BEGIN
  INSERT INTO admins (login, password_hash, full_name, phone, role)
  VALUES (
    input_login,
    crypt(input_password, gen_salt('bf')),
    input_full_name,
    input_phone,
    input_role
  )
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$;


ALTER FUNCTION "public"."create_admin"("input_login" "text", "input_password" "text", "input_full_name" "text", "input_phone" "text", "input_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_doctors_combined"("p_language" "text" DEFAULT 'uz'::"text", "p_active_only" boolean DEFAULT true, "p_verified_only" boolean DEFAULT true, "p_limit_count" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "full_name" "text", "email" "text", "phone" "text", "specialization" "text", "experience_years" integer, "bio" "text", "avatar_url" "text", "certificates" "text"[], "verified" boolean, "active" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "source_table" "text")
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."get_all_doctors_combined"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctor_by_id_combined"("p_doctor_id" "uuid", "p_language" "text" DEFAULT 'uz'::"text") RETURNS TABLE("id" "uuid", "full_name" "text", "email" "text", "phone" "text", "specialization" "text", "experience_years" integer, "bio" "text", "avatar_url" "text", "certificates" "text"[], "verified" boolean, "active" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "source_table" "text")
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."get_doctor_by_id_combined"("p_doctor_id" "uuid", "p_language" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctor_by_id_optimized"("p_doctor_id" "uuid", "p_language" "text" DEFAULT 'uz'::"text") RETURNS TABLE("id" "uuid", "full_name" "text", "email" "text", "phone" "text", "specialization" "text", "experience_years" integer, "bio" "text", "avatar_url" "text", "certificates" "text"[], "verified" boolean, "active" boolean, "order_index" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "current_language" "text", "source_table" "text")
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."get_doctor_by_id_optimized"("p_doctor_id" "uuid", "p_language" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctor_by_id_with_translations"("p_doctor_id" "uuid", "p_language" "text" DEFAULT 'uz'::"text") RETURNS TABLE("id" "uuid", "full_name" "text", "email" "text", "phone" "text", "specialization" "text", "experience_years" integer, "bio" "text", "avatar_url" "text", "certificates" "text"[], "verified" boolean, "active" boolean, "order_index" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "current_language" "text", "source_table" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_doctor_by_id_with_translations"("p_doctor_id" "uuid", "p_language" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctors_optimized"("p_language" "text" DEFAULT 'uz'::"text", "p_active_only" boolean DEFAULT true, "p_verified_only" boolean DEFAULT true, "p_limit_count" integer DEFAULT NULL::integer) RETURNS TABLE("id" "uuid", "full_name" "text", "email" "text", "phone" "text", "specialization" "text", "experience_years" integer, "bio" "text", "avatar_url" "text", "certificates" "text"[], "verified" boolean, "active" boolean, "order_index" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "current_language" "text", "source_table" "text")
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."get_doctors_optimized"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctors_with_translations"("p_language" "text" DEFAULT 'uz'::"text", "p_active_only" boolean DEFAULT true, "p_verified_only" boolean DEFAULT true, "p_limit_count" integer DEFAULT NULL::integer) RETURNS TABLE("id" "uuid", "full_name" "text", "email" "text", "phone" "text", "specialization" "text", "experience_years" integer, "bio" "text", "avatar_url" "text", "certificates" "text"[], "verified" boolean, "active" boolean, "order_index" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "current_language" "text", "source_table" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_doctors_with_translations"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'role', 'patient'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hash_admin_password"("password" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Simple hash (production da bcrypt ishlatish kerak)
  RETURN encode(digest(password || 'revmoinfo_salt', 'sha256'), 'hex');
END;
$$;


ALTER FUNCTION "public"."hash_admin_password"("password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hash_password"("password_text" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN encode(digest(password_text || 'revmoinfo_salt', 'sha256'), 'hex');
END;
$$;


ALTER FUNCTION "public"."hash_password"("password_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_admin_session"("admin_id_input" "uuid", "login_input" "text", "role_input" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    PERFORM set_config('app.current_admin_id', admin_id_input::text, false);
    PERFORM set_config('app.current_admin_login', login_input, false);
    PERFORM set_config('app.current_admin_role', role_input, false);
END;
$$;


ALTER FUNCTION "public"."set_admin_session"("admin_id_input" "uuid", "login_input" "text", "role_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_published_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = now();
  ELSIF NEW.published = false THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_published_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admin_password"("admin_id" "uuid", "new_password" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE admins 
  SET 
    password_hash = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = admin_id;
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."update_admin_password"("admin_id" "uuid", "new_password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admin_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_admin_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admins_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_admins_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_answer_votes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE answers 
  SET votes_count = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0)
    FROM answer_votes 
    WHERE answer_id = COALESCE(NEW.answer_id, OLD.answer_id)
  ),
  helpful_count = (
    SELECT COUNT(*)
    FROM answer_votes 
    WHERE answer_id = COALESCE(NEW.answer_id, OLD.answer_id) AND vote_type = 'helpful'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.answer_id, OLD.answer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_answer_votes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_comments_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_consultation_requests_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_consultation_requests_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_disease_translations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_disease_translations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_diseases_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_diseases_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_doctor_profile_translations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_doctor_profile_translations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_doctor_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_doctor_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_doctor_reviews_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_doctor_reviews_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_doctor_translations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_doctor_translations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_doctors_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_doctors_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_global_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_global_settings_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_homepage_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_homepage_settings_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_homepage_translations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_homepage_translations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_notifications_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notifications_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_partners_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_partners_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_patient_stories_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_patient_stories_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_patient_story_translations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_patient_story_translations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_translations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_post_translations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_question_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update answers count
  UPDATE questions 
  SET answers_count = (
    SELECT COUNT(*) FROM answers WHERE question_id = NEW.question_id
  ),
  updated_at = now()
  WHERE id = NEW.question_id;
  
  -- Update question status to 'answered' if it was 'open'
  UPDATE questions 
  SET status = 'answered'
  WHERE id = NEW.question_id AND status = 'open';
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_question_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_question_votes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE questions 
  SET votes_count = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0)
    FROM question_votes 
    WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.question_id, OLD.question_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_question_votes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_simple_admins_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_simple_admins_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;
  
  -- Update the role
  UPDATE profiles 
  SET role = new_role, updated_at = now()
  WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_admin_password"("input_login" "text", "input_password" "text") RETURNS TABLE("admin_id" "uuid", "admin_login" "text", "admin_full_name" "text", "admin_role" "text", "admin_phone" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.login,
    a.full_name,
    a.role,
    a.phone
  FROM admins a
  WHERE a.login = input_login 
    AND a.password_hash = crypt(input_password, a.password_hash)
    AND a.active = true;
END;
$$;


ALTER FUNCTION "public"."verify_admin_password"("input_login" "text", "input_password" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "login" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "role" "public"."admin_role" DEFAULT 'moderator'::"public"."admin_role" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "login" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "role" "text" DEFAULT 'moderator'::"text" NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admins_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."answer_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "answer_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vote_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "answer_votes_vote_type_check" CHECK (("vote_type" = ANY (ARRAY['up'::"text", 'down'::"text", 'helpful'::"text"])))
);


ALTER TABLE "public"."answer_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "is_best_answer" boolean DEFAULT false,
    "votes_count" integer DEFAULT 0,
    "helpful_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "color" "text" DEFAULT '#3B82F6'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "author_name" "text",
    "content" "text" NOT NULL,
    "parent_id" "uuid",
    "approved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consultation_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "age" integer NOT NULL,
    "disease_type" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "comments" "text" DEFAULT ''::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "consultation_requests_age_check" CHECK ((("age" >= 1) AND ("age" <= 120))),
    CONSTRAINT "consultation_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'contacted'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."consultation_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."disease_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "disease_id" "uuid" NOT NULL,
    "language" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text",
    "symptoms" "text"[] DEFAULT '{}'::"text"[],
    "treatment_methods" "text"[] DEFAULT '{}'::"text"[],
    "prevention_tips" "text"[] DEFAULT '{}'::"text"[],
    "meta_title" "text",
    "meta_description" "text",
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "disease_translations_language_check" CHECK (("language" = ANY (ARRAY['uz'::"text", 'ru'::"text", 'en'::"text"])))
);


ALTER TABLE "public"."disease_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."diseases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text",
    "symptoms" "text"[] DEFAULT '{}'::"text"[],
    "treatment_methods" "text"[] DEFAULT '{}'::"text"[],
    "prevention_tips" "text"[] DEFAULT '{}'::"text"[],
    "featured_image_url" "text",
    "youtube_url" "text",
    "meta_title" "text",
    "meta_description" "text",
    "active" boolean DEFAULT true,
    "featured" boolean DEFAULT false,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."diseases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctor_profile_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "doctor_profile_id" "uuid" NOT NULL,
    "language" "text" NOT NULL,
    "bio" "text",
    "specialization" "text",
    "education" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "doctor_profile_translations_language_check" CHECK (("language" = ANY (ARRAY['uz'::"text", 'ru'::"text", 'en'::"text"])))
);


ALTER TABLE "public"."doctor_profile_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctor_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "specialization" "text" NOT NULL,
    "experience_years" integer DEFAULT 0 NOT NULL,
    "bio" "text",
    "avatar_url" "text",
    "certificates" "text"[] DEFAULT '{}'::"text"[],
    "education" "text"[] DEFAULT '{}'::"text"[],
    "languages" "text"[] DEFAULT '{uz}'::"text"[],
    "consultation_fee" integer DEFAULT 0,
    "consultation_duration" integer DEFAULT 30,
    "working_hours" "jsonb" DEFAULT '{}'::"jsonb",
    "verified" boolean DEFAULT false,
    "active" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."doctor_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctor_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "rating" integer NOT NULL,
    "comment" "text" NOT NULL,
    "anonymous" boolean DEFAULT false,
    "reviewer_name" "text",
    "approved" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "doctor_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."doctor_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctor_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "language" "text" NOT NULL,
    "bio" "text",
    "specialization" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "doctor_translations_language_check" CHECK (("language" = ANY (ARRAY['uz'::"text", 'ru'::"text", 'en'::"text"])))
);


ALTER TABLE "public"."doctor_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "specialization" "text" NOT NULL,
    "experience_years" integer DEFAULT 0,
    "bio" "text",
    "avatar_url" "text",
    "certificates" "text"[] DEFAULT '{}'::"text"[],
    "verified" boolean DEFAULT false,
    "active" boolean DEFAULT true,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."doctors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."global_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_by" "uuid",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."global_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."homepage_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle_authenticated" "text",
    "subtitle_unauthenticated" "text",
    "stats" "jsonb" DEFAULT '{}'::"jsonb",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."homepage_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."homepage_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section" "text" DEFAULT 'hero'::"text" NOT NULL,
    "language" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle_authenticated" "text",
    "subtitle_unauthenticated" "text",
    "stats" "jsonb" DEFAULT '{"doctors": {"label": "Ekspert Shifokorlar", "value": 50, "suffix": "+"}, "articles": {"label": "Tibbiy Maqolalar", "value": 500, "suffix": "+"}, "patients": {"label": "Yordam Berilgan Bemorlar", "value": 10000, "suffix": "+"}}'::"jsonb",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "homepage_translations_language_check" CHECK (("language" = ANY (ARRAY['uz'::"text", 'ru'::"text", 'en'::"text"])))
);


ALTER TABLE "public"."homepage_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" DEFAULT 'info'::"text",
    "target_type" "text" DEFAULT 'individual'::"text",
    "target_user_id" "uuid",
    "post_id" "uuid",
    "created_by" "uuid",
    "read_by" "jsonb" DEFAULT '[]'::"jsonb",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_target_type_check" CHECK (("target_type" = ANY (ARRAY['individual'::"text", 'broadcast'::"text"]))),
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['info'::"text", 'success'::"text", 'warning'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "logo_url" "text",
    "website_url" "text",
    "description" "text",
    "contact_email" "text",
    "contact_phone" "text",
    "address" "text",
    "partnership_type" "text" DEFAULT 'general'::"text",
    "active" boolean DEFAULT true,
    "featured" boolean DEFAULT false,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_stories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_name" "text" NOT NULL,
    "age" integer DEFAULT 0,
    "diagnosis" "text" NOT NULL,
    "story_content" "text" NOT NULL,
    "treatment_duration" "text" DEFAULT ''::"text",
    "outcome" "text" DEFAULT ''::"text",
    "doctor_name" "text" DEFAULT ''::"text",
    "featured_image_url" "text",
    "published" boolean DEFAULT false,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "content_type" "text" DEFAULT 'text'::"text",
    "featured" boolean DEFAULT false,
    "lifestyle_changes" "text" DEFAULT ''::"text",
    "symptoms" "text"[] DEFAULT '{}'::"text"[],
    "treatment_methods" "text"[] DEFAULT '{}'::"text"[],
    "medications" "text"[] DEFAULT '{}'::"text"[],
    "rating" integer DEFAULT 5,
    "meta_title" "text",
    "meta_description" "text",
    "youtube_url" "text",
    CONSTRAINT "patient_stories_content_type_check" CHECK (("content_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'video'::"text"]))),
    CONSTRAINT "patient_stories_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."patient_stories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_story_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "language" "text" NOT NULL,
    "patient_name" "text" NOT NULL,
    "diagnosis" "text" NOT NULL,
    "story_content" "text" NOT NULL,
    "treatment_duration" "text" DEFAULT ''::"text",
    "outcome" "text" DEFAULT ''::"text",
    "doctor_name" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "lifestyle_changes" "text" DEFAULT ''::"text",
    "symptoms" "text"[] DEFAULT '{}'::"text"[],
    "treatment_methods" "text"[] DEFAULT '{}'::"text"[],
    "medications" "text"[] DEFAULT '{}'::"text"[],
    "meta_title" "text",
    "meta_description" "text",
    CONSTRAINT "patient_story_translations_language_check" CHECK (("language" = ANY (ARRAY['uz'::"text", 'ru'::"text", 'en'::"text"])))
);


ALTER TABLE "public"."patient_story_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "language" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text" NOT NULL,
    "meta_title" "text",
    "meta_description" "text",
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "post_translations_language_check" CHECK (("language" = ANY (ARRAY['uz'::"text", 'ru'::"text", 'en'::"text"])))
);


ALTER TABLE "public"."post_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "featured_image_url" "text",
    "youtube_url" "text",
    "author_id" "uuid",
    "category_id" "uuid",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "meta_title" "text",
    "meta_description" "text",
    "published" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "views_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "role" "text" DEFAULT 'patient'::"text" NOT NULL,
    "avatar_url" "text",
    "bio" "text",
    "specialization" "text",
    "experience_years" integer,
    "verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'moderator'::"text", 'doctor'::"text", 'patient'::"text", 'guest'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vote_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "question_votes_vote_type_check" CHECK (("vote_type" = ANY (ARRAY['up'::"text", 'down'::"text"])))
);


ALTER TABLE "public"."question_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "author_id" "uuid",
    "category_id" "uuid",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'open'::"text",
    "views_count" integer DEFAULT 0,
    "votes_count" integer DEFAULT 0,
    "answers_count" integer DEFAULT 0,
    "best_answer_id" "uuid",
    "meta_title" "text",
    "meta_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "questions_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'answered'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."simple_admins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "login" "text" NOT NULL,
    "password" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "role" "text" DEFAULT 'moderator'::"text" NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "simple_admins_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))
);


ALTER TABLE "public"."simple_admins" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_login_key" UNIQUE ("login");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_login_key" UNIQUE ("login");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."answer_votes"
    ADD CONSTRAINT "answer_votes_answer_id_user_id_vote_type_key" UNIQUE ("answer_id", "user_id", "vote_type");



ALTER TABLE ONLY "public"."answer_votes"
    ADD CONSTRAINT "answer_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."answers"
    ADD CONSTRAINT "answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consultation_requests"
    ADD CONSTRAINT "consultation_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."disease_translations"
    ADD CONSTRAINT "disease_translations_disease_id_language_key" UNIQUE ("disease_id", "language");



ALTER TABLE ONLY "public"."disease_translations"
    ADD CONSTRAINT "disease_translations_language_slug_key" UNIQUE ("language", "slug");



ALTER TABLE ONLY "public"."disease_translations"
    ADD CONSTRAINT "disease_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."diseases"
    ADD CONSTRAINT "diseases_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."diseases"
    ADD CONSTRAINT "diseases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."diseases"
    ADD CONSTRAINT "diseases_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."doctor_profile_translations"
    ADD CONSTRAINT "doctor_profile_translations_doctor_profile_id_language_key" UNIQUE ("doctor_profile_id", "language");



ALTER TABLE ONLY "public"."doctor_profile_translations"
    ADD CONSTRAINT "doctor_profile_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctor_profiles"
    ADD CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctor_profiles"
    ADD CONSTRAINT "doctor_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."doctor_reviews"
    ADD CONSTRAINT "doctor_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctor_translations"
    ADD CONSTRAINT "doctor_translations_doctor_id_language_key" UNIQUE ("doctor_id", "language");



ALTER TABLE ONLY "public"."doctor_translations"
    ADD CONSTRAINT "doctor_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."global_settings"
    ADD CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."global_settings"
    ADD CONSTRAINT "global_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."homepage_settings"
    ADD CONSTRAINT "homepage_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."homepage_settings"
    ADD CONSTRAINT "homepage_settings_section_key" UNIQUE ("section");



ALTER TABLE ONLY "public"."homepage_translations"
    ADD CONSTRAINT "homepage_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."homepage_translations"
    ADD CONSTRAINT "homepage_translations_section_language_key" UNIQUE ("section", "language");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "partners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "partners_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."patient_stories"
    ADD CONSTRAINT "patient_stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_story_translations"
    ADD CONSTRAINT "patient_story_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_story_translations"
    ADD CONSTRAINT "patient_story_translations_story_id_language_key" UNIQUE ("story_id", "language");



ALTER TABLE ONLY "public"."post_translations"
    ADD CONSTRAINT "post_translations_language_slug_key" UNIQUE ("language", "slug");



ALTER TABLE ONLY "public"."post_translations"
    ADD CONSTRAINT "post_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_translations"
    ADD CONSTRAINT "post_translations_post_id_language_key" UNIQUE ("post_id", "language");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_votes"
    ADD CONSTRAINT "question_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_votes"
    ADD CONSTRAINT "question_votes_question_id_user_id_key" UNIQUE ("question_id", "user_id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."simple_admins"
    ADD CONSTRAINT "simple_admins_login_key" UNIQUE ("login");



ALTER TABLE ONLY "public"."simple_admins"
    ADD CONSTRAINT "simple_admins_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_answer_votes_answer_id" ON "public"."answer_votes" USING "btree" ("answer_id");



CREATE INDEX "idx_answer_votes_user_id" ON "public"."answer_votes" USING "btree" ("user_id");



CREATE INDEX "idx_answers_author_id" ON "public"."answers" USING "btree" ("author_id");



CREATE INDEX "idx_answers_created_at" ON "public"."answers" USING "btree" ("created_at");



CREATE INDEX "idx_answers_is_best_answer" ON "public"."answers" USING "btree" ("is_best_answer");



CREATE INDEX "idx_answers_question_id" ON "public"."answers" USING "btree" ("question_id");



CREATE INDEX "idx_answers_votes_count" ON "public"."answers" USING "btree" ("votes_count");



CREATE INDEX "idx_comments_approved" ON "public"."comments" USING "btree" ("approved");



CREATE INDEX "idx_comments_created_at" ON "public"."comments" USING "btree" ("created_at");



CREATE INDEX "idx_comments_parent_id" ON "public"."comments" USING "btree" ("parent_id");



CREATE INDEX "idx_comments_post_id" ON "public"."comments" USING "btree" ("post_id");



CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_consultation_requests_created_at" ON "public"."consultation_requests" USING "btree" ("created_at");



CREATE INDEX "idx_consultation_requests_disease_type" ON "public"."consultation_requests" USING "btree" ("disease_type");



CREATE INDEX "idx_consultation_requests_status" ON "public"."consultation_requests" USING "btree" ("status");



CREATE INDEX "idx_disease_translations_disease_id" ON "public"."disease_translations" USING "btree" ("disease_id");



CREATE INDEX "idx_disease_translations_language" ON "public"."disease_translations" USING "btree" ("language");



CREATE INDEX "idx_disease_translations_slug" ON "public"."disease_translations" USING "btree" ("slug");



CREATE INDEX "idx_diseases_active" ON "public"."diseases" USING "btree" ("active");



CREATE INDEX "idx_diseases_featured" ON "public"."diseases" USING "btree" ("featured");



CREATE INDEX "idx_diseases_order" ON "public"."diseases" USING "btree" ("order_index");



CREATE INDEX "idx_diseases_slug" ON "public"."diseases" USING "btree" ("slug");



CREATE INDEX "idx_doctor_profile_translations_language" ON "public"."doctor_profile_translations" USING "btree" ("language");



CREATE INDEX "idx_doctor_profile_translations_profile_id" ON "public"."doctor_profile_translations" USING "btree" ("doctor_profile_id");



CREATE INDEX "idx_doctor_profile_translations_profile_language" ON "public"."doctor_profile_translations" USING "btree" ("doctor_profile_id", "language");



CREATE INDEX "idx_doctor_profiles_active" ON "public"."doctor_profiles" USING "btree" ("active");



CREATE INDEX "idx_doctor_profiles_active_verified" ON "public"."doctor_profiles" USING "btree" ("active", "verified") WHERE (("active" = true) AND ("verified" = true));



CREATE INDEX "idx_doctor_profiles_specialization" ON "public"."doctor_profiles" USING "btree" ("specialization");



CREATE INDEX "idx_doctor_profiles_user_id" ON "public"."doctor_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_doctor_profiles_verified" ON "public"."doctor_profiles" USING "btree" ("verified");



CREATE INDEX "idx_doctor_reviews_approved" ON "public"."doctor_reviews" USING "btree" ("approved");



CREATE INDEX "idx_doctor_reviews_created_at" ON "public"."doctor_reviews" USING "btree" ("created_at");



CREATE INDEX "idx_doctor_reviews_doctor_id" ON "public"."doctor_reviews" USING "btree" ("doctor_id");



CREATE INDEX "idx_doctor_reviews_rating" ON "public"."doctor_reviews" USING "btree" ("rating");



CREATE INDEX "idx_doctor_reviews_user_id" ON "public"."doctor_reviews" USING "btree" ("user_id");



CREATE INDEX "idx_doctor_translations_doctor_id" ON "public"."doctor_translations" USING "btree" ("doctor_id");



CREATE INDEX "idx_doctor_translations_doctor_language" ON "public"."doctor_translations" USING "btree" ("doctor_id", "language");



CREATE INDEX "idx_doctor_translations_language" ON "public"."doctor_translations" USING "btree" ("language");



CREATE INDEX "idx_doctors_active" ON "public"."doctors" USING "btree" ("active");



CREATE INDEX "idx_doctors_active_verified" ON "public"."doctors" USING "btree" ("active", "verified") WHERE (("active" = true) AND ("verified" = true));



CREATE INDEX "idx_doctors_order" ON "public"."doctors" USING "btree" ("order_index");



CREATE INDEX "idx_doctors_verified" ON "public"."doctors" USING "btree" ("verified");



CREATE INDEX "idx_homepage_translations_active" ON "public"."homepage_translations" USING "btree" ("active");



CREATE INDEX "idx_homepage_translations_language" ON "public"."homepage_translations" USING "btree" ("language");



CREATE INDEX "idx_homepage_translations_section" ON "public"."homepage_translations" USING "btree" ("section");



CREATE INDEX "idx_notifications_active" ON "public"."notifications" USING "btree" ("active");



CREATE INDEX "idx_notifications_expires_at" ON "public"."notifications" USING "btree" ("expires_at");



CREATE INDEX "idx_notifications_read_by" ON "public"."notifications" USING "gin" ("read_by");



CREATE INDEX "idx_notifications_sent_at" ON "public"."notifications" USING "btree" ("sent_at");



CREATE INDEX "idx_notifications_target_type" ON "public"."notifications" USING "btree" ("target_type");



CREATE INDEX "idx_notifications_target_user" ON "public"."notifications" USING "btree" ("target_user_id");



CREATE INDEX "idx_partners_active" ON "public"."partners" USING "btree" ("active");



CREATE INDEX "idx_partners_featured" ON "public"."partners" USING "btree" ("featured");



CREATE INDEX "idx_partners_order" ON "public"."partners" USING "btree" ("order_index");



CREATE INDEX "idx_partners_type" ON "public"."partners" USING "btree" ("partnership_type");



CREATE INDEX "idx_patient_stories_featured" ON "public"."patient_stories" USING "btree" ("featured");



CREATE INDEX "idx_patient_stories_medications" ON "public"."patient_stories" USING "gin" ("medications");



CREATE INDEX "idx_patient_stories_order" ON "public"."patient_stories" USING "btree" ("order_index");



CREATE INDEX "idx_patient_stories_published" ON "public"."patient_stories" USING "btree" ("published");



CREATE INDEX "idx_patient_stories_rating" ON "public"."patient_stories" USING "btree" ("rating");



CREATE INDEX "idx_patient_stories_symptoms" ON "public"."patient_stories" USING "gin" ("symptoms");



CREATE INDEX "idx_patient_stories_treatment_methods" ON "public"."patient_stories" USING "gin" ("treatment_methods");



CREATE INDEX "idx_patient_story_translations_language" ON "public"."patient_story_translations" USING "btree" ("language");



CREATE INDEX "idx_patient_story_translations_story_id" ON "public"."patient_story_translations" USING "btree" ("story_id");



CREATE INDEX "idx_post_translations_language" ON "public"."post_translations" USING "btree" ("language");



CREATE INDEX "idx_post_translations_post_id" ON "public"."post_translations" USING "btree" ("post_id");



CREATE INDEX "idx_post_translations_slug" ON "public"."post_translations" USING "btree" ("slug");



CREATE INDEX "idx_question_votes_question_id" ON "public"."question_votes" USING "btree" ("question_id");



CREATE INDEX "idx_question_votes_user_id" ON "public"."question_votes" USING "btree" ("user_id");



CREATE INDEX "idx_questions_author_id" ON "public"."questions" USING "btree" ("author_id");



CREATE INDEX "idx_questions_category_id" ON "public"."questions" USING "btree" ("category_id");



CREATE INDEX "idx_questions_created_at" ON "public"."questions" USING "btree" ("created_at");



CREATE INDEX "idx_questions_slug" ON "public"."questions" USING "btree" ("slug");



CREATE INDEX "idx_questions_status" ON "public"."questions" USING "btree" ("status");



CREATE INDEX "idx_questions_views_count" ON "public"."questions" USING "btree" ("views_count");



CREATE INDEX "idx_questions_votes_count" ON "public"."questions" USING "btree" ("votes_count");



CREATE OR REPLACE TRIGGER "set_posts_published_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_published_at"();



CREATE OR REPLACE TRIGGER "update_admin_users_updated_at" BEFORE UPDATE ON "public"."admin_users" FOR EACH ROW EXECUTE FUNCTION "public"."update_admin_updated_at"();



CREATE OR REPLACE TRIGGER "update_admins_updated_at" BEFORE UPDATE ON "public"."admins" FOR EACH ROW EXECUTE FUNCTION "public"."update_admins_updated_at"();



CREATE OR REPLACE TRIGGER "update_answer_votes_count_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."answer_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_answer_votes_count"();



CREATE OR REPLACE TRIGGER "update_answers_updated_at" BEFORE UPDATE ON "public"."answers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_comments_updated_at"();



CREATE OR REPLACE TRIGGER "update_consultation_requests_updated_at" BEFORE UPDATE ON "public"."consultation_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_consultation_requests_updated_at"();



CREATE OR REPLACE TRIGGER "update_disease_translations_updated_at" BEFORE UPDATE ON "public"."disease_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_disease_translations_updated_at"();



CREATE OR REPLACE TRIGGER "update_diseases_updated_at" BEFORE UPDATE ON "public"."diseases" FOR EACH ROW EXECUTE FUNCTION "public"."update_diseases_updated_at"();



CREATE OR REPLACE TRIGGER "update_doctor_profile_translations_updated_at" BEFORE UPDATE ON "public"."doctor_profile_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_doctor_profile_translations_updated_at"();



CREATE OR REPLACE TRIGGER "update_doctor_profiles_updated_at" BEFORE UPDATE ON "public"."doctor_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_doctor_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "update_doctor_reviews_updated_at" BEFORE UPDATE ON "public"."doctor_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_doctor_reviews_updated_at"();



CREATE OR REPLACE TRIGGER "update_doctor_translations_updated_at" BEFORE UPDATE ON "public"."doctor_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_doctor_translations_updated_at"();



CREATE OR REPLACE TRIGGER "update_doctors_updated_at" BEFORE UPDATE ON "public"."doctors" FOR EACH ROW EXECUTE FUNCTION "public"."update_doctors_updated_at"();



CREATE OR REPLACE TRIGGER "update_global_settings_updated_at" BEFORE UPDATE ON "public"."global_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_global_settings_updated_at"();



CREATE OR REPLACE TRIGGER "update_homepage_settings_updated_at" BEFORE UPDATE ON "public"."homepage_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_homepage_settings_updated_at"();



CREATE OR REPLACE TRIGGER "update_homepage_translations_updated_at" BEFORE UPDATE ON "public"."homepage_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_homepage_translations_updated_at"();



CREATE OR REPLACE TRIGGER "update_notifications_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_notifications_updated_at"();



CREATE OR REPLACE TRIGGER "update_partners_updated_at" BEFORE UPDATE ON "public"."partners" FOR EACH ROW EXECUTE FUNCTION "public"."update_partners_updated_at"();



CREATE OR REPLACE TRIGGER "update_patient_stories_updated_at" BEFORE UPDATE ON "public"."patient_stories" FOR EACH ROW EXECUTE FUNCTION "public"."update_patient_stories_updated_at"();



CREATE OR REPLACE TRIGGER "update_patient_story_translations_updated_at" BEFORE UPDATE ON "public"."patient_story_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_patient_story_translations_updated_at"();



CREATE OR REPLACE TRIGGER "update_post_translations_updated_at" BEFORE UPDATE ON "public"."post_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_translations_updated_at"();



CREATE OR REPLACE TRIGGER "update_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_question_stats_trigger" AFTER INSERT ON "public"."answers" FOR EACH ROW EXECUTE FUNCTION "public"."update_question_stats"();



CREATE OR REPLACE TRIGGER "update_question_votes_count_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."question_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_question_votes_count"();



CREATE OR REPLACE TRIGGER "update_questions_updated_at" BEFORE UPDATE ON "public"."questions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_simple_admins_updated_at" BEFORE UPDATE ON "public"."simple_admins" FOR EACH ROW EXECUTE FUNCTION "public"."update_simple_admins_updated_at"();



ALTER TABLE ONLY "public"."answer_votes"
    ADD CONSTRAINT "answer_votes_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."answer_votes"
    ADD CONSTRAINT "answer_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."answers"
    ADD CONSTRAINT "answers_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."answers"
    ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."disease_translations"
    ADD CONSTRAINT "disease_translations_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctor_profile_translations"
    ADD CONSTRAINT "doctor_profile_translations_doctor_profile_id_fkey" FOREIGN KEY ("doctor_profile_id") REFERENCES "public"."doctor_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctor_profiles"
    ADD CONSTRAINT "doctor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctor_reviews"
    ADD CONSTRAINT "doctor_reviews_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctor_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctor_reviews"
    ADD CONSTRAINT "doctor_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctor_translations"
    ADD CONSTRAINT "doctor_translations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."global_settings"
    ADD CONSTRAINT "global_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_story_translations"
    ADD CONSTRAINT "patient_story_translations_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."patient_stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_translations"
    ADD CONSTRAINT "post_translations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_votes"
    ADD CONSTRAINT "question_votes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_votes"
    ADD CONSTRAINT "question_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_best_answer_id_fkey" FOREIGN KEY ("best_answer_id") REFERENCES "public"."answers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



CREATE POLICY "Admin users management policy" ON "public"."admin_users" TO "authenticated" USING ((("current_setting"('app.current_admin_id'::"text", true))::"uuid" IS NOT NULL)) WITH CHECK ((("current_setting"('app.current_admin_id'::"text", true))::"uuid" IS NOT NULL));



CREATE POLICY "Admins can manage all answers" ON "public"."answers" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all comments" ON "public"."comments" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all consultation requests" ON "public"."consultation_requests" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all disease translations" ON "public"."disease_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all diseases" ON "public"."diseases" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all doctor profile translations" ON "public"."doctor_profile_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all doctor profiles" ON "public"."doctor_profiles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all doctor translations" ON "public"."doctor_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all doctors" ON "public"."doctors" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all notifications" ON "public"."notifications" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all partners" ON "public"."partners" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all patient stories" ON "public"."patient_stories" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all post translations" ON "public"."post_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all questions" ON "public"."questions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all reviews" ON "public"."doctor_reviews" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage all story translations" ON "public"."patient_story_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage global settings" ON "public"."global_settings" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage homepage settings" ON "public"."homepage_settings" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can manage homepage translations" ON "public"."homepage_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Anonymous users can create reviews" ON "public"."doctor_reviews" FOR INSERT TO "anon" WITH CHECK (("approved" = true));



CREATE POLICY "Anyone can create approved comments" ON "public"."comments" FOR INSERT WITH CHECK (("approved" = true));



CREATE POLICY "Anyone can submit consultation requests" ON "public"."consultation_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view active diseases" ON "public"."diseases" FOR SELECT USING (("active" = true));



CREATE POLICY "Anyone can view active global settings" ON "public"."global_settings" FOR SELECT USING (("active" = true));



CREATE POLICY "Anyone can view active homepage settings" ON "public"."homepage_settings" FOR SELECT USING (("active" = true));



CREATE POLICY "Anyone can view active homepage translations" ON "public"."homepage_translations" FOR SELECT USING (("active" = true));



CREATE POLICY "Anyone can view active partners" ON "public"."partners" FOR SELECT USING (("active" = true));



CREATE POLICY "Anyone can view active verified doctors" ON "public"."doctors" FOR SELECT USING ((("active" = true) AND ("verified" = true)));



CREATE POLICY "Anyone can view all comments" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Anyone can view answer votes" ON "public"."answer_votes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view answers" ON "public"."answers" FOR SELECT USING (true);



CREATE POLICY "Anyone can view approved reviews" ON "public"."doctor_reviews" FOR SELECT USING (("approved" = true));



CREATE POLICY "Anyone can view categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can view disease translations for active diseases" ON "public"."disease_translations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."diseases"
  WHERE (("diseases"."id" = "disease_translations"."disease_id") AND ("diseases"."active" = true)))));



CREATE POLICY "Anyone can view doctor translations for active doctors" ON "public"."doctor_translations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."doctors"
  WHERE (("doctors"."id" = "doctor_translations"."doctor_id") AND ("doctors"."active" = true) AND ("doctors"."verified" = true)))));



CREATE POLICY "Anyone can view published patient stories" ON "public"."patient_stories" FOR SELECT USING (("published" = true));



CREATE POLICY "Anyone can view published post translations" ON "public"."post_translations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."posts"
  WHERE (("posts"."id" = "post_translations"."post_id") AND ("posts"."published" = true)))));



CREATE POLICY "Anyone can view published story translations" ON "public"."patient_story_translations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."patient_stories"
  WHERE (("patient_stories"."id" = "patient_story_translations"."story_id") AND ("patient_stories"."published" = true)))));



CREATE POLICY "Anyone can view question votes" ON "public"."question_votes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view questions" ON "public"."questions" FOR SELECT USING (true);



CREATE POLICY "Anyone can view translations for verified doctor profiles" ON "public"."doctor_profile_translations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."doctor_profiles"
  WHERE (("doctor_profiles"."id" = "doctor_profile_translations"."doctor_profile_id") AND ("doctor_profiles"."verified" = true) AND ("doctor_profiles"."active" = true)))));



CREATE POLICY "Anyone can view verified and active doctor profiles" ON "public"."doctor_profiles" FOR SELECT USING ((("verified" = true) AND ("active" = true)));



CREATE POLICY "Authenticated users can create questions" ON "public"."questions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authenticated users can create reviews" ON "public"."doctor_reviews" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can vote on answers" ON "public"."answer_votes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can vote on questions" ON "public"."question_votes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authors can manage their post translations" ON "public"."post_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."posts"
  WHERE (("posts"."id" = "post_translations"."post_id") AND ("posts"."author_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."posts"
  WHERE (("posts"."id" = "post_translations"."post_id") AND ("posts"."author_id" = "auth"."uid"())))));



CREATE POLICY "Doctors can create answers" ON "public"."answers" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "author_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['doctor'::"text", 'admin'::"text", 'moderator'::"text"])))))));



CREATE POLICY "Doctors can manage their own profile translations" ON "public"."doctor_profile_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."doctor_profiles"
  WHERE (("doctor_profiles"."id" = "doctor_profile_translations"."doctor_profile_id") AND ("doctor_profiles"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."doctor_profiles"
  WHERE (("doctor_profiles"."id" = "doctor_profile_translations"."doctor_profile_id") AND ("doctor_profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Doctors can view and edit their own profile" ON "public"."doctor_profiles" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Only admins can manage admins" ON "public"."admins" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins" "admins_1"
  WHERE (("admins_1"."login" = "current_setting"('app.current_admin_login'::"text", true)) AND ("admins_1"."role" = 'admin'::"text") AND ("admins_1"."active" = true)))));



CREATE POLICY "Only admins can manage categories" ON "public"."categories" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Public can view doctor profiles" ON "public"."profiles" FOR SELECT TO "authenticated", "anon" USING ((("role" = 'doctor'::"text") AND ("verified" = true)));



CREATE POLICY "Users can delete their own answer votes" ON "public"."answer_votes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own question votes" ON "public"."question_votes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can edit their own comments" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own answer votes" ON "public"."answer_votes" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own answers" ON "public"."answers" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own question votes" ON "public"."question_votes" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own questions" ON "public"."questions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can update their own reviews" ON "public"."doctor_reviews" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((("active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"())) AND (("target_type" = 'broadcast'::"text") OR ("target_user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."answer_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."doctors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."homepage_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."homepage_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_stories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_story_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."authenticate_admin"("login_param" "text", "password_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."authenticate_admin"("login_param" "text", "password_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."authenticate_admin"("login_param" "text", "password_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."clear_admin_session"() TO "anon";
GRANT ALL ON FUNCTION "public"."clear_admin_session"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."clear_admin_session"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_admin"("input_login" "text", "input_password" "text", "input_full_name" "text", "input_phone" "text", "input_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_admin"("input_login" "text", "input_password" "text", "input_full_name" "text", "input_phone" "text", "input_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_admin"("input_login" "text", "input_password" "text", "input_full_name" "text", "input_phone" "text", "input_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_doctors_combined"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_doctors_combined"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_doctors_combined"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctor_by_id_combined"("p_doctor_id" "uuid", "p_language" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctor_by_id_combined"("p_doctor_id" "uuid", "p_language" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctor_by_id_combined"("p_doctor_id" "uuid", "p_language" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctor_by_id_optimized"("p_doctor_id" "uuid", "p_language" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctor_by_id_optimized"("p_doctor_id" "uuid", "p_language" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctor_by_id_optimized"("p_doctor_id" "uuid", "p_language" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctor_by_id_with_translations"("p_doctor_id" "uuid", "p_language" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctor_by_id_with_translations"("p_doctor_id" "uuid", "p_language" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctor_by_id_with_translations"("p_doctor_id" "uuid", "p_language" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctors_optimized"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctors_optimized"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctors_optimized"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctors_with_translations"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctors_with_translations"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctors_with_translations"("p_language" "text", "p_active_only" boolean, "p_verified_only" boolean, "p_limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hash_admin_password"("password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hash_admin_password"("password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hash_admin_password"("password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hash_password"("password_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hash_password"("password_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hash_password"("password_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_admin_session"("admin_id_input" "uuid", "login_input" "text", "role_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_admin_session"("admin_id_input" "uuid", "login_input" "text", "role_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_admin_session"("admin_id_input" "uuid", "login_input" "text", "role_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_published_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_published_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_published_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admin_password"("admin_id" "uuid", "new_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_admin_password"("admin_id" "uuid", "new_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admin_password"("admin_id" "uuid", "new_password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admin_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_admin_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admin_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admins_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_admins_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admins_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_answer_votes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_answer_votes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_answer_votes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comments_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comments_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comments_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_consultation_requests_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_consultation_requests_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_consultation_requests_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_disease_translations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_disease_translations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_disease_translations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_diseases_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_diseases_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_diseases_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_doctor_profile_translations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_doctor_profile_translations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_doctor_profile_translations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_doctor_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_doctor_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_doctor_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_doctor_reviews_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_doctor_reviews_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_doctor_reviews_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_doctor_translations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_doctor_translations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_doctor_translations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_doctors_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_doctors_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_doctors_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_global_settings_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_global_settings_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_global_settings_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_homepage_settings_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_homepage_settings_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_homepage_settings_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_homepage_translations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_homepage_translations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_homepage_translations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_partners_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_partners_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_partners_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_patient_stories_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_patient_stories_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_patient_stories_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_patient_story_translations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_patient_story_translations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_patient_story_translations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_translations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_translations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_translations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_question_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_question_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_question_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_question_votes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_question_votes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_question_votes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_simple_admins_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_simple_admins_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_simple_admins_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_role"("user_id" "uuid", "new_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_admin_password"("input_login" "text", "input_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_admin_password"("input_login" "text", "input_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_admin_password"("input_login" "text", "input_password" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON TABLE "public"."answer_votes" TO "anon";
GRANT ALL ON TABLE "public"."answer_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."answer_votes" TO "service_role";



GRANT ALL ON TABLE "public"."answers" TO "anon";
GRANT ALL ON TABLE "public"."answers" TO "authenticated";
GRANT ALL ON TABLE "public"."answers" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."consultation_requests" TO "anon";
GRANT ALL ON TABLE "public"."consultation_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."consultation_requests" TO "service_role";



GRANT ALL ON TABLE "public"."disease_translations" TO "anon";
GRANT ALL ON TABLE "public"."disease_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."disease_translations" TO "service_role";



GRANT ALL ON TABLE "public"."diseases" TO "anon";
GRANT ALL ON TABLE "public"."diseases" TO "authenticated";
GRANT ALL ON TABLE "public"."diseases" TO "service_role";



GRANT ALL ON TABLE "public"."doctor_profile_translations" TO "anon";
GRANT ALL ON TABLE "public"."doctor_profile_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."doctor_profile_translations" TO "service_role";



GRANT ALL ON TABLE "public"."doctor_profiles" TO "anon";
GRANT ALL ON TABLE "public"."doctor_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."doctor_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."doctor_reviews" TO "anon";
GRANT ALL ON TABLE "public"."doctor_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."doctor_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."doctor_translations" TO "anon";
GRANT ALL ON TABLE "public"."doctor_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."doctor_translations" TO "service_role";



GRANT ALL ON TABLE "public"."doctors" TO "anon";
GRANT ALL ON TABLE "public"."doctors" TO "authenticated";
GRANT ALL ON TABLE "public"."doctors" TO "service_role";



GRANT ALL ON TABLE "public"."global_settings" TO "anon";
GRANT ALL ON TABLE "public"."global_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."global_settings" TO "service_role";



GRANT ALL ON TABLE "public"."homepage_settings" TO "anon";
GRANT ALL ON TABLE "public"."homepage_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."homepage_settings" TO "service_role";



GRANT ALL ON TABLE "public"."homepage_translations" TO "anon";
GRANT ALL ON TABLE "public"."homepage_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."homepage_translations" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."partners" TO "anon";
GRANT ALL ON TABLE "public"."partners" TO "authenticated";
GRANT ALL ON TABLE "public"."partners" TO "service_role";



GRANT ALL ON TABLE "public"."patient_stories" TO "anon";
GRANT ALL ON TABLE "public"."patient_stories" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_stories" TO "service_role";



GRANT ALL ON TABLE "public"."patient_story_translations" TO "anon";
GRANT ALL ON TABLE "public"."patient_story_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_story_translations" TO "service_role";



GRANT ALL ON TABLE "public"."post_translations" TO "anon";
GRANT ALL ON TABLE "public"."post_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."post_translations" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."question_votes" TO "anon";
GRANT ALL ON TABLE "public"."question_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."question_votes" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."simple_admins" TO "anon";
GRANT ALL ON TABLE "public"."simple_admins" TO "authenticated";
GRANT ALL ON TABLE "public"."simple_admins" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
