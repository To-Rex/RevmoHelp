import { supabase, isSupabaseAvailable } from './supabase';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  partnership_type: 'medical' | 'education' | 'technology' | 'association' | 'general';
  active: boolean;
  featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerData {
  name: string;
  slug: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  partnership_type?: string;
  active?: boolean;
  featured?: boolean;
  order_index?: number;
}

export interface UpdatePartnerData extends Partial<CreatePartnerData> {
  id: string;
}

// Hamkorlarni olish
export const getPartners = async (options?: {
  active?: boolean;
  featured?: boolean;
  partnership_type?: string;
}): Promise<{ data: Partner[] | null; error: any }> => {
  try {
    console.log('🤝 Loading partners from Supabase...');
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      return { data: getMockPartners(), error: null };
    }

    let query = supabase
      .from('partners')
      .select('*')
      .order('order_index', { ascending: true });

    // Filtrlar qo'llash
    if (options?.active !== undefined) {
      query = query.eq('active', options.active);
    }

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    if (options?.partnership_type) {
      query = query.eq('partnership_type', options.partnership_type);
    }

    const { data, error } = await query;

    if (error) {
      console.log('❌ Supabase error loading partners:', error);
      console.log('🔄 Falling back to mock data');
      return { data: getMockPartners(), error: null };
    }

    console.log('✅ Partners loaded from Supabase:', data?.length || 0);
    return { data, error: null };
  } catch (error) {
    console.warn('🤝 Error fetching partners from Supabase, using mock data:', error);
    return { data: getMockPartners(), error: null };
  }
};

// Bitta hamkorni olish
export const getPartnerBySlug = async (slug: string): Promise<{ data: Partner | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      const mockPartners = getMockPartners();
      const partner = mockPartners.find(p => p.slug === slug);
      return { data: partner || null, error: partner ? null : { message: 'Partner not found' } };
    }

    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Yangi hamkor yaratish
export const createPartner = async (partnerData: CreatePartnerData): Promise<{ data: Partner | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock yaratish
      const newPartner: Partner = {
        id: Date.now().toString(),
        ...partnerData,
        partnership_type: partnerData.partnership_type as any || 'general',
        active: partnerData.active ?? true,
        featured: partnerData.featured ?? false,
        order_index: partnerData.order_index ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: newPartner, error: null };
    }

    const { data, error } = await supabase
      .from('partners')
      .insert(partnerData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Hamkorni yangilash
export const updatePartner = async (partnerData: UpdatePartnerData): Promise<{ data: Partner | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { id, ...updateData } = partnerData;

    const { data, error } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Hamkorni o'chirish
export const deletePartner = async (partnerId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', partnerId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Slug noyobligini tekshirish
export const checkPartnerSlugUniqueness = async (slug: string, excludePartnerId?: string): Promise<{ isUnique: boolean; error?: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { isUnique: true };
    }

    let query = supabase
      .from('partners')
      .select('id')
      .eq('slug', slug);
    
    if (excludePartnerId) {
      query = query.neq('id', excludePartnerId);
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
const getMockPartners = (): Partner[] => [
  {
    id: '1',
    name: 'Toshkent Tibbiyot Akademiyasi',
    slug: 'toshkent-tibbiyot-akademiyasi',
    logo_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400',
    website_url: 'https://tma.uz',
    description: 'O\'zbekistonning yetakchi tibbiyot ta\'lim muassasasi. Yuqori malakali shifokorlar tayyorlaydi.',
    contact_email: 'info@tma.uz',
    contact_phone: '+998 71 150 78 00',
    address: 'Toshkent, Farabi ko\'chasi 2',
    partnership_type: 'education',
    active: true,
    featured: true,
    order_index: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Respublika Ixtisoslashtirilgan Terapiya Markazi',
    slug: 'respublika-terapiya-markazi',
    logo_url: 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400',
    website_url: 'https://therapy.uz',
    description: 'Terapiya va tibbiy reabilitatsiya bo\'yicha ixtisoslashgan markaz.',
    contact_email: 'info@therapy.uz',
    contact_phone: '+998 71 120 45 67',
    address: 'Toshkent, Navoi ko\'chasi 78',
    partnership_type: 'medical',
    active: true,
    featured: true,
    order_index: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'O\'zbekiston Revmatologlar Assotsiatsiyasi',
    slug: 'uzbekiston-revmatologlar-assotsiatsiyasi',
    logo_url: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=400',
    website_url: 'https://rheumatology.uz',
    description: 'O\'zbekiston revmatologlarining professional birlashmasi.',
    contact_email: 'info@rheumatology.uz',
    contact_phone: '+998 71 234 56 78',
    address: 'Toshkent, Amir Temur ko\'chasi 15',
    partnership_type: 'association',
    active: true,
    featured: true,
    order_index: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Xalqaro Tibbiyot Markazi',
    slug: 'xalqaro-tibbiyot-markazi',
    logo_url: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400',
    website_url: 'https://imc.uz',
    description: 'Xalqaro standartlarda tibbiy xizmatlar ko\'rsatuvchi markaz.',
    contact_email: 'info@imc.uz',
    contact_phone: '+998 71 345 67 89',
    address: 'Toshkent, Mirzo Ulug\'bek ko\'chasi 56',
    partnership_type: 'medical',
    active: true,
    featured: false,
    order_index: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Tibbiy Texnologiyalar Instituti',
    slug: 'tibbiy-texnologiyalar-instituti',
    logo_url: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=400',
    website_url: 'https://medtech.uz',
    description: 'Zamonaviy tibbiy texnologiyalar va innovatsiyalar markazi.',
    contact_email: 'info@medtech.uz',
    contact_phone: '+998 71 456 78 90',
    address: 'Toshkent, Chilonzor tumani',
    partnership_type: 'technology',
    active: true,
    featured: false,
    order_index: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Oila Shifokorlari Markazi',
    slug: 'oila-shifokorlari-markazi',
    logo_url: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
    website_url: 'https://familydoc.uz',
    description: 'Oila shifokorlari xizmatlari va birlamchi tibbiy yordam.',
    contact_email: 'info@familydoc.uz',
    contact_phone: '+998 71 567 89 01',
    address: 'Toshkent, Yashnobod tumani',
    partnership_type: 'medical',
    active: false,
    featured: false,
    order_index: 6,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];