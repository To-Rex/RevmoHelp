import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, Eye, Calendar, User, FileText, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import LanguageAwareLink from './LanguageAwareLink';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const recentNotifications = notifications.slice(0, 5);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Hozir';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} soat oldin`;
    } else {
      return date.toLocaleDateString('uz-UZ', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read_by.includes(user.id)) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 theme-text-secondary hover:theme-accent transition-all duration-300 rounded-lg hover:theme-bg-tertiary"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 theme-bg rounded-xl theme-shadow-lg theme-border border py-2 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 theme-border border-b flex items-center justify-between">
              <h3 className="font-semibold theme-text">Bildirishnomalar</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium rounded-full">
                    {unreadCount} yangi
                  </span>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="theme-text-muted hover:theme-accent"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {recentNotifications.length > 0 ? (
                <div className="py-2">
                  {recentNotifications.map((notification) => {
                    const isUnread = !notification.read_by.includes(user.id);
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 hover:theme-bg-tertiary transition-colors duration-200 cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${
                          isUnread ? 'bg-opacity-100' : 'bg-opacity-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-lg flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${isUnread ? 'theme-text' : 'theme-text-secondary'} truncate`}>
                                {notification.title}
                              </h4>
                              {isUnread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                              )}
                            </div>
                            <p className="text-xs theme-text-secondary line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs theme-text-muted">
                                <Calendar size={12} />
                                <span>{formatDate(notification.sent_at)}</span>
                              </div>
                              {notification.post && (
                                <LanguageAwareLink
                                  to={`/posts/${notification.post.slug}`}
                                  className="flex items-center space-x-1 text-xs theme-accent hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileText size={12} />
                                  <span>Ko'rish</span>
                                </LanguageAwareLink>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell size={32} className="theme-text-muted mx-auto mb-2 opacity-50" />
                  <p className="theme-text-secondary text-sm">Bildirishnomalar yo'q</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 theme-border border-t">
              <LanguageAwareLink
                to="/profile?tab=notifications"
                className="block text-center text-sm theme-accent hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Barcha bildirishnomalarni ko'rish
              </LanguageAwareLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;