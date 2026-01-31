import { supabase, isSupabaseAvailable } from './supabase';
import { getCurrentAdmin } from './adminAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target_type: 'individual' | 'broadcast';
  target_user_id?: string;
  post_id?: string;
  created_by?: string;
  read_by: string[];
  sent_at: string;
  expires_at?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  post?: {
    id: string;
    title: string;
    slug: string;
  };
  creator?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target_type: 'individual' | 'broadcast';
  target_user_id?: string;
  post_id?: string;
  expires_at?: string;
}

// Get notifications for current user
export const getUserNotifications = async (): Promise<{ data: Notification[] | null; error: any }> => {
  try {
    console.log('🔔 Loading user notifications...');
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      return { data: getMockNotifications(), error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: null };
    }

    const broadcastResult = await supabase
      .from('notifications')
      .select(`
        *,
        post:posts(id, title, slug),
        creator:profiles!notifications_created_by_fkey(id, full_name, role)
      `)
      .eq('active', true)
      .or('expires_at.is.null,expires_at.gt.now()')
      .eq('target_type', 'broadcast')
      .order('sent_at', { ascending: false });

    const individualResult = await supabase
      .from('notifications')
      .select(`
        *,
        post:posts(id, title, slug),
        creator:profiles!notifications_created_by_fkey(id, full_name, role)
      `)
      .eq('active', true)
      .or('expires_at.is.null,expires_at.gt.now()')
      .eq('target_type', 'individual')
      .eq('target_user_id', user.id)
      .order('sent_at', { ascending: false });

    if (broadcastResult.error || individualResult.error) {
      console.log('❌ Supabase error loading notifications:', broadcastResult.error || individualResult.error);
      return { data: getMockNotifications(), error: null };
    }

    const allData = [...(broadcastResult.data || []), ...(individualResult.data || [])];
    allData.sort((a, b) => new Date(b.sent_at || 0).getTime() - new Date(a.sent_at || 0).getTime());

    console.log('✅ Notifications loaded from Supabase:', allData.length);
    return { data: allData, error: null };
  } catch (error) {
    console.warn('🔔 Error fetching notifications, using mock data:', error);
    return { data: getMockNotifications(), error: null };
  }
};

// Get all notifications for admin
export const getAllNotifications = async (): Promise<{ data: Notification[] | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: getMockNotifications(), error: null };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        post:posts(id, title, slug),
        creator:profiles!notifications_created_by_fkey(id, full_name, role)
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Create notification
export const createNotification = async (notificationData: CreateNotificationData): Promise<{ data: Notification | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      const mockNotification: Notification = {
        id: Date.now().toString(),
        ...notificationData,
        created_by: 'demo-admin',
        read_by: [],
        sent_at: new Date().toISOString(),
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: mockNotification, error: null };
    }

    // Check for admin user first
    const admin = getCurrentAdmin();
    let creatorId: string | undefined;

    if (!admin) {
      // Check for regular user auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }
      creatorId = user.id;
    }
    // For admin, creatorId remains undefined (null in db)

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        ...(creatorId && { created_by: creatorId }),
        active: true,
        sent_at: new Date().toISOString()
      })
      .select(`
        *,
        post:posts(id, title, slug),
        creator:profiles!notifications_created_by_fkey(id, full_name, role)
      `)
      .single();

    if (error) {
      console.log('⚠️ Supabase insert failed, using mock:', error);
      const mockNotification: Notification = {
        id: Date.now().toString(),
        ...notificationData,
        created_by: admin ? undefined : 'system',
        read_by: [],
        sent_at: new Date().toISOString(),
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: mockNotification, error: null };
    }

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    // Get current notification
    const { data: notification } = await supabase
      .from('notifications')
      .select('read_by')
      .eq('id', notificationId)
      .single();

    if (!notification) {
      return { error: { message: 'Notification not found' } };
    }

    const readBy = notification.read_by || [];
    if (!readBy.includes(user.id)) {
      readBy.push(user.id);

      const { error } = await supabase
        .from('notifications')
        .update({ read_by: readBy })
        .eq('id', notificationId);

      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: null };
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (): Promise<{ count: number; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { count: 2, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { count: 0, error: null };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, read_by')
      .eq('active', true)
      .or('expires_at.is.null,expires_at.gt.now()')
      .or(`target_type.eq.broadcast,and(target_type.eq.individual,target_user_id.eq.${user.id})`);

    if (error) {
      return { count: 0, error };
    }

    const unreadCount = data?.filter(notification => {
      const readBy = notification.read_by || [];
      return !readBy.includes(user.id);
    }).length || 0;

    return { count: unreadCount, error: null };
  } catch (error) {
    return { count: 0, error };
  }
};

// Mock data fallback
const getMockNotifications = (): Notification[] => [
  {
    id: '1',
    title: 'Yangi maqola nashr etildi',
    message: 'Dr. Aziza Karimova tomonidan "Revmatoid artrit: zamonaviy davolash usullari" maqolasi nashr etildi.',
    type: 'info',
    target_type: 'broadcast',
    post_id: '1',
    created_by: 'admin-1',
    read_by: [],
    sent_at: new Date().toISOString(),
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    post: {
      id: '1',
      title: 'Revmatoid artrit: zamonaviy davolash usullari',
      slug: 'revmatoid-artrit-zamonaviy-davolash'
    },
    creator: {
      id: 'admin-1',
      full_name: 'Admin User',
      role: 'admin'
    }
  },
  {
    id: '2',
    title: 'Profilingiz yangilandi',
    message: 'Sizning profil ma\'lumotlaringiz muvaffaqiyatli yangilandi.',
    type: 'success',
    target_type: 'individual',
    created_by: 'system',
    read_by: [],
    sent_at: new Date(Date.now() - 86400000).toISOString(),
    active: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    creator: {
      id: 'system',
      full_name: 'System',
      role: 'admin'
    }
  },
  {
    id: '3',
    title: 'Yangi shifokor qo\'shildi',
    message: 'Dr. Bobur Toshmatov platformaga qo\'shildi va endi konsultatsiya beradi.',
    type: 'info',
    target_type: 'broadcast',
    created_by: 'admin-1',
    read_by: ['user-1'],
    sent_at: new Date(Date.now() - 172800000).toISOString(),
    active: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    creator: {
      id: 'admin-1',
      full_name: 'Admin User',
      role: 'admin'
    }
  }
];