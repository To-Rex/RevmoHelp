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

    if (!supabaseAdmin) {
      console.log('⚠️ Supabase Admin not available');
      return { data: null, error: { message: 'Supabase Admin not available' } };
    }

    // Use admin client to get all users
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.log('❌ Supabase Auth error:', error);
      return { data: null, error };
    }

    console.log('✅ Auth users loaded from Supabase:', data.users.length);
    return { data: data.users as AuthUser[], error: null };
  } catch (error) {
    console.warn('👥 Error fetching auth users from Supabase:', error);
    return { data: null, error };
  }
};

// Get user profiles from database
export const getUserProfiles = async (): Promise<{ data: User[] | null; error: any }> => {
  try {
    console.log('👤 Loading user profiles from database...');

    if (!isSupabaseAvailable() || !supabaseAdmin) {
      console.log('⚠️ Supabase not available');
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Supabase profiles error:', error);
      return { data: null, error };
    }

    console.log('✅ User profiles loaded from Supabase:', data.length);
    return { data, error: null };
  } catch (error) {
    console.warn('👤 Error fetching user profiles from Supabase:', error);
    return { data: null, error };
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
