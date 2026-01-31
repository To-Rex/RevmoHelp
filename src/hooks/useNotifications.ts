import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import {
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead
} from '../lib/notifications';
import type { Notification } from '../lib/notifications';

export const useNotifications = () => {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load notifications if user is authenticated and auth is not loading
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    loadNotifications();
    loadUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    // Subscribe to real-time notification changes
    if (!supabase) {
      return () => clearInterval(interval);
    }

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        loadNotifications();
        loadUnreadCount();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, authLoading]);

  const loadNotifications = async () => {
    try {
      const { data } = await getUserNotifications();
      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { count } = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await markNotificationAsRead(notificationId);
      if (!error) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read_by: [...notification.read_by, 'current-user'] }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
    loadUnreadCount();
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refreshNotifications
  };
};