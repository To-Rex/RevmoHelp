import { supabase, isSupabaseAvailable } from './supabase';

export interface PatientStory {
  id: string;
  patient_name: string;
  age: number;
  diagnosis: string;
  story_content: string;
  treatment_duration: string;
  outcome: string;
  doctor_name: string;
  content_type: 'text' | 'image' | 'video';
  featured_image_url?: string;
  youtube_url?: string;
  symptoms: string[];
  treatment_methods: string[];
  medications: string[];
  lifestyle_changes: string;
  rating: number;
  featured: boolean;
  published: boolean;
  order_index: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  translations?: PatientStoryTranslation[];
  current_language?: string;
}

interface PatientStoryTranslation {
  id: string;
  story_id: string;
  language: 'uz' | 'ru' | 'en';
  patient_name: string;
  diagnosis: string;
  story_content: string;
  treatment_duration: string;
  outcome: string;
  doctor_name: string;
  symptoms: string[];
  treatment_methods: string[];
  medications: string[];
  lifestyle_changes: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientStoryData {
  patient_name: string;
  age: number;
  diagnosis: string;
  story_content: string;
  treatment_duration: string;
  outcome: string;
  doctor_name: string;
  content_type: 'text' | 'image' | 'video';
  featured_image?: File;
  youtube_url?: string;
  symptoms: string[];
  treatment_methods: string[];
  medications: string[];
  lifestyle_changes: string;
  rating: number;
  featured?: boolean;
  published?: boolean;
  order_index?: number;
  meta_title?: string;
  meta_description?: string;
  translations?: {
    [key: string]: {
      patient_name: string;
      diagnosis: string;
      story_content: string;
      treatment_duration: string;
      outcome: string;
      doctor_name: string;
      symptoms: string[];
      treatment_methods: string[];
      medications: string[];
      lifestyle_changes: string;
      meta_title?: string;
      meta_description?: string;
    };
  };
}

interface UpdatePatientStoryData extends Partial<CreatePatientStoryData> {
  id: string;
}

// Upload image to Supabase storage
export const uploadStoryImage = async (file: File, storyId: string): Promise<string | null> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available for image upload');
      return URL.createObjectURL(file); // Fallback for demo
    }

    console.log('📸 Uploading story image:', file.name, 'for story:', storyId);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${storyId}-${Date.now()}.${fileExt}`;
    const filePath = `patient-stories/${fileName}`;

    // Try to upload to post-images bucket (reuse existing bucket)
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Story image upload error:', error);
      console.log('🔄 Using fallback URL');
      return URL.createObjectURL(file); // Fallback
    }

    console.log('✅ Story image uploaded successfully:', data.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    console.log('🔗 Story image public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Story image upload error:', error);
    console.log('🔄 Using fallback URL');
    return URL.createObjectURL(file); // Fallback
  }
};

// Delete image from storage
const deleteStoryImage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return true; // Fallback
    }
    
    if (!isSupabaseAvailable() || !supabase) {
      return false;
    }

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `patient-stories/${fileName}`;

    const { error } = await supabase.storage
      .from('post-images')
      .remove([filePath]);

    if (error) {
      console.error('Image delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

// Barcha bemorlar tarixini olish
export const getPatientStories = async (language: string = 'uz', options?: {
  published?: boolean;
  featured?: boolean;
  limit?: number;
}): Promise<{ data: PatientStory[] | null; error: any }> => {
  try {
    console.log('📖 Loading patient stories from Supabase for language:', language);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      return { data: getMockPatientStories(language), error: null };
    }

    let query = supabase
      .from('patient_stories')
      .select(`
        *,
        translations:patient_story_translations(*)
      `)
      .order('order_index', { ascending: true });

    // Filtrlar qo'llash
    if (options?.published !== undefined) {
      query = query.eq('published', options.published);
    }

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.log('❌ Supabase error loading patient stories:', error);
      console.log('🔄 Falling back to mock data');
      return { data: getMockPatientStories(language), error: null };
    }

    // Tarjimalar bilan qayta ishlash
    const processedStories = data?.map(story => {
      const translation = story.translations?.find((t: any) => t.language === language);
      if (translation) {
        const translatedSymptoms = Array.isArray(translation.symptoms) && translation.symptoms.length > 0 ? translation.symptoms : story.symptoms;
        const translatedMethods = Array.isArray(translation.treatment_methods) && translation.treatment_methods.length > 0 ? translation.treatment_methods : story.treatment_methods;
        const translatedMeds = Array.isArray(translation.medications) && translation.medications.length > 0 ? translation.medications : story.medications;
        return {
          ...story,
          patient_name: translation.patient_name,
          diagnosis: translation.diagnosis,
          story_content: translation.story_content,
          treatment_duration: translation.treatment_duration,
          outcome: translation.outcome,
          doctor_name: translation.doctor_name,
          symptoms: translatedSymptoms,
          treatment_methods: translatedMethods,
          medications: translatedMeds,
          lifestyle_changes: translation.lifestyle_changes || story.lifestyle_changes,
          meta_title: translation.meta_title || story.meta_title,
          meta_description: translation.meta_description || story.meta_description,
          current_language: language
        };
      }
      return story;
    }) || [];

    console.log('✅ Patient stories loaded from Supabase:', processedStories.length);
    return { data: processedStories, error: null };
  } catch (error) {
    console.warn('📖 Error fetching patient stories from Supabase, using mock data:', error);
    return { data: getMockPatientStories(language), error: null };
  }
};

// Bitta bemor tarixini olish
export const getPatientStoryById = async (id: string, language: string = 'uz'): Promise<{ data: PatientStory | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      const mockStories = getMockPatientStories(language);
      const story = mockStories.find(s => s.id === id);
      return { data: story || null, error: story ? null : { message: 'Story not found' } };
    }

    const { data, error } = await supabase
      .from('patient_stories')
      .select(`
        *,
        translations:patient_story_translations(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.log('❌ Supabase error loading patient story:', error);
      const mockStories = getMockPatientStories(language);
      const story = mockStories.find(s => s.id === id);
      return { data: story || null, error: null };
    }

    // Tarjima bilan qayta ishlash
    const translation = data.translations?.find((t: any) => t.language === language);
    const processedStory = translation ? {
      ...data,
      patient_name: translation.patient_name,
      diagnosis: translation.diagnosis,
      story_content: translation.story_content,
      treatment_duration: translation.treatment_duration,
      outcome: translation.outcome,
      doctor_name: translation.doctor_name,
      symptoms: (Array.isArray(translation.symptoms) && translation.symptoms.length > 0) ? translation.symptoms : data.symptoms,
      treatment_methods: (Array.isArray(translation.treatment_methods) && translation.treatment_methods.length > 0) ? translation.treatment_methods : data.treatment_methods,
      medications: (Array.isArray(translation.medications) && translation.medications.length > 0) ? translation.medications : data.medications,
      lifestyle_changes: translation.lifestyle_changes || data.lifestyle_changes,
      meta_title: translation.meta_title || data.meta_title,
      meta_description: translation.meta_description || data.meta_description,
      current_language: language
    } : data;

    return { data: processedStory, error: null };
  } catch (error) {
    console.warn('📖 Error fetching patient story from Supabase:', error);
    return { data: null, error };
  }
};

