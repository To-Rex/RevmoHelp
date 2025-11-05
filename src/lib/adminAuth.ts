export interface AdminUser {
  id: string;
  login: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'moderator';
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Demo admin users (fallback)
const DEMO_ADMINS: AdminUser[] = [
  {
    id: 'admin-1',
    login: 'admin',
    full_name: 'Super Admin',
    phone: '+998901234567',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'moderator-1',
    login: 'moderator',
    full_name: 'Moderator User',
    phone: '+998901234568',
    role: 'moderator',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const DEMO_PASSWORDS: Record<string, string> = {
  'admin': 'admin123',
  'moderator': 'mod123'
};

// Import supabase
import { supabase, isSupabaseAvailable } from './supabase';


// Admin login - oddiy
export const adminLogin = async (login: string, password: string): Promise<{
  data: AdminUser | null;
  error: any;
}> => {
  try {
    console.log('🔐 Admin login:', login);
    
    if (isSupabaseAvailable()) {
      try {
        // Oddiy query - RLS yo'q
        const { data, error } = await supabase
          .from('simple_admins')
          .select('*')
          .eq('login', login)
          .eq('password', password)
          .eq('active', true)
          .single();

        if (error) {
          console.log('❌ Supabase error:', error);
          if (error.code === 'PGRST116') {
            // No rows found
            console.log('⚠️ Admin not found, trying demo');
          } else {
            throw error;
          }
        } else if (data) {
          console.log('✅ Supabase admin login successful:', data.full_name);
          localStorage.setItem('admin_user', JSON.stringify(data));
          localStorage.setItem('admin_login_time', new Date().toISOString());
          return { data, error: null };
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase error, using demo:', supabaseError);
      }
    }

    // Demo authentication (fallback)
    console.log('🔄 Using demo authentication');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const admin = DEMO_ADMINS.find(a => a.login === login && a.active);
    
    if (!admin) {
      return { data: null, error: { message: 'Login topilmadi yoki faol emas' } };
    }
    
    const expectedPassword = DEMO_PASSWORDS[login];
    if (password !== expectedPassword) {
      return { data: null, error: { message: 'Parol noto\'g\'ri' } };
    }
    
    console.log('✅ Demo admin login successful:', admin.full_name);
    
    localStorage.setItem('admin_user', JSON.stringify(admin));
    localStorage.setItem('admin_login_time', new Date().toISOString());
    
    return { data: admin, error: null };
  } catch (error) {
    console.error('❌ Admin login error:', error);
    return { data: null, error: { message: 'Tizimda xatolik yuz berdi' } };
  }
};

// Admin logout
export const adminLogout = async () => {
  console.log('🚪 Admin logout');
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_login_time');
};

// Get current admin
export const getCurrentAdmin = (): AdminUser | null => {
  try {
    const adminData = localStorage.getItem('admin_user');
    const loginTime = localStorage.getItem('admin_login_time');
    
    if (!adminData || !loginTime) {
      return null;
    }

    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      adminLogout();
      return null;
    }

    return JSON.parse(adminData);
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
};

// Get all admins - oddiy
export const getAdmins = async (): Promise<{ data: AdminUser[] | null; error: any }> => {
  try {
    console.log('🔍 Loading admins...');
    
    if (isSupabaseAvailable()) {
      try {
        // Oddiy query - RLS yo'q
        const { data, error } = await supabase
          .from('simple_admins')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          console.log('✅ Loaded admins from Supabase:', data.length);
          return { data, error: null };
        } else {
          console.log('⚠️ Supabase error, using demo data:', error);
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase error, using demo data:', supabaseError);
      }
    }

    // Fallback to demo data
    console.log('🔄 Using demo admin data');
    return { data: DEMO_ADMINS, error: null };
  } catch (error) {
    console.log('⚠️ Error loading admins, using demo data:', error);
    return { data: DEMO_ADMINS, error: null };
  }
};

// Create new admin - oddiy
export const createAdmin = async (
  login: string,
  password: string,
  fullName: string,
  phone?: string,
  role: 'admin' | 'moderator' = 'moderator'
): Promise<{ data: string | null; error: any }> => {
  try {
    if (isSupabaseAvailable()) {
      try {
        // Check if login exists
        const { data: existing } = await supabase
          .from('simple_admins')
          .select('id')
          .eq('login', login)
          .maybeSingle();

        if (existing) {
          return { data: null, error: { message: 'Bu login allaqachon mavjud' } };
        }

        // Create new admin - oddiy insert
        const { data, error } = await supabase
          .from('simple_admins')
          .insert({
            login,
            password, // Oddiy parol - hash yo'q
            full_name: fullName,
            phone,
            role
          })
          .select()
          .single();

        if (error) {
          console.log('❌ Supabase create error:', error);
          return { data: null, error };
        }

        console.log('✅ Admin created in Supabase:', data.login);
        return { data: data.id, error: null };
      } catch (supabaseError) {
        console.log('⚠️ Supabase error, using demo:', supabaseError);
      }
    }

    // Demo fallback
    if (DEMO_ADMINS.find(a => a.login === login)) {
      return { data: null, error: { message: 'Bu login allaqachon mavjud' } };
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      login,
      full_name: fullName,
      phone,
      role,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    DEMO_ADMINS.push(newAdmin);
    DEMO_PASSWORDS[login] = password;
    
    console.log('✅ Demo admin created:', login);
    return { data: newAdmin.id, error: null };
  } catch (error) {
    console.error('❌ Create admin error:', error);
    return { data: null, error };
  }
};

// Update admin - oddiy
export const updateAdmin = async (
  adminId: string,
  updateData: {
    login?: string;
    password?: string;
    full_name?: string;
    phone?: string;
    role?: 'admin' | 'moderator';
    active?: boolean;
  }
): Promise<{ data: AdminUser | null; error: any }> => {
  try {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('simple_admins')
          .update(updateData)
          .eq('id', adminId)
          .select()
          .single();

        if (error) {
          console.log('❌ Supabase update error:', error);
          return { data: null, error };
        }

        console.log('✅ Admin updated in Supabase:', data.login);
        return { data, error: null };
      } catch (supabaseError) {
        console.log('⚠️ Supabase error, using demo:', supabaseError);
      }
    }

    // Demo fallback
    const adminIndex = DEMO_ADMINS.findIndex(a => a.id === adminId);
    if (adminIndex === -1) {
      return { data: null, error: { message: 'Admin topilmadi' } };
    }

    const admin = DEMO_ADMINS[adminIndex];
    const oldLogin = admin.login;

    if (updateData.login && updateData.login !== oldLogin) {
      if (DEMO_ADMINS.find(a => a.login === updateData.login && a.id !== adminId)) {
        return { data: null, error: { message: 'Bu login allaqachon mavjud' } };
      }
    }

    const updatedAdmin = {
      ...admin,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    DEMO_ADMINS[adminIndex] = updatedAdmin;

    if (updateData.password) {
      DEMO_PASSWORDS[updatedAdmin.login] = updateData.password;
      if (updateData.login && updateData.login !== oldLogin) {
        delete DEMO_PASSWORDS[oldLogin];
      }
    } else if (updateData.login && updateData.login !== oldLogin) {
      DEMO_PASSWORDS[updateData.login] = DEMO_PASSWORDS[oldLogin];
      delete DEMO_PASSWORDS[oldLogin];
    }

    console.log('✅ Demo admin updated:', updatedAdmin.login);
    return { data: updatedAdmin, error: null };
  } catch (error) {
    console.error('❌ Update admin error:', error);
    return { data: null, error };
  }
};

// Delete admin - oddiy
export const deleteAdmin = async (adminId: string): Promise<{ error: any }> => {
  try {
    if (isSupabaseAvailable()) {
      try {
        const { error } = await supabase
          .from('simple_admins')
          .delete()
          .eq('id', adminId);

        if (error) {
          console.log('❌ Supabase delete error:', error);
          return { error };
        }

        console.log('✅ Admin deleted from Supabase');
        return { error: null };
      } catch (supabaseError) {
        console.log('⚠️ Supabase error, using demo:', supabaseError);
      }
    }

    // Demo fallback
    const adminIndex = DEMO_ADMINS.findIndex(a => a.id === adminId);
    if (adminIndex === -1) {
      return { error: { message: 'Admin topilmadi' } };
    }

    const admin = DEMO_ADMINS[adminIndex];
    DEMO_ADMINS.splice(adminIndex, 1);
    delete DEMO_PASSWORDS[admin.login];
    
    console.log('✅ Demo admin deleted:', admin.login);
    return { error: null };
  } catch (error) {
    console.error('❌ Delete admin error:', error);
    return { error };
  }
};