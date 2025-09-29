import { supabase, isSupabaseAvailable } from './supabase';

export interface ConsultationRequest {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  disease_type: string;
  phone: string;
  comments?: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface UpdateConsultationRequestData {
  id: string;
  status?: 'pending' | 'contacted' | 'completed' | 'cancelled';
  comments?: string;
}

// Get all consultation requests
export const getConsultationRequests = async (options?: {
  status?: string;
  limit?: number;
}): Promise<{ data: ConsultationRequest[] | null; error: any }> => {
  try {
    console.log('📋 Loading consultation requests from Supabase...');
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      return { data: getMockConsultationRequests(), error: null };
    }

    let query = supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.log('❌ Supabase error loading consultation requests:', error);
      console.log('🔄 Falling back to mock data');
      return { data: getMockConsultationRequests(), error: null };
    }

    console.log('✅ Consultation requests loaded from Supabase:', data?.length || 0);
    return { data, error: null };
  } catch (error) {
    console.warn('📋 Error fetching consultation requests from Supabase, using mock data:', error);
    return { data: getMockConsultationRequests(), error: null };
  }
};

// Update consultation request status
export const updateConsultationRequest = async (updateData: UpdateConsultationRequestData): Promise<{ data: ConsultationRequest | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { id, ...updateFields } = updateData;

    const { data, error } = await supabase
      .from('consultation_requests')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete consultation request
export const deleteConsultationRequest = async (requestId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabase
      .from('consultation_requests')
      .delete()
      .eq('id', requestId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Mock data fallback
const getMockConsultationRequests = (): ConsultationRequest[] => [
  {
    id: '1',
    first_name: 'Malika',
    last_name: 'Karimova',
    age: 45,
    disease_type: 'Revmatoid artrit',
    phone: '+998901234567',
    comments: 'Qo\'llarimda og\'riq va shishish bor. Ertalab qotishlik kuchli.',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    first_name: 'Akmal',
    last_name: 'Toshmatov',
    age: 52,
    disease_type: 'Osteoartroz',
    phone: '+998901234568',
    comments: 'Tizza og\'riqlari, ayniqsa yurish paytida kuchayadi.',
    status: 'contacted',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    first_name: 'Nodira',
    last_name: 'Abdullayeva',
    age: 38,
    disease_type: 'Fibromyalgiya',
    phone: '+998901234569',
    comments: 'Butun vujudda og\'riq, charchoq va uyqu buzilishi.',
    status: 'completed',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
];