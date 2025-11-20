import { supabase, isSupabaseAvailable } from './supabase';
import { getAllDoctorProfiles } from './doctorProfiles';
import { dataCache, withCache, cacheKeys, invalidateRelatedCache } from './cacheUtils';
import type { DoctorProfile } from './doctorProfiles';

export interface Doctor {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  specialization: string;
  experience_years: number;
  bio?: string;
  avatar_url?: string;
  certificates: string[];
  verified: boolean;
  active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  translations?: DoctorTranslation[];
  current_language?: string;
}

export interface DoctorTranslation {
  id: string;
  doctor_id: string;
  language: 'uz' | 'ru' | 'en';
  bio?: string;
  specialization?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDoctorData {
  full_name: string;
  email: string;
  phone?: string;
  specialization: string;
  experience_years: number;
  bio?: string;
  avatar_url?: string;
  certificates: string[];
  verified?: boolean;
  active?: boolean;
  order_index?: number;
  translations?: {
    [key: string]: {
      bio?: string;
      specialization?: string;
    };
  };
}

export interface UpdateDoctorData extends Partial<CreateDoctorData> {
  id: string;
}

// Barcha shifokorlarni olish
const _getDoctors = async (
  language: string = 'uz',
  {
    active,
    verified,
    limit,
    page = 1,
    pageSize = 12,
    allowMock
  }: {
    active?: boolean;
    verified?: boolean;
    limit?: number;
    page?: number;
    pageSize?: number;
    allowMock?: boolean;
  } = {}
): Promise<{ data: Doctor[] | null; error: any }> => {
  try {
    console.log('👨‍⚕️ Loading doctors from Supabase for language:', language, 'options:', { active, verified, limit, page, pageSize });

    if (isSupabaseAvailable() && supabase) {
      let allDoctors: Doctor[] = [];

      const pickTranslation = (translations: any[] | undefined, language: string) => {
        if (!translations || translations.length === 0) return null;
        const order = [language, 'uz', 'ru', 'en'].filter((v, i, a) => a.indexOf(v) === i);
        for (const lang of order) {
          const t = translations.find((x: any) => x.language === lang);
          if (t && (t.bio || t.specialization)) return t;
        }
        return null;
      };

      // 1) Load from doctor_profiles with filters and translations
      try {
        let profilesQuery = supabase
          .from('doctor_profiles')
          .select(`
            id, full_name, email, phone, specialization, experience_years, bio, avatar_url, certificates, verified, active, created_at, updated_at,
            translations:doctor_profile_translations(*)
          `);

        if (active !== undefined) profilesQuery = profilesQuery.eq('active', active);
        if (verified !== undefined) profilesQuery = profilesQuery.eq('verified', verified);
        profilesQuery = profilesQuery.order('created_at', { ascending: false });
        if (page && pageSize) {
          const startIndex = (page - 1) * pageSize;
          profilesQuery = profilesQuery.range(startIndex, startIndex + pageSize - 1);
        }

        const { data: profilesData, error: profilesError } = await profilesQuery;
        if (profilesError) {
          console.log('❌ Supabase error loading doctor_profiles:', profilesError);
        } else if (profilesData && profilesData.length > 0) {
          const convertedDoctors: Doctor[] = profilesData.map((profile: any) => {
            const translation = language === 'uz' ? null : pickTranslation(profile.translations, language);
            const specialization = translation?.specialization || profile.specialization;
            const bio = translation?.bio || profile.bio;

            return {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              phone: profile.phone,
              specialization,
              experience_years: profile.experience_years,
              bio,
              avatar_url: profile.avatar_url,
              certificates: profile.certificates || [],
              verified: profile.verified,
              active: profile.active,
              order_index: 9999,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              current_language: translation ? (translation.language as any) : undefined
            } as Doctor;
          });
          // Do NOT push yet; we'll merge after getting legacy to control priority per language
          allDoctors = [...allDoctors, ...convertedDoctors];
          console.log('✅ Doctors loaded from doctor_profiles:', convertedDoctors.length, convertedDoctors.map(d => ({ id: d.id, name: d.full_name, email: d.email })));
        } else {
          console.log('ℹ️ No doctors found in doctor_profiles');
        }
      } catch (profilesError) {
        console.log('⚠️ Error loading doctor_profiles:', profilesError);
      }

      // 2) Load from legacy doctors with filters and translations
      try {
        // For legacy doctors, load without translations first to avoid RLS issues
        let legacyQuery = supabase
          .from('doctors')
          .select(`
            id, full_name, email, phone, specialization, experience_years, bio, avatar_url, certificates, verified, active, order_index, created_at, updated_at
          `)
          .order('order_index', { ascending: true });

        if (active !== undefined) legacyQuery = legacyQuery.eq('active', active);
        if (verified !== undefined) legacyQuery = legacyQuery.eq('verified', verified);
        if (page && pageSize) {
          const startIndex = (page - 1) * pageSize;
          legacyQuery = legacyQuery.range(startIndex, startIndex + pageSize - 1);
        }

        const { data, error } = await legacyQuery;
        if (error) {
          console.log('❌ Supabase error loading doctors:', error);
        } else if (data && data.length > 0) {
          // If we need translations for non-Uzbek languages, load them separately
          let translationsData: any[] = [];
          if (language !== 'uz') {
            try {
              const { data: transData, error: transError } = await supabase
                .from('doctor_translations')
                .select('*')
                .in('doctor_id', data.map(d => d.id));

              if (!transError && transData) {
                translationsData = transData;
              }
            } catch (transError) {
              console.log('⚠️ Error loading translations:', transError);
            }
          }

          const processedDoctors: Doctor[] = data.map((doctor: any) => {
            const doctorTranslations = translationsData.filter(t => t.doctor_id === doctor.id);
            const translation = language === 'uz' ? null : pickTranslation(doctorTranslations, language);
            const specialization = translation?.specialization || doctor.specialization;
            const bio = translation?.bio || doctor.bio;
            return {
              id: doctor.id,
              full_name: doctor.full_name,
              email: doctor.email,
              phone: doctor.phone,
              specialization,
              experience_years: doctor.experience_years,
              bio,
              avatar_url: doctor.avatar_url,
              certificates: doctor.certificates || [],
              verified: doctor.verified,
              active: doctor.active,
              order_index: doctor.order_index ?? 0,
              created_at: doctor.created_at,
              updated_at: doctor.updated_at,
              current_language: translation ? (translation.language as any) : undefined
            } as Doctor;
          });
          // We will set priority by language when merging
          // For now, store in a temp variable on closure
          // To keep code simple, append and handle priority in dedupe order below
          allDoctors = [...processedDoctors, ...allDoctors];
          console.log('✅ Doctors loaded from legacy doctors:', processedDoctors.length, processedDoctors.map(d => ({ id: d.id, name: d.full_name, email: d.email })));
        } else {
          console.log('ℹ️ No doctors found in legacy doctors table');
        }
      } catch (legacyError) {
        console.log('⚠️ Error loading legacy doctors:', legacyError);
      }

      // 3) Dedupe by email (prefer profiles added first), then sort and apply final limit
      // Determine merge priority: if Uzbek, prefer legacy (added first above); otherwise prefer profiles
      console.log('🔄 Merging doctors. Total before merge:', allDoctors.length);
      const ordered = language === 'uz' ? allDoctors : [...allDoctors].reverse();
      console.log('🔄 Ordered doctors for language', language, ':', ordered.length);

      const uniqueByEmail = new Map<string, Doctor>();
      for (const d of ordered) {
        const key = (d.email || d.id).toLowerCase();
        if (!uniqueByEmail.has(key)) uniqueByEmail.set(key, d);
      }
      let merged = Array.from(uniqueByEmail.values());
      console.log('🔄 After dedupe:', merged.length, 'doctors');

      merged.sort((a, b) => {
        // active desc
        if (a.active !== b.active) return a.active ? -1 : 1;
        // verified desc
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        // order_index asc (profiles set to 9999)
        if ((a.order_index ?? 9999) !== (b.order_index ?? 9999)) {
          return (a.order_index ?? 9999) - (b.order_index ?? 9999);
        }
        // created_at desc
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      if (limit) {
        merged = merged.slice(0, limit);
      }

      console.log('✅ Total doctors loaded:', merged.length, merged.map(d => ({ id: d.id, name: d.full_name, email: d.email, order_index: d.order_index })));
      return { data: merged, error: null };
    }

    // Fallback when Supabase not available
    console.log('⚠️ Supabase not available');
    return { data: [], error: { message: 'Supabase not available' } };
  } catch (error) {
    console.warn('👨‍⚕️ Error fetching doctors from Supabase:', error);
    return { data: [], error: { message: 'Error fetching doctors' } };
  }
};

// Cached version of getDoctors
export const getDoctors = withCache(
  _getDoctors,
  (language = 'uz', options: { active?: boolean; verified?: boolean; limit?: number; page?: number; pageSize?: number; allowMock?: boolean } = {}) => {
    const { active, verified, limit, page, pageSize, allowMock } = options;
    const opts = { active, verified, limit, page, pageSize, allowMock };
    return cacheKeys.doctors(language, opts);
  },
  3 * 60 * 1000 // 3 minutes TTL
);

// Bitta shifokorni olish
const _getDoctorById = async (id: string, language: string = 'uz'): Promise<{ data: Doctor | null; error: any }> => {
  try {
    if (isSupabaseAvailable() && supabase) {
      // 1. Try to get from new doctor_profiles table
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('doctor_profiles')
          .select(`
            *,
            translations:doctor_profile_translations(*)
          `)
          .eq('id', id)
          .maybeSingle();

        if (!profileError && profileData) {
          // Process with translations
          const translation = profileData.translations?.find((t: any) => t.language === language);
          const processedProfile = translation ? {
            ...profileData,
            bio: translation.bio || profileData.bio,
            specialization: translation.specialization || profileData.specialization,
            current_language: language
          } : profileData;

          // Convert DoctorProfile to Doctor format
          const convertedDoctor: Doctor = {
            id: processedProfile.id,
            full_name: processedProfile.full_name,
            email: processedProfile.email,
            phone: processedProfile.phone,
            specialization: processedProfile.specialization,
            experience_years: processedProfile.experience_years,
            bio: processedProfile.bio,
            avatar_url: processedProfile.avatar_url,
            certificates: processedProfile.certificates,
            verified: processedProfile.verified,
            active: processedProfile.active,
            order_index: 0,
            created_at: processedProfile.created_at,
            updated_at: processedProfile.updated_at,
            current_language: processedProfile.current_language
          };

          console.log('✅ Doctor loaded from doctor_profiles table');
          return { data: convertedDoctor, error: null };
        }
      } catch (profileError) {
        console.log('⚠️ Error loading from doctor_profiles, trying legacy doctors table:', profileError);
      }

      // 2. Try legacy doctors table (admin added doctors)
      try {
        const { data: legacyDoctor } = await supabase
          .from('doctors')
          .select(`*`)
          .eq('id', id)
          .single();

        if (legacyDoctor) {
          // Load translations if needed
          let translation = null;
          if (language !== 'uz') {
            try {
              const { data: transData } = await supabase
                .from('doctor_translations')
                .select('*')
                .eq('doctor_id', id);

              if (transData && transData.length > 0) {
                // Use pickTranslation logic: prefer requested language, then uz, ru, en
                const order = [language, 'uz', 'ru', 'en'].filter((v, i, a) => a.indexOf(v) === i);
                for (const lang of order) {
                  const t = transData.find((x: any) => x.language === lang);
                  if (t && (t.bio || t.specialization)) {
                    translation = t;
                    break;
                  }
                }
              }
            } catch (transError) {
              console.log('⚠️ Error loading translations for legacy doctor:', transError);
            }
          }

          const processedDoctor = {
            ...legacyDoctor,
            bio: translation?.bio || legacyDoctor.bio,
            specialization: translation?.specialization || legacyDoctor.specialization,
            current_language: translation ? translation.language : undefined
          };

          console.log('✅ Doctor loaded from legacy doctors table');
          return { data: processedDoctor, error: null };
        }
      } catch (legacyError) {
        console.log('⚠️ Error loading from legacy doctors table:', legacyError);
      }
    }

    // 3. Final fallback to mock data
    return { data: null, error: { message: 'Doctor not found' } };
  } catch (error) {
    console.warn('👨‍⚕️ Error fetching doctor from Supabase:', error);
    return { data: null, error: { message: 'Error fetching doctor' } };
  }
};

// Cached version of getDoctorById
export const getDoctorById = withCache(
  _getDoctorById,
  (id: string, language = 'uz') => cacheKeys.doctorById(id, language),
  5 * 60 * 1000 // 5 minutes TTL
);

// Yangi shifokor yaratish
export const createDoctor = async (doctorData: CreateDoctorData): Promise<{ data: Doctor | null; error: any }> => {
  try {
    console.log('👨‍⚕️ Creating doctor:', { full_name: doctorData.full_name, email: doctorData.email, specialization: doctorData.specialization });
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }


        // Shifokorni yaratish
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .insert({
            full_name: doctorData.full_name,
            email: doctorData.email,
            phone: doctorData.phone,
            specialization: doctorData.specialization,
            experience_years: doctorData.experience_years,
            bio: doctorData.bio,
            avatar_url: doctorData.avatar_url,
            certificates: doctorData.certificates.slice(0, 2),
            verified: doctorData.verified ?? false,
            active: doctorData.active ?? true,
            order_index: doctorData.order_index ?? 0
          })
          .select()
          .single();

        if (doctorError) {
          console.log('❌ Supabase error creating doctor:', doctorError);
          return { data: null, error: doctorError };
        }
        console.log('✅ Doctor created successfully:', { id: doctor.id, name: doctor.full_name, email: doctor.email });
    // Tarjimalarni yaratish
    if (doctorData.translations) {
      const translationInserts = Object.entries(doctorData.translations).map(([lang, translation]) => ({
        doctor_id: doctor.id,
        language: lang,
        bio: translation.bio,
        specialization: translation.specialization
      }));

    const { error: translationsError } = await supabase
      .from('doctor_translations')
      .insert(translationInserts);

    if (translationsError) {
      console.warn('Warning: Could not create translations:', translationsError);
    }
  }

    // Invalidate related cache
    invalidateRelatedCache('doctor');

    return { data: doctor, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Shifokorni yangilash
export const updateDoctor = async (doctorData: UpdateDoctorData): Promise<{ data: Doctor | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { id, translations, ...updateData } = doctorData;

    // Asosiy ma'lumotlarni yangilash
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (doctorError) {
      return { data: null, error: doctorError };
    }

    // Tarjimalarni yangilash
    if (translations) {
      for (const [lang, translation] of Object.entries(translations)) {
        const { error: translationError } = await supabase
          .from('doctor_translations')
          .upsert({
            doctor_id: id,
            language: lang,
            bio: translation.bio,
            specialization: translation.specialization
          });

        if (translationError) {
          console.warn(`Warning: Could not update ${lang} translation:`, translationError);
        }
      }
    }

    // Invalidate related cache
    invalidateRelatedCache('doctor', id);

    return { data: doctor, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Shifokorni o'chirish
export const deleteDoctor = async (doctorId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', doctorId);

    // Invalidate related cache
    invalidateRelatedCache('doctor', doctorId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Email noyobligini tekshirish
export const checkDoctorEmailUniqueness = async (email: string, excludeDoctorId?: string): Promise<{ isUnique: boolean; error?: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { isUnique: true };
    }

    let query = supabase
      .from('doctors')
      .select('id')
      .eq('email', email);
    
    if (excludeDoctorId) {
      query = query.neq('id', excludeDoctorId);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      return { isUnique: false, error };
    }
    
    return { isUnique: !data };
  } catch (error) {
    return { isUnique: false, error };
  }
};

// Mock ma'lumotlar
const getMockDoctors = (language?: string): Doctor[] => [];
