import { supabaseAdmin, isSupabaseAvailable } from './supabase';
import type { User } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    phone?: string;
    role?: string;
  };
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
}

// Get all users from Supabase Auth
export const getAuthUsers = async (): Promise<{ data: AuthUser[] | null; error: any }> => {
  try {
    console.log('👥 Loading users from Supabase Auth...');
    
    if (!isSupabaseAvailable() || !supabaseAdmin) {
      console.log('⚠️ Supabase Admin not available, using mock data');
      return { data: getMockAuthUsers(), error: null };
    }

    // Use admin client to get all users
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.log('❌ Supabase Auth error:', error);
      console.log('🔄 Falling back to mock data');
      return { data: getMockAuthUsers(), error: null };
    }

    console.log('✅ Auth users loaded from Supabase:', data.users.length);
    return { data: data.users as AuthUser[], error: null };
  } catch (error) {
    console.warn('👥 Error fetching auth users from Supabase, using mock data:', error);
    return { data: getMockAuthUsers(), error: null };
  }
};

// Get user profiles from database
export const getUserProfiles = async (): Promise<{ data: User[] | null; error: any }> => {
  try {
    console.log('👤 Loading user profiles from database...');
    
    if (!isSupabaseAvailable() || !supabaseAdmin) {
      console.log('⚠️ Supabase not available, using mock data');
      return { data: getMockUserProfiles(), error: null };
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Supabase profiles error:', error);
      console.log('🔄 Falling back to mock data');
      return { data: getMockUserProfiles(), error: null };
    }

    console.log('✅ User profiles loaded from Supabase:', data.length);
    return { data, error: null };
  } catch (error) {
    console.warn('👤 Error fetching user profiles from Supabase, using mock data:', error);
    return { data: getMockUserProfiles(), error: null };
  }
};

// Delete user from Supabase Auth
export const deleteAuthUser = async (userId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabaseAdmin) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('❌ Error deleting user:', error);
      return { error };
    }

    console.log('✅ User deleted from Supabase Auth');
    return { error: null };
  } catch (error) {
    console.error('❌ Delete user error:', error);
    return { error };
  }
};

// Update user metadata
export const updateUserMetadata = async (
  userId: string, 
  metadata: { full_name?: string; phone?: string; role?: string }
): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabaseAdmin) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: metadata
    });
    
    if (error) {
      console.error('❌ Error updating user metadata:', error);
      return { error };
    }

    console.log('✅ User metadata updated');
    return { error: null };
  } catch (error) {
    console.error('❌ Update user metadata error:', error);
    return { error };
  }
};

// Mock data fallback
const getMockAuthUsers = (): AuthUser[] => [
  {
    id: 'auth-1',
    email: 'aziza.karimova@revmohelp.uz',
    phone: '+998901234567',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    user_metadata: {
      full_name: 'Dr. Aziza Karimova',
      role: 'doctor',
      phone: '+998901234567'
    },
    app_metadata: {
      provider: 'email',
      providers: ['email']
    }
  },
  {
    id: 'auth-2',
    email: 'akmal.karimov@gmail.com',
    email_confirmed_at: '2024-01-10T00:00:00Z',
    last_sign_in_at: '2024-01-14T15:30:00Z',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-14T15:30:00Z',
    user_metadata: {
      full_name: 'Akmal Karimov',
      role: 'patient',
      phone: '+998901234569'
    },
    app_metadata: {
      provider: 'google',
      providers: ['google']
    }
  },
  {
    id: 'auth-3',
    email: 'nodira.abdullayeva@gmail.com',
    email_confirmed_at: '2024-01-12T00:00:00Z',
    last_sign_in_at: '2024-01-13T09:20:00Z',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-13T09:20:00Z',
    user_metadata: {
      full_name: 'Nodira Abdullayeva',
      role: 'patient'
    },
    app_metadata: {
      provider: 'email',
      providers: ['email']
    }
  }
];

const getMockUserProfiles = (): User[] => [
  {
    id: 'auth-1',
    email: 'aziza.karimova@revmohelp.uz',
    full_name: 'Dr. Aziza Karimova',
    phone: '+998901234567',
    role: 'doctor',
    avatar_url: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'auth-2',
    email: 'akmal.karimov@gmail.com',
    full_name: 'Akmal Karimov',
    phone: '+998901234569',
    role: 'patient',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-14T15:30:00Z'
  },
  {
    id: 'auth-3',
    email: 'nodira.abdullayeva@gmail.com',
    full_name: 'Nodira Abdullayeva',
    role: 'patient',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-13T09:20:00Z'
  }
];