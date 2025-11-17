import { supabase, isSupabaseAvailable } from './supabase';
import { dataCache, withCache, cacheKeys, invalidateRelatedCache } from './cacheUtils';

export interface Disease {
  id: string;
  name: string;
  slug: string;
  description: string;
  symptoms: string[];
  treatment_methods: string[];
  prevention_tips: string[];
  featured_image_url?: string;
  youtube_url?: string;
  meta_title?: string;
  meta_description?: string;
  active: boolean;
  featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  translations?: DiseaseTranslation[];
  current_language?: string;
}

export interface DiseaseTranslation {
  id: string;
  disease_id: string;
  language: 'uz' | 'ru' | 'en';
  name: string;
  description: string;
  symptoms: string[];
  treatment_methods: string[];
  prevention_tips: string[];
  meta_title?: string;
  meta_description?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDiseaseData {
  name: string;
  slug: string;
  description: string;
  symptoms: string[];
  treatment_methods: string[];
  prevention_tips: string[];
  featured_image?: File;
  youtube_url?: string;
  meta_title?: string;
  meta_description?: string;
  active?: boolean;
  featured?: boolean;
  order_index?: number;
  translations?: {
    [key: string]: {
      name: string;
      description: string;
      symptoms: string[];
      treatment_methods: string[];
      prevention_tips: string[];
      meta_title?: string;
      meta_description?: string;
      slug: string;
    };
  };
}

export interface UpdateDiseaseData extends Partial<CreateDiseaseData> {
  id: string;
}

// Upload image to Supabase storage
export const uploadDiseaseImage = async (file: File, diseaseId: string): Promise<string | null> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available for image upload');
      return URL.createObjectURL(file); // Fallback for demo
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${diseaseId}-${Date.now()}.${fileExt}`;
    const filePath = `diseases/${fileName}`;

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Disease image upload error:', error);
      return URL.createObjectURL(file); // Fallback
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return URL.createObjectURL(file); // Fallback
  }
};

// Get all diseases
const _getDiseases = async (language: string = 'uz', options?: {
  active?: boolean;
  featured?: boolean;
  limit?: number;
}): Promise<{ data: Disease[] | null; error: any }> => {
  try {
    console.log('🦠 Loading diseases from Supabase for language:', language);
    
    // Check Supabase availability first to prevent network errors
    if (!isSupabaseAvailable()) {
      console.log('⚠️ Supabase not available, using mock data');
      return { data: getMockDiseases(language), error: null };
    }

    try {
      let query = supabase
        .from('diseases')
        .select(`
          *,
          translations:disease_translations(*)
        `)
        .order('order_index', { ascending: true });

      // Apply filters
      if (options?.active !== undefined) {
        query = query.eq('active', options.active);
      }

      if (options?.featured !== undefined) {
        query = query.eq('featured', options.featured);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.log('❌ Supabase error loading diseases:', error);
        console.log('🔄 Falling back to mock data');
        return { data: getMockDiseases(language), error: null };
      }

      // If no data from Supabase, use mock data
      if (!data || data.length === 0) {
        console.log('⚠️ No diseases found in Supabase, using mock data');
        return { data: getMockDiseases(language), error: null };
      }

      // Process diseases with translations
      const processedDiseases = data?.map(disease => {
        const translation = disease.translations?.find((t: any) => t.language === language);
        if (translation) {
          return {
            ...disease,
            name: translation.name,
            description: translation.description,
            symptoms: translation.symptoms || disease.symptoms,
            treatment_methods: translation.treatment_methods || disease.treatment_methods,
            prevention_tips: translation.prevention_tips || disease.prevention_tips,
            slug: translation.slug,
            meta_title: translation.meta_title || disease.meta_title,
            meta_description: translation.meta_description || disease.meta_description,
            current_language: language
          };
        }
        return disease;
      }) || [];

      console.log('✅ Diseases loaded from Supabase:', processedDiseases.length);
      return { data: processedDiseases, error: null };
    } catch (supabaseError) {
      console.log('❌ Supabase connection failed:', supabaseError);
      console.log('🔄 Using mock data due to connection error');
      return { data: getMockDiseases(language), error: null };
    }
  } catch (error) {
    console.warn('🦠 Error fetching diseases from Supabase, using mock data:', error);
    return { data: getMockDiseases(language), error: null };
  }
};

// Cached version of getDiseases
export const getDiseases = withCache(
  _getDiseases,
  (language, options) => `diseases.${language}.${JSON.stringify(options || {})}`,
  5 * 60 * 1000 // 5 minutes TTL
);

// Get single disease by slug
const _getDiseaseBySlug = async (slug: string, language: string = 'uz'): Promise<{ data: Disease | null; error: any }> => {
  try {
    console.log('🦠 Loading disease by slug:', slug, 'language:', language);
    
    if (!supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      const mockDiseases = getMockDiseases(language);
      const disease = mockDiseases.find(d => d.slug === slug);
      return { data: disease || null, error: disease ? null : { message: 'Disease not found' } };
    }

    try {
      // First try to find by translation slug
      const { data: translationData, error: translationError } = await supabase
        .from('disease_translations')
        .select(`
          *,
          disease:diseases(*)
        `)
        .eq('slug', slug)
        .eq('language', language)
        .maybeSingle();

      if (translationError || !translationData) {
        // Fallback to original diseases table
        const { data, error } = await supabase
          .from('diseases')
          .select(`
            *,
            translations:disease_translations(*)
          `)
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.log('❌ Supabase error loading disease:', error);
          const mockDiseases = getMockDiseases(language);
          const disease = mockDiseases.find(d => d.slug === slug);
          return { data: disease || null, error: disease ? null : { message: 'Disease not found' } };
        }

        // Process with translation if available
        const translation = data.translations?.find((t: any) => t.language === language);
        const processedDisease = translation ? {
          ...data,
          name: translation.name,
          description: translation.description,
          symptoms: translation.symptoms || data.symptoms,
          treatment_methods: translation.treatment_methods || data.treatment_methods,
          prevention_tips: translation.prevention_tips || data.prevention_tips,
          slug: translation.slug,
          meta_title: translation.meta_title || data.meta_title,
          meta_description: translation.meta_description || data.meta_description,
          current_language: language
        } : data;

        console.log('✅ Disease loaded from Supabase:', processedDisease.name);
        return { data: processedDisease, error: null };
      }

      // Found translation, process it
      const disease = translationData.disease;
      const processedDisease = {
        ...disease,
        name: translationData.name,
        description: translationData.description,
        symptoms: translationData.symptoms || disease.symptoms,
        treatment_methods: translationData.treatment_methods || disease.treatment_methods,
        prevention_tips: translationData.prevention_tips || disease.prevention_tips,
        slug: translationData.slug,
        meta_title: translationData.meta_title || disease.meta_title,
        meta_description: translationData.meta_description || disease.meta_description,
        current_language: language
      };

      console.log('✅ Disease translation loaded from Supabase:', processedDisease.name);
      return { data: processedDisease, error: null };
    } catch (supabaseError) {
      console.log('❌ Supabase connection failed:', supabaseError);
      console.log('🔄 Using mock data due to connection error');
      const mockDiseases = getMockDiseases(language);
      const disease = mockDiseases.find(d => d.slug === slug);
      return { data: disease || null, error: disease ? null : { message: 'Disease not found' } };
    }
  } catch (error) {
    console.warn('🦠 Error fetching disease from Supabase, using mock data:', error);
    const mockDiseases = getMockDiseases(language);
    const disease = mockDiseases.find(d => d.slug === slug);
    return { data: disease || null, error: null };
  }
};

// Cached version of getDiseaseBySlug
export const getDiseaseBySlug = withCache(
  _getDiseaseBySlug,
  (slug, language) => `disease.${slug}.${language}`,
  10 * 60 * 1000 // 10 minutes TTL
);

// Create new disease
export const createDisease = async (diseaseData: CreateDiseaseData): Promise<{ data: Disease | null; error: any }> => {
  try {
    if (!supabase) {
      // Mock creation
      const newDisease: Disease = {
        id: Date.now().toString(),
        ...diseaseData,
        featured_image_url: diseaseData.featured_image ? URL.createObjectURL(diseaseData.featured_image) : undefined,
        active: diseaseData.active ?? true,
        featured: diseaseData.featured ?? false,
        order_index: diseaseData.order_index ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: newDisease, error: null };
    }

    try {
      // Create disease without image first
      const { data: disease, error: diseaseError } = await supabase
        .from('diseases')
        .insert({
          name: diseaseData.name,
          slug: diseaseData.slug,
          description: diseaseData.description,
          symptoms: diseaseData.symptoms,
          treatment_methods: diseaseData.treatment_methods,
          prevention_tips: diseaseData.prevention_tips,
          youtube_url: diseaseData.youtube_url,
          meta_title: diseaseData.meta_title,
          meta_description: diseaseData.meta_description,
          active: diseaseData.active ?? true,
          featured: diseaseData.featured ?? false,
          order_index: diseaseData.order_index ?? 0
        })
        .select()
        .single();

      if (diseaseError) {
        return { data: null, error: diseaseError };
      }

      // Upload image if provided
      if (diseaseData.featured_image && disease) {
        const imageUrl = await uploadDiseaseImage(diseaseData.featured_image, disease.id);
        if (imageUrl) {
          const { data: updatedDisease, error: updateError } = await supabase
            .from('diseases')
            .update({ featured_image_url: imageUrl })
            .eq('id', disease.id)
            .select()
            .single();

          if (updateError) {
            return { data: null, error: updateError };
          }

          Object.assign(disease, updatedDisease);
        }
      }

      // Create translations if provided
      if (diseaseData.translations) {
        const translationInserts = Object.entries(diseaseData.translations).map(([lang, translation]) => ({
          disease_id: disease.id,
          language: lang,
          name: translation.name,
          description: translation.description,
          symptoms: translation.symptoms,
          treatment_methods: translation.treatment_methods,
          prevention_tips: translation.prevention_tips,
          meta_title: translation.meta_title,
          meta_description: translation.meta_description,
          slug: translation.slug
        }));

        const { error: translationsError } = await supabase
          .from('disease_translations')
          .insert(translationInserts);

        if (translationsError) {
          console.warn('Warning: Could not create translations:', translationsError);
        }
      }

      // Invalidate related cache
      invalidateRelatedCache('disease');

      return { data: disease, error: null };
    } catch (supabaseError) {
      console.log('❌ Supabase connection failed during creation:', supabaseError);
      // Mock creation as fallback
      const newDisease: Disease = {
        id: Date.now().toString(),
        ...diseaseData,
        featured_image_url: diseaseData.featured_image ? URL.createObjectURL(diseaseData.featured_image) : undefined,
        active: diseaseData.active ?? true,
        featured: diseaseData.featured ?? false,
        order_index: diseaseData.order_index ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: newDisease, error: null };
    }
  } catch (error) {
    return { data: null, error };
  }
};

// Update disease
export const updateDisease = async (diseaseData: UpdateDiseaseData): Promise<{ data: Disease | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { id, featured_image, translations, ...updateData } = diseaseData;

    // Handle image upload if new image provided
    if (featured_image) {
      const imageUrl = await uploadDiseaseImage(featured_image, id);
      if (imageUrl) {
        updateData.featured_image_url = imageUrl;
      }
    }

    // Update main disease
    const { data: disease, error: diseaseError } = await supabase
      .from('diseases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (diseaseError) {
      return { data: null, error: diseaseError };
    }

    // Update translations
    if (translations) {
      for (const [lang, translation] of Object.entries(translations)) {
        const { error: translationError } = await supabase
          .from('disease_translations')
          .upsert({
            disease_id: id,
            language: lang,
            name: translation.name,
            description: translation.description,
            symptoms: translation.symptoms,
            treatment_methods: translation.treatment_methods,
            prevention_tips: translation.prevention_tips,
            meta_title: translation.meta_title,
            meta_description: translation.meta_description,
            slug: translation.slug
          }, {
            onConflict: 'disease_id,language'
          });

        if (translationError) {
          console.warn(`Warning: Could not update ${lang} translation:`, translationError);
        }
      }
    }

    // Invalidate related cache
    invalidateRelatedCache('disease', id);

    return { data: disease, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete disease
export const deleteDisease = async (diseaseId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabase
      .from('diseases')
      .delete()
      .eq('id', diseaseId);

    // Invalidate related cache
    invalidateRelatedCache('disease', diseaseId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Check if slug is unique
export const checkDiseaseSlugUniqueness = async (slug: string, language: string = 'uz', excludeDiseaseId?: string): Promise<{ isUnique: boolean; error?: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { isUnique: true };
    }

    // Check main diseases table (for default language)
    if (language === 'uz') {
      let query = supabase
        .from('diseases')
        .select('id')
        .eq('slug', slug);
      
      if (excludeDiseaseId) {
        query = query.neq('id', excludeDiseaseId);
      }
      
      const { data: mainDisease, error: mainError } = await query.maybeSingle();
      
      if (mainError) {
        return { isUnique: false, error: mainError };
      }
      
      if (mainDisease) {
        return { isUnique: false };
      }
    }

    // Check translations table
    let translationQuery = supabase
      .from('disease_translations')
      .select('disease_id')
      .eq('language', language)
      .eq('slug', slug);
    
    if (excludeDiseaseId) {
      translationQuery = translationQuery.neq('disease_id', excludeDiseaseId);
    }
    
    const { data: translation, error: translationError } = await translationQuery.maybeSingle();
    
    if (translationError) {
      return { isUnique: false, error: translationError };
    }
    
    return { isUnique: !translation };
  } catch (error) {
    return { isUnique: false, error };
  }
};

// Mock data fallback
const getMockDiseases = (language?: string): Disease[] => [
  {
    id: '1',
    name: language === 'ru' ? 'Аксиальный спондилоартрит' : language === 'en' ? 'Axial Spondyloarthritis' : 'Aksiyal spondiloartrit',
    slug: language === 'ru' ? 'aksialniy-spondiloartrit-ru' : language === 'en' ? 'axial-spondyloarthritis-en' : 'aksiyal-spondiloartrit-uz',
    description: language === 'ru' ? 
      'Аксиальный спондилоартрит - это хроническое воспалительное заболевание, которое в основном поражает позвоночник и крестцово-подвздошные суставы.' :
      language === 'en' ?
      'Axial spondyloarthritis is a chronic inflammatory disease that primarily affects the spine and sacroiliac joints.' :
      'Aksiyal spondiloartrit - bu asosan umurtqa pog\'onasi va sakroiliak bo\'g\'imlarni zararlantiruvchi surunkali yallig\'lanish kasalligi.',
    symptoms: language === 'ru' ? 
      ['Боль в пояснице', 'Утренняя скованность', 'Ограничение подвижности позвоночника', 'Усталость'] :
      language === 'en' ?
      ['Lower back pain', 'Morning stiffness', 'Limited spinal mobility', 'Fatigue'] :
      ['Bel og\'riqlari', 'Ertalabki qotishlik', 'Umurtqa pog\'onasi harakatchanligining cheklanishi', 'Charchoq'],
    treatment_methods: language === 'ru' ? 
      ['Противовоспалительные препараты', 'Биологическая терапия', 'Физиотерапия', 'Лечебная физкультура'] :
      language === 'en' ?
      ['Anti-inflammatory drugs', 'Biological therapy', 'Physiotherapy', 'Therapeutic exercises'] :
      ['Yallig\'lanishga qarshi dorilar', 'Biologik terapiya', 'Fizioterapiya', 'Davolovchi jismoniy mashqlar'],
    prevention_tips: language === 'ru' ? 
      ['Регулярные физические упражнения', 'Правильная осанка', 'Отказ от курения', 'Здоровое питание'] :
      language === 'en' ?
      ['Regular exercise', 'Proper posture', 'Quit smoking', 'Healthy diet'] :
      ['Muntazam jismoniy mashqlar', 'To\'g\'ri gavda holati', 'Chekishni tashlab qo\'yish', 'Sog\'lom ovqatlanish'],
    featured_image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800',
    active: true,
    featured: true,
    order_index: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: language === 'ru' ? 'Ревматоидный артрит' : language === 'en' ? 'Rheumatoid Arthritis' : 'Revmatoid artrit',
    slug: language === 'ru' ? 'revmatoidniy-artrit-ru' : language === 'en' ? 'rheumatoid-arthritis-en' : 'revmatoid-artrit-uz',
    description: language === 'ru' ? 
      'Ревматоидный артрит - это хроническое аутоиммунное заболевание, которое вызывает воспаление суставов.' :
      language === 'en' ?
      'Rheumatoid arthritis is a chronic autoimmune disease that causes joint inflammation.' :
      'Revmatoid artrit - bu bo\'g\'imlarda yallig\'lanish keltirib chiqaruvchi surunkali autoimmun kasallik.',
    symptoms: language === 'ru' ? 
      ['Боль в суставах', 'Отек суставов', 'Утренняя скованность', 'Усталость', 'Повышение температуры'] :
      language === 'en' ?
      ['Joint pain', 'Joint swelling', 'Morning stiffness', 'Fatigue', 'Fever'] :
      ['Bo\'g\'im og\'riqlari', 'Bo\'g\'im shishishi', 'Ertalabki qotishlik', 'Charchoq', 'Harorat ko\'tarilishi'],
    treatment_methods: language === 'ru' ? 
      ['Метотрексат', 'Биологические препараты', 'Кортикостероиды', 'Физиотерапия'] :
      language === 'en' ?
      ['Methotrexate', 'Biological drugs', 'Corticosteroids', 'Physiotherapy'] :
      ['Metotreksat', 'Biologik preparatlar', 'Kortikosteroidlar', 'Fizioterapiya'],
    prevention_tips: language === 'ru' ? 
      ['Здоровый образ жизни', 'Регулярные упражнения', 'Сбалансированное питание', 'Отказ от курения'] :
      language === 'en' ?
      ['Healthy lifestyle', 'Regular exercise', 'Balanced nutrition', 'Quit smoking'] :
      ['Sog\'lom turmush tarzi', 'Muntazam mashqlar', 'Muvozanatli ovqatlanish', 'Chekishni tashlab qo\'yish'],
    featured_image_url: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800',
    active: true,
    featured: true,
    order_index: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: language === 'ru' ? 'Псориатический артрит' : language === 'en' ? 'Psoriatic Arthritis' : 'Psoriatik artrit',
    slug: language === 'ru' ? 'psoriaticheskiy-artrit-ru' : language === 'en' ? 'psoriatic-arthritis-en' : 'psoriatik-artrit-uz',
    description: language === 'ru' ? 
      'Псориатический артрит - это воспалительное заболевание суставов, которое развивается у людей с псориазом.' :
      language === 'en' ?
      'Psoriatic arthritis is an inflammatory joint disease that develops in people with psoriasis.' :
      'Psoriatik artrit - bu psoriaz kasalligi bor odamlarda rivojlanadigan bo\'g\'im yallig\'lanish kasalligi.',
    symptoms: language === 'ru' ? 
      ['Боль в суставах', 'Отек пальцев', 'Поражение кожи', 'Изменения ногтей'] :
      language === 'en' ?
      ['Joint pain', 'Finger swelling', 'Skin lesions', 'Nail changes'] :
      ['Bo\'g\'im og\'riqlari', 'Barmoq shishishi', 'Teri zararlari', 'Tirnoq o\'zgarishlari'],
    treatment_methods: language === 'ru' ? 
      ['Противовоспалительные препараты', 'Иммуносупрессоры', 'Биологическая терапия', 'Местное лечение'] :
      language === 'en' ?
      ['Anti-inflammatory drugs', 'Immunosuppressants', 'Biological therapy', 'Topical treatment'] :
      ['Yallig\'lanishga qarshi dorilar', 'Immunosupressorlar', 'Biologik terapiya', 'Mahalliy davolash'],
    prevention_tips: language === 'ru' ? 
      ['Контроль веса', 'Защита от травм', 'Уход за кожей', 'Регулярные осмотры'] :
      language === 'en' ?
      ['Weight control', 'Injury protection', 'Skin care', 'Regular checkups'] :
      ['Vazn nazorati', 'Jarohatlardan himoyalanish', 'Teri parvarishi', 'Muntazam ko\'riklar'],
    featured_image_url: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=800',
    active: true,
    featured: true,
    order_index: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: language === 'ru' ? 'Системная красная волчанка' : language === 'en' ? 'Systemic Lupus Erythematosus' : 'Tizimli qizil bo\'richa',
    slug: language === 'ru' ? 'sistemnaya-krasnaya-volchanка-ru' : language === 'en' ? 'systemic-lupus-erythematosus-en' : 'tizimli-qizil-boricha-uz',
    description: language === 'ru' ? 
      'Системная красная волчанка - это аутоиммунное заболевание, которое может поражать многие органы и системы.' :
      language === 'en' ?
      'Systemic lupus erythematosus is an autoimmune disease that can affect many organs and systems.' :
      'Tizimli qizil bo\'richa - bu ko\'plab organ va tizimlarni zararlantirishi mumkin bo\'lgan autoimmun kasallik.',
    symptoms: language === 'ru' ? 
      ['Сыпь на лице', 'Боль в суставах', 'Усталость', 'Повышение температуры', 'Выпадение волос'] :
      language === 'en' ?
      ['Facial rash', 'Joint pain', 'Fatigue', 'Fever', 'Hair loss'] :
      ['Yuzdagi toshma', 'Bo\'g\'im og\'riqlari', 'Charchoq', 'Harorat ko\'tarilishi', 'Soch to\'kilishi'],
    treatment_methods: language === 'ru' ? 
      ['Иммуносупрессивная терапия', 'Кортикостероиды', 'Антималярийные препараты', 'Биологическая терапия'] :
      language === 'en' ?
      ['Immunosuppressive therapy', 'Corticosteroids', 'Antimalarial drugs', 'Biological therapy'] :
      ['Immunosupressiv terapiya', 'Kortikosteroidlar', 'Antimalyariya preparatlari', 'Biologik terapiya'],
    prevention_tips: language === 'ru' ? 
      ['Защита от солнца', 'Здоровый образ жизни', 'Регулярные обследования', 'Избегание стресса'] :
      language === 'en' ?
      ['Sun protection', 'Healthy lifestyle', 'Regular examinations', 'Stress avoidance'] :
      ['Quyoshdan himoyalanish', 'Sog\'lom turmush tarzi', 'Muntazam tekshiruvlar', 'Stressdan qochish'],
    featured_image_url: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=800',
    active: true,
    featured: true,
    order_index: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];