// Yangi bemor tarixi yaratish
export const createPatientStory = async (storyData: CreatePatientStoryData): Promise<{ data: PatientStory | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock yaratish
      const newStory: PatientStory = {
        id: Date.now().toString(),
        ...storyData,
        featured_image_url: storyData.featured_image ? URL.createObjectURL(storyData.featured_image) : undefined,
        published: storyData.published ?? false,
        order_index: storyData.order_index ?? 0,
        featured: storyData.featured ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: newStory, error: null };
    }

    // Asosiy tarixni yaratish (rasm olmagan holda)
    const { data: story, error: storyError } = await supabase
      .from('patient_stories')
      .insert({
        patient_name: storyData.patient_name,
        age: storyData.age,
        diagnosis: storyData.diagnosis,
        story_content: storyData.story_content,
        treatment_duration: storyData.treatment_duration,
        outcome: storyData.outcome,
        doctor_name: storyData.doctor_name,
        content_type: storyData.content_type,
        youtube_url: storyData.youtube_url,
        symptoms: storyData.symptoms,
        treatment_methods: storyData.treatment_methods,
        medications: storyData.medications,
        lifestyle_changes: storyData.lifestyle_changes,
        rating: storyData.rating,
        featured: storyData.featured ?? false,
        published: storyData.published ?? false,
        order_index: storyData.order_index ?? 0,
        meta_title: storyData.meta_title,
        meta_description: storyData.meta_description
      })
      .select()
      .single();

    if (storyError) {
      return { data: null, error: storyError };
    }

    // Rasm yuklash (agar berilgan bo'lsa)
    if (storyData.featured_image && story) {
      const imageUrl = await uploadStoryImage(storyData.featured_image, story.id);
      if (imageUrl) {
        const { data: updatedStory, error: updateError } = await supabase
          .from('patient_stories')
          .update({ featured_image_url: imageUrl })
          .eq('id', story.id)
          .select()
          .single();

        if (updateError) {
          return { data: null, error: updateError };
        }

        Object.assign(story, updatedStory);
      }
    }

    // O'zbek tilidagi standart tarjimani yaratish
    const { error: translationError } = await supabase
      .from('patient_story_translations')
      .insert({
        story_id: story.id,
        language: 'uz',
        patient_name: storyData.patient_name,
        diagnosis: storyData.diagnosis,
        story_content: storyData.story_content,
        treatment_duration: storyData.treatment_duration,
        outcome: storyData.outcome,
        doctor_name: storyData.doctor_name,
        symptoms: storyData.symptoms,
        treatment_methods: storyData.treatment_methods,
        medications: storyData.medications,
        lifestyle_changes: storyData.lifestyle_changes,
        meta_title: storyData.meta_title,
        meta_description: storyData.meta_description
      });

    if (translationError) {
      console.warn('Warning: Could not create default translation:', translationError);
    }

    // Qo'shimcha tarjimalarni yaratish
    if (storyData.translations) {
      const translationInserts = Object.entries(storyData.translations).map(([lang, translation]) => ({
        story_id: story.id,
        language: lang,
        patient_name: translation.patient_name ?? storyData.patient_name,
        diagnosis: translation.diagnosis ?? storyData.diagnosis,
        story_content: translation.story_content ?? storyData.story_content,
        treatment_duration: translation.treatment_duration ?? storyData.treatment_duration,
        outcome: translation.outcome ?? storyData.outcome,
        doctor_name: translation.doctor_name ?? storyData.doctor_name,
        symptoms: translation.symptoms ?? storyData.symptoms,
        treatment_methods: translation.treatment_methods ?? storyData.treatment_methods,
        medications: translation.medications ?? storyData.medications,
        lifestyle_changes: translation.lifestyle_changes ?? storyData.lifestyle_changes,
        meta_title: translation.meta_title ?? storyData.meta_title,
        meta_description: translation.meta_description ?? storyData.meta_description
      }));

      const { error: additionalTranslationsError } = await supabase
        .from('patient_story_translations')
        .insert(translationInserts);

      if (additionalTranslationsError) {
        console.warn('Warning: Could not create additional translations:', additionalTranslationsError);
      }
    }

    return { data: story, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Bemor tarixini yangilash
export const updatePatientStory = async (storyData: UpdatePatientStoryData): Promise<{ data: PatientStory | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { id, featured_image, translations, ...updateData } = storyData;

    // Rasm yuklash (agar yangi rasm berilgan bo'lsa)
    if (featured_image) {
      const imageUrl = await uploadStoryImage(featured_image, id);
      if (imageUrl) {
        updateData.featured_image_url = imageUrl;
      }
    }

    // Asosiy ma'lumotlarni yangilash
    const { data: story, error: storyError } = await supabase
      .from('patient_stories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (storyError) {
      return { data: null, error: storyError };
    }

    // Tarjimalarni yangilash
    if (translations) {
      for (const [lang, translation] of Object.entries(translations)) {
        const { error: translationError } = await supabase
          .from('patient_story_translations')
          .upsert({
            story_id: id,
            language: lang,
            patient_name: translation.patient_name ?? (updateData.patient_name as string | undefined),
            diagnosis: translation.diagnosis ?? (updateData.diagnosis as string | undefined),
            story_content: translation.story_content ?? (updateData.story_content as string | undefined),
            treatment_duration: translation.treatment_duration ?? (updateData.treatment_duration as string | undefined),
            outcome: translation.outcome ?? (updateData.outcome as string | undefined),
            doctor_name: translation.doctor_name ?? (updateData.doctor_name as string | undefined),
            symptoms: translation.symptoms ?? (updateData.symptoms as string[] | undefined),
            treatment_methods: translation.treatment_methods ?? (updateData.treatment_methods as string[] | undefined),
            medications: translation.medications ?? (updateData.medications as string[] | undefined),
            meta_title: translation.meta_title ?? (updateData.meta_title as string | undefined),
            meta_description: translation.meta_description ?? (updateData.meta_description as string | undefined)
          });

        if (translationError) {
          console.warn(`Warning: Could not update ${lang} translation:`, translationError);
        }
      }
    }

    return { data: story, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Bemor tarixini o'chirish
export const deletePatientStory = async (storyId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    // Rasmni o'chirish (agar mavjud bo'lsa)
    const { data: story } = await supabase
      .from('patient_stories')
      .select('featured_image_url')
      .eq('id', storyId)
      .single();

    if (story?.featured_image_url) {
      await deleteStoryImage(story.featured_image_url);
    }

    // Tarixni o'chirish
    const { error } = await supabase
      .from('patient_stories')
      .delete()
      .eq('id', storyId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Mock ma'lumotlar
const getMockPatientStories = (language?: string): PatientStory[] => [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    patient_name: language === 'ru' ? 'Малика Каримова' : language === 'en' ? 'Malika Karimova' : 'Malika Karimova',
    age: 45,
    diagnosis: language === 'ru' ? 'Ревматоидный артрит' : language === 'en' ? 'Rheumatoid Arthritis' : 'Revmatoid artrit',
    story_content: language === 'ru' ? 
      'Три года назад у меня начались боли в суставах. Сначала я думала, что это просто усталость, но боли усиливались. После обращения к ревматологу был поставлен диагноз ревматоидный артрит. Благодаря своевременному лечению и поддержке врачей, сейчас я чувствую себя намного лучше.' :
      language === 'en' ?
      'Three years ago, I started experiencing joint pain. At first, I thought it was just fatigue, but the pain got worse. After consulting a rheumatologist, I was diagnosed with rheumatoid arthritis. Thanks to timely treatment and doctor support, I now feel much better.' :
      'Uch yil oldin qo\'shmalarda og\'riq boshlanganida, dastlab oddiy charchoq deb o\'yladim. Ammo og\'riqlar kuchayib bordi. Revmatolog shifokorga murojaat qilganimdan so\'ng revmatoid artrit tashxisi qo\'yildi. O\'z vaqtida davolash va shifokorlar yordami tufayli hozir o\'zimni ancha yaxshi his qilaman.',
    treatment_duration: language === 'ru' ? '18 месяцев лечения' : language === 'en' ? '18 months of treatment' : '18 oylik davolash',
    outcome: language === 'ru' ? 'Полное выздоровление, возврат к активной жизни' : language === 'en' ? 'Complete recovery, return to active life' : 'To\'liq shifo, faol hayotga qaytish',
    doctor_name: 'Dr. Aziza Karimova',
    content_type: 'image',
    featured_image_url: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=800',
    symptoms: ['Qo\'shma og\'riqlari', 'Ertalabki qotishlik', 'Shishish'],
    treatment_methods: ['Dori davolash', 'Fizioterapiya', 'Jismoniy mashqlar'],
    medications: ['Metotreksat', 'Prednizolon', 'Og\'riq qoldiruvchi'],
    lifestyle_changes: 'Sog\'lom ovqatlanish, muntazam mashqlar, stress boshqaruvi',
    rating: 5,
    featured: true,
    published: true,
    order_index: 1,
    meta_title: 'Malika Karimova - Revmatoid artrit shifo tarixi',
    meta_description: 'Revmatoid artritdan shifo topgan bemor tarixi',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    patient_name: language === 'ru' ? 'Акмал Рахимов' : language === 'en' ? 'Akmal Rahimov' : 'Akmal Rahimov',
    age: 52,
    diagnosis: language === 'ru' ? 'Остеоартроз коленных суставов' : language === 'en' ? 'Knee Osteoarthritis' : 'Tizza qo\'shmalari osteoartozi',
    story_content: language === 'ru' ? 
      'Работая строителем более 20 лет, я не обращал внимания на боли в коленях. Когда боль стала невыносимой, обратился к врачу. Диагноз - остеоартроз. Благодаря комплексному лечению и физиотерапии, смог вернуться к работе.' :
      language === 'en' ?
      'Working as a builder for over 20 years, I ignored knee pain. When the pain became unbearable, I saw a doctor. Diagnosis - osteoarthritis. Thanks to comprehensive treatment and physiotherapy, I was able to return to work.' :
      'Qurilishchi bo\'lib 20 yildan ortiq ishlaganimda tizza og\'riqlariga e\'tibor bermagan edim. Og\'riq chidab bo\'lmas darajaga yetganda shifokorga murojaat qildim. Tashxis - osteoartroz. Kompleks davolash va fizioterapiya tufayli ishga qayta qaytishga muvaffaq bo\'ldim.',
    treatment_duration: language === 'ru' ? '12 месяцев комплексной терапии' : language === 'en' ? '12 months of comprehensive therapy' : '12 oylik kompleks terapiya',
    outcome: language === 'ru' ? 'Значительное улучшение, возврат к работе' : language === 'en' ? 'Significant improvement, return to work' : 'Sezilarli yaxshilanish, ishga qaytish',
    doctor_name: 'Dr. Bobur Toshmatov',
    content_type: 'video',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    symptoms: ['Tizza og\'riqlari', 'Harakat cheklanganligi', 'Qotishlik'],
    treatment_methods: ['Fizioterapiya', 'Injeksiyalar', 'Jismoniy mashqlar'],
    medications: ['Diklofenak', 'Gialuronik kislota', 'Xondroitin'],
    lifestyle_changes: 'Vazn kamaytirish, kam ta\'sirli mashqlar, to\'g\'ri pozitsiya',
    rating: 4,
    featured: false,
    published: true,
    order_index: 2,
    meta_title: 'Akmal Rahimov - Osteoartroz shifo tarixi',
    meta_description: 'Osteoartroz kasalligidan shifo topgan bemor tarixi',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    patient_name: language === 'ru' ? 'Нодира Абдуллаева' : language === 'en' ? 'Nodira Abdullayeva' : 'Nodira Abdullayeva',
    age: 38,
    diagnosis: language === 'ru' ? 'Фибромиа��гия' : language === 'en' ? 'Fibromyalgia' : 'Fibromyalgiya',
    story_content: language === 'ru' ? 
      'Годами страдала от хронических болей по всему телу. Врачи не могли поставить точный диагноз. Наконец, ревматолог диагностировал фибромиалгию. Специальная программа лечения и изменение образа жизни помогли значительно улучшить качество жизни.' :
      language === 'en' ?
      'For years I suffered from chronic pain throughout my body. Doctors couldn\'t make an accurate diagnosis. Finally, a rheumatologist diagnosed fibromyalgia. A special treatment program and lifestyle changes helped significantly improve my quality of life.' :
      'Yillar davomida butun vujudimda surunkali og\'riqlardan aziyat chekdim. Shifokorlar aniq tashxis qo\'ya olmayotgan edi. Nihoyat, revmatolog fibromyalgiya tashxisini qo\'ydi. Maxsus davolash dasturi va turmush tarzini o\'zgartirish hayot sifatini sezilarli darajada yaxshilashga yordam berdi.',
    treatment_duration: language === 'ru' ? '24 месяца комплексного лечения' : language === 'en' ? '24 months of comprehensive treatment' : '24 oylik kompleks davolash',
    outcome: language === 'ru' ? 'Контроль симптомов, улучшение качества жизни' : language === 'en' ? 'Symptom control, improved quality of life' : 'Simptomlarni nazorat qilish, hayot sifatini yaxshilash',
    doctor_name: 'Dr. Nilufar Abdullayeva',
    content_type: 'text',
    symptoms: ['Surunkali og\'riq', 'Charchoq', 'Uyqu buzilishi'],
    treatment_methods: ['Kognitiv terapiya', 'Jismoniy mashqlar', 'Stress boshqaruvi'],
    medications: ['Pregabalin', 'Amitriptilin', 'Vitamin D'],
    lifestyle_changes: 'Uyqu rejimi, stress kamaytirish, muntazam mashqlar',
    rating: 4,
    featured: false,
    published: true,
    order_index: 3,
    meta_title: 'Nodira Abdullayeva - Fibromyalgiya shifo tarixi',
    meta_description: 'Fibromyalgiya kasalligidan shifo topgan bemor tarixi',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
];
