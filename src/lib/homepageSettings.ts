import { supabase, isSupabaseAvailable } from './supabase';

export interface HomepageTranslation {
  id: string;
  section: string;
  language: 'uz' | 'ru' | 'en';
  title: string;
  subtitle_authenticated?: string;
  subtitle_unauthenticated?: string;
  stats: {
    articles: { value: number; label: string; suffix: string };
    doctors: { value: number; label: string; suffix: string };
    patients: { value: number; label: string; suffix: string };
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateHomepageTranslationData {
  title?: string;
  subtitle_authenticated?: string;
  subtitle_unauthenticated?: string;
  stats?: {
    articles: { value: number; label: string; suffix: string };
    doctors: { value: number; label: string; suffix: string };
    patients: { value: number; label: string; suffix: string };
  };
  active?: boolean;
}

// Get homepage settings for specific language
export const getHomepageSettings = async (
  section: string = 'hero', 
  language: string = 'uz'
): Promise<{ data: HomepageTranslation | null; error: any }> => {
  try {
    console.log('🏠 Loading homepage settings for section:', section, 'language:', language);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using default data');
      return { data: getDefaultSettings(language), error: null };
    }

    const { data, error } = await supabase
      .from('homepage_translations')
      .select('*')
      .eq('section', section)
      .eq('language', language)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.log('❌ Supabase error loading homepage settings:', error);
      console.log('🔄 Falling back to default data');
      return { data: getDefaultSettings(language), error: null };
    }

    if (!data) {
      console.log('⚠️ No homepage settings found, using default');
      return { data: getDefaultSettings(language), error: null };
    }

    console.log('✅ Homepage settings loaded from Supabase');
    return { data, error: null };
  } catch (error) {
    console.warn('🏠 Error fetching homepage settings, using default:', error);
    return { data: getDefaultSettings(language), error: null };
  }
};

// Update homepage settings for specific language
export const updateHomepageSettings = async (
  section: string,
  language: string,
  updateData: UpdateHomepageTranslationData
): Promise<{ data: HomepageTranslation | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { data, error } = await supabase
      .from('homepage_translations')
      .update(updateData)
      .eq('section', section)
      .eq('language', language)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating homepage settings:', error);
      return { data: null, error };
    }

    console.log('✅ Homepage settings updated for language:', language);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Update homepage settings error:', error);
    return { data: null, error };
  }
};

// Get all homepage translations for admin
export const getAllHomepageTranslations = async (section: string = 'hero'): Promise<{ data: HomepageTranslation[] | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { 
        data: [
          getDefaultSettings('uz'),
          getDefaultSettings('ru'),
          getDefaultSettings('en')
        ], 
        error: null 
      };
    }

    const { data, error } = await supabase
      .from('homepage_translations')
      .select('*')
      .eq('section', section)
      .order('language');

    if (error) {
      console.log('❌ Supabase error loading all homepage translations:', error);
      return { 
        data: [
          getDefaultSettings('uz'),
          getDefaultSettings('ru'),
          getDefaultSettings('en')
        ], 
        error: null 
      };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.warn('🏠 Error fetching all homepage translations:', error);
    return { 
      data: [
        getDefaultSettings('uz'),
        getDefaultSettings('ru'),
        getDefaultSettings('en')
      ], 
      error: null 
    };
  }
};

// Default settings fallback for each language
const getDefaultSettings = (language: string): HomepageTranslation => {
  const defaults = {
    uz: {
      title: 'Revmatik kasalliklar haqida ishonchli ma\'lumot',
      subtitle_authenticated: 'Bemor va shifokorlar uchun professional tibbiy ma\'lumot va yo\'riqnoma platformasi',
      subtitle_unauthenticated: 'Agar bemor bo\'lsangiz, ro\'yxatdan o\'ting va professional maslahat oling',
      stats: {
        articles: { value: 500, label: 'Tibbiy Maqolalar', suffix: '+' },
        doctors: { value: 50, label: 'Ekspert Shifokorlar', suffix: '+' },
        patients: { value: 10000, label: 'Yordam Berilgan Bemorlar', suffix: '+' }
      }
    },
    ru: {
      title: 'Достоверная информация о ревматических заболеваниях',
      subtitle_authenticated: 'Профессиональная медицинская информационная платформа для пациентов и врачей',
      subtitle_unauthenticated: 'Если вы пациент, зарегистрируйтесь и получите профессиональную консультацию',
      stats: {
        articles: { value: 500, label: 'Медицинские Статьи', suffix: '+' },
        doctors: { value: 50, label: 'Врачи-Эксперты', suffix: '+' },
        patients: { value: 10000, label: 'Пациентов Получили Помощь', suffix: '+' }
      }
    },
    en: {
      title: 'Reliable information about rheumatic diseases',
      subtitle_authenticated: 'Professional medical information platform for patients and doctors',
      subtitle_unauthenticated: 'If you are a patient, register and get professional advice',
      stats: {
        articles: { value: 500, label: 'Medical Articles', suffix: '+' },
        doctors: { value: 50, label: 'Expert Doctors', suffix: '+' },
        patients: { value: 10000, label: 'Patients Helped', suffix: '+' }
      }
    }
  };

  const langData = defaults[language as keyof typeof defaults] || defaults.uz;

  return {
    id: `default-hero-${language}`,
    section: 'hero',
    language: language as 'uz' | 'ru' | 'en',
    title: langData.title,
    subtitle_authenticated: langData.subtitle_authenticated,
    subtitle_unauthenticated: langData.subtitle_unauthenticated,
    stats: langData.stats,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};