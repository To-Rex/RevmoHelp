import { supabase, isSupabaseAvailable } from './supabase';
import { supabaseAdmin } from './supabase';

export interface GlobalColorScheme {
  scheme: string;
  name: string;
  background: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  items: string;
  appliedAt: string;
  appliedBy: string;
}

interface GlobalSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_by?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Get global color scheme
export const getGlobalColorScheme = async (): Promise<{ data: GlobalColorScheme | null; error: any }> => {
  try {
    console.log('🌍 Loading global color scheme...');
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using default');
      return { 
        data: {
          scheme: 'default',
          name: 'Revmoinfo Default',
          background: '#CAD8D6',
          primary: '#90978C',
          primaryHover: '#7A8177',
          primaryActive: '#6B7268',
          items: '#FFFFFF',
          appliedAt: new Date().toISOString(),
          appliedBy: 'system'
        }, 
        error: null 
      };
    }

    const { data, error } = await supabase
      .from('global_settings')
      .select('setting_value')
      .eq('setting_key', 'color_scheme')
      .eq('active', true)
      .single();

    if (error) {
      console.log('❌ Supabase error loading global color scheme:', error);
      return { 
        data: {
          scheme: 'default',
          name: 'Revmoinfo Default',
          background: '#CAD8D6',
          primary: '#90978C',
          primaryHover: '#7A8177',
          primaryActive: '#6B7268',
          items: '#FFFFFF',
          appliedAt: new Date().toISOString(),
          appliedBy: 'system'
        }, 
        error: null 
      };
    }

    console.log('✅ Global color scheme loaded:', data.setting_value.name);
    return { data: data.setting_value as GlobalColorScheme, error: null };
  } catch (error) {
    console.warn('🌍 Error fetching global color scheme:', error);
    return { 
      data: {
        scheme: 'default',
        name: 'Revmoinfo Default',
        background: '#CAD8D6',
        primary: '#90978C',
        primaryHover: '#7A8177',
        primaryActive: '#6B7268',
        items: '#FFFFFF',
        appliedAt: new Date().toISOString(),
        appliedBy: 'system'
      }, 
      error: null 
    };
  }
};

// Update global color scheme (admin only)
export const updateGlobalColorScheme = async (colorScheme: GlobalColorScheme, adminId?: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabaseAdmin) {
      console.log('⚠️ Supabase not available, saving to localStorage');
      localStorage.setItem('revmoinfo-global-color-scheme', JSON.stringify({
        scheme: colorScheme.scheme,
        config: colorScheme,
        appliedAt: new Date().toISOString(),
        appliedBy: 'admin'
      }));
      return { error: null };
    }

    const { error } = await supabaseAdmin
      .from('global_settings')
      .upsert({
        setting_key: 'color_scheme',
        setting_value: {
          ...colorScheme,
          appliedAt: new Date().toISOString(),
          appliedBy: adminId
        },
        updated_by: adminId,
        active: true
      }, {
        onConflict: 'setting_key'
      });

    if (error) {
      console.error('❌ Error updating global color scheme:', error);
      return { error };
    }

    console.log('✅ Global color scheme updated successfully');
    return { error: null };
  } catch (error) {
    console.error('❌ Update global color scheme error:', error);
    return { error };
  }
};

// Subscribe to global settings changes
export const subscribeToGlobalSettings = (callback: (colorScheme: GlobalColorScheme) => void) => {
  if (!isSupabaseAvailable() || !supabase) {
    console.log('⚠️ Supabase not available, cannot subscribe to changes');
    return null;
  }

  console.log('🔔 Subscribing to global settings changes...');
  
  const subscription = supabase
    .channel('global_settings_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'global_settings',
        filter: 'setting_key=eq.color_scheme'
      },
      (payload) => {
        console.log('🌍 Global color scheme changed:', payload);
        if (payload.new && payload.new.setting_value) {
          callback(payload.new.setting_value as GlobalColorScheme);
        }
      }
    )
    .subscribe();

  return subscription;
};

// Get all global settings
const getAllGlobalSettings = async (): Promise<{ data: GlobalSetting[] | null; error: any }> => {
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