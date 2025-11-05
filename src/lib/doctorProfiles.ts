import { supabase, isSupabaseAvailable } from './supabase';

// Upload avatar image to Supabase storage
export const uploadDoctorAvatar = async (file: File, doctorId: string): Promise<string | null> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available for avatar upload');
      return URL.createObjectURL(file); // Fallback for demo
    }

    console.log('📸 Uploading doctor avatar:', file.name, 'for doctor:', doctorId);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${doctorId}-${Date.now()}.${fileExt}`;
    const filePath = `doctor-avatars/${fileName}`;

    // Try to upload to post-images bucket (reuse existing bucket)
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Doctor avatar upload error:', error);
      console.log('🔄 Using fallback URL');
      return URL.createObjectURL(file); // Fallback
    }

    console.log('✅ Doctor avatar uploaded successfully:', data.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    console.log('🔗 Doctor avatar public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Doctor avatar upload error:', error);
    console.log('🔄 Using fallback URL');
    return URL.createObjectURL(file); // Fallback
  }
};

// Delete avatar from storage
export const deleteDoctorAvatar = async (avatarUrl: string): Promise<boolean> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return true; // Fallback
    }
    
    // Extract file path from URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `doctor-avatars/${fileName}`;

    const { error } = await supabase.storage
      .from('post-images')
      .remove([filePath]);

    if (error) {
      console.error('Avatar delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

export interface DoctorProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  specialization: string;
  experience_years: number;
  bio?: string;
  avatar_url?: string;
  certificates: string[];
  education: string[];
  languages: string[];
  consultation_fee?: number;
  consultation_duration?: number;
  working_hours?: {
    [key: string]: { start: string; end: string; available: boolean };
  };
  verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  translations?: DoctorProfileTranslation[];
  current_language?: string;
}

export interface DoctorProfileTranslation {
  id: string;
  doctor_profile_id: string;
  language: 'uz' | 'ru' | 'en';
  bio?: string;
  specialization?: string;
  education?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateDoctorProfileData {
  specialization: string;
  experience_years: number;
  bio?: string;
  avatar?: File;
  certificates: string[];
  education: string[];
  languages: string[];
  consultation_fee?: number;
  consultation_duration?: number;
  working_hours?: {
    [key: string]: { start: string; end: string; available: boolean };
  };
  translations?: {
    [key: string]: {
      bio?: string;
      specialization?: string;
      education?: string[];
    };
  };
}

export interface UpdateDoctorProfileData extends Partial<CreateDoctorProfileData> {
  id: string;
}

// Get doctor profile by user ID
export const getDoctorProfileByUserId = async (userId: string, language: string = 'uz'): Promise<{ data: DoctorProfile | null; error: any }> => {
  try {
    console.log('👨‍⚕️ Loading doctor profile for user:', userId);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available');
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        *,
        translations:doctor_profile_translations(*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.log('❌ Error loading doctor profile:', error);
      return { data: null, error };
    }

    // Process with translations
    const translation = data.translations?.find((t: any) => t.language === language);
    const processedProfile = translation ? {
      ...data,
      bio: translation.bio || data.bio,
      specialization: translation.specialization || data.specialization,
      education: translation.education || data.education,
      current_language: language
    } : data;

    console.log('✅ Doctor profile loaded');
    return { data: processedProfile, error: null };
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return { data: null, error };
  }
};

// Create doctor profile
export const createDoctorProfile = async (userId: string, profileData: CreateDoctorProfileData): Promise<{ data: DoctorProfile | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    // Get user info
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return { data: null, error: { message: 'Unauthorized' } };
    }

    // Create doctor profile
    const { data: profile, error: profileError } = await supabase
      .from('doctor_profiles')
      .insert({
        user_id: userId,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Doctor',
        email: user.email || '',
        phone: user.user_metadata?.phone,
        specialization: profileData.specialization,
        experience_years: profileData.experience_years,
        bio: profileData.bio,
        avatar_url: undefined, // Will be updated after avatar upload
        certificates: profileData.certificates,
        education: profileData.education,
        languages: profileData.languages,
        consultation_fee: profileData.consultation_fee,
        consultation_duration: profileData.consultation_duration,
        working_hours: profileData.working_hours,
        verified: false,
        active: false
      })
      .select()
      .single();

    if (profileError) {
      return { data: null, error: profileError };
    }

    // Upload avatar if provided
    if (profileData.avatar && profile) {
      const avatarUrl = await uploadDoctorAvatar(profileData.avatar, profile.id);
      if (avatarUrl) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('doctor_profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', profile.id)
          .select()
          .single();

        if (updateError) {
          return { data: null, error: updateError };
        }

        Object.assign(profile, updatedProfile);
      }
    }

    // Create translations
    if (profileData.translations) {
      const translationInserts = Object.entries(profileData.translations).map(([lang, translation]) => ({
        doctor_profile_id: profile.id,
        language: lang,
        bio: translation.bio,
        specialization: translation.specialization,
        education: translation.education
      }));

      const { error: translationsError } = await supabase
        .from('doctor_profile_translations')
        .insert(translationInserts);

      if (translationsError) {
        console.warn('Warning: Could not create translations:', translationsError);
      }
    }

    console.log('✅ Doctor profile created');
    return { data: profile, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Update doctor profile
export const updateDoctorProfile = async (profileData: UpdateDoctorProfileData): Promise<{ data: DoctorProfile | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { id, avatar, translations, ...updateData } = profileData;

    // Upload new avatar if provided
    if (avatar) {
      const avatarUrl = await uploadDoctorAvatar(avatar, id);
      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }
    }

    // Update main profile
    const { data: profile, error: profileError } = await supabase
      .from('doctor_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      return { data: null, error: profileError };
    }

    // Update translations
    if (translations) {
      for (const [lang, translation] of Object.entries(translations)) {
        const { error: translationError } = await supabase
          .from('doctor_profile_translations')
          .upsert({
            doctor_profile_id: id,
            language: lang,
            bio: translation.bio,
            specialization: translation.specialization,
            education: translation.education
          }, {
            onConflict: 'doctor_profile_id,language'
          });

        if (translationError) {
          console.warn(`Warning: Could not update ${lang} translation:`, translationError);
        }
      }
    }

    console.log('✅ Doctor profile updated');
    return { data: profile, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get all doctor profiles for admin
export const getAllDoctorProfiles = async (language: string = 'uz'): Promise<{ data: DoctorProfile[] | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        *,
        translations:doctor_profile_translations(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    // Process with translations
    const processedProfiles = data?.map(profile => {
      const translation = profile.translations?.find((t: any) => t.language === language);
      if (translation) {
        return {
          ...profile,
          bio: translation.bio || profile.bio,
          specialization: translation.specialization || profile.specialization,
          education: translation.education || profile.education,
          current_language: language
        };
      }
      return profile;
    }) || [];

    return { data: processedProfiles, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Verify doctor profile (admin only)
export const verifyDoctorProfile = async (profileId: string, verified: boolean): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabase
      .from('doctor_profiles')
      .update({ 
        verified,
        active: verified // Auto-activate when verified
      })
      .eq('id', profileId);

    return { error };
  } catch (error) {
    return { error };
  }
};