import { supabase, isSupabaseAvailable } from './supabase';
import { supabaseAdmin } from './supabase';

export interface GlobalSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_by?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}


// Get all global settings
export const getAllGlobalSettings = async (): Promise<{ data: GlobalSetting[] | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('global_settings')
      .select('*')
      .eq('active', true)
      .order('updated_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};