import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Plus,
  Send,
  Users,
  User,
  FileText,
  Search,
  Filter,
  Calendar,
  Eye,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Clock,
  Target,
  MessageSquare,
  Globe,
  Mail,
  ChevronDown,
  Phone
} from 'lucide-react';
import { 
  getAllNotifications, 
  createNotification, 
  deleteNotification 
} from '../../lib/notifications';
import { getUserProfiles, getAuthUsers } from '../../lib/adminUsers';
import { getPosts } from '../../lib/posts';
import type { Notification, CreateNotificationData } from '../../lib/notifications';
import type { User as UserType } from '../../types';
import type { Post } from '../../types';

interface UserWithProvider extends UserType {
  provider?: string;
}

const NotificationsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserWithProvider[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTarget, setSelectedTarget] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProvider | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSortBy, setUserSortBy] = useState('all');

  const processedUsers = (() => {
    let usersList = users;

    // Apply filters and sorting
    if (userSortBy === 'phone') {
      usersList = users.filter(user => user.provider === 'phone').sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (userSortBy === 'email') {
      usersList = users.filter(user => user.provider === 'email').sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (userSortBy === 'google') {
      usersList = users.filter(user => user.provider === 'google').sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (userSortBy === 'name') {
      usersList = [...users].sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (userSortBy === 'created_at') {
      usersList = [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    // For 'all', no filtering or sorting

    return usersList;
  })();

  const filteredUsers = processedUsers.filter(user =>
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
    (user.phone && user.phone.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
    (user.provider && user.provider.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  const [formData, setFormData] = useState<CreateNotificationData>({
    title: '',
    message: '',
    type: 'info',
    target_type: 'broadcast',
    target_user_id: '',
    post_id: '',
    expires_at: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notificationsResult, profilesResult, authResult, postsResult] = await Promise.all([
        getAllNotifications(),
        getUserProfiles(),
        getAuthUsers(),
        getPosts('uz', { published: true })
      ]);

      if (notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      if (authResult.data) {
        const authUsers = authResult.data;
        const profiles = profilesResult.data || [];
        const usersWithProvider = authUsers.map(authUser => {
          const profile = profiles.find(p => p.id === authUser.id);
          let provider = authUser.app_metadata.provider;
          if (!provider) {
            if (authUser.phone) provider = 'phone';
            else if (authUser.email) provider = 'email';
            else provider = 'unknown';
          }
          return {
            id: authUser.id,
            email: authUser.email,
            full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Unknown',
            phone: profile?.phone || authUser.phone || authUser.user_metadata?.phone,
            role: profile?.role || 'patient',
            avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
            created_at: profile?.created_at || authUser.created_at,
            updated_at: profile?.updated_at || authUser.updated_at,
            provider: provider
          } as UserWithProvider;
        });
        setUsers(usersWithProvider);
      }

      if (postsResult.data) {
        setPosts(postsResult.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('notificationsDataLoadingError') });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'target_type' && value !== 'individual') {
        newData.target_user_id = '';
      }
      return newData;
    });
    if (name === 'target_type' && value !== 'individual') {
      setSelectedUser(null);
    }
    if (message.text) setMessage({ type: '', text: '' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      target_type: 'broadcast',
      target_user_id: '',
      post_id: '',
      expires_at: ''
    });
    setSelectedUser(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    resetForm();
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: t('notificationsTitleRequired') });
      return false;
    }
    if (!formData.message.trim()) {
      setMessage({ type: 'error', text: t('notificationsMessageRequired') });
      return false;
    }
    if (formData.target_type === 'individual' && !formData.target_user_id) {
      setMessage({ type: 'error', text: t('notificationsUserRequired') });
      return false;
    }
    return true;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await createNotification({
        ...formData,
        target_user_id: formData.target_type === 'individual' ? formData.target_user_id : undefined,
        post_id: formData.post_id || undefined,
        expires_at: formData.expires_at || undefined
      });

      if (error) {
        setMessage({ type: 'error', text: t('notificationsGeneralError') + ': ' + error.message });
      } else {
        setMessage({ type: 'success', text: t('notificationsSent') });
        await loadData();
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('notificationsGeneralError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (notificationId: string, title: string) => {
    if (!confirm(`"${title}" ${t('notificationsConfirmDelete')}`)) return;

    setDeleteLoading(notificationId);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await deleteNotification(notificationId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('notificationsDeleted') });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('notificationsGeneralError') });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesTarget = selectedTarget === 'all' || notification.target_type === selectedTarget;
    return matchesSearch && matchesType && matchesTarget;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'error': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
  };

  const getTargetColor = (targetType: string) => {
    return targetType === 'broadcast' 
      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">{t('notificationsLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">{t('notificationsManagementTitle')}</h1>
          <p className="theme-text-secondary">{t('notificationsManagementDesc')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>{t('notificationsNewNotification')}</span>
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          )}
          <span className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold theme-text">{notifications.length}</div>
          <div className="text-sm theme-text-secondary">{t('notificationsTotal')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-purple-600">{notifications.filter(n => n.target_type === 'broadcast').length}</div>
          <div className="text-sm theme-text-secondary">{t('notificationsBroadcast')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-orange-600">{notifications.filter(n => n.target_type === 'individual').length}</div>
          <div className="text-sm theme-text-secondary">{t('notificationsIndividual')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{notifications.filter(n => n.active).length}</div>
          <div className="text-sm theme-text-secondary">{t('notificationsActive')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={18} />
              <input
                type="text"
                placeholder={t('notificationsSearch')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
            >
              <option value="all">{t('notificationsAllTypes')}</option>
              <option value="info">{t('notificationsInfoType')}</option>
              <option value="success">{t('notificationsSuccessType')}</option>
              <option value="warning">{t('notificationsWarningType')}</option>
              <option value="error">{t('notificationsErrorType')}</option>
            </select>
          </div>

          {/* Target Filter */}
          <div className="lg:w-48 relative">
            <button
              onClick={(e) => { e.stopPropagation(); setTargetDropdownOpen(!targetDropdownOpen); }}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm text-left flex items-center justify-between"
            >
              <span>{selectedTarget === 'all' ? t('notificationsAllTargets') :
                    selectedTarget === 'broadcast' ? t('notificationsBroadcastTarget') :
                    t('notificationsIndividualTarget')}</span>
              <ChevronDown className={`theme-text-muted transition-transform ${targetDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            {targetDropdownOpen && (
              <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div
                  onClick={() => { setSelectedTarget('all'); setTargetDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('notificationsAllTargets')}
                </div>
                <div
                  onClick={() => { setSelectedTarget('broadcast'); setTargetDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('notificationsBroadcastTarget')}
                </div>
                <div
                  onClick={() => { setSelectedTarget('individual'); setTargetDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('notificationsIndividualTarget')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className="theme-bg rounded-xl theme-shadow hover:theme-shadow-lg transition-all duration-300 theme-border border p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                    {notification.type === 'info' ? t('notificationsInfoType') :
                     notification.type === 'success' ? t('notificationsSuccessType') :
                     notification.type === 'warning' ? t('notificationsWarningType') :
                     t('notificationsErrorType')}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTargetColor(notification.target_type)}`}>
                    {notification.target_type === 'broadcast' ? t('notificationsBroadcastTarget') : t('notificationsIndividualTarget')}
                  </span>
                  {notification.post && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                      {t('notificationsWithArticle')}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold theme-text mb-2">{notification.title}</h3>
                <p className="theme-text-secondary mb-4 line-clamp-2">{notification.message}</p>

                <div className="flex items-center justify-between text-sm theme-text-muted">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{notification.creator?.full_name || t('notificationsSystem')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(notification.sent_at)}</span>
                    </div>
                    {notification.target_type === 'individual' && (
                      <div className="flex items-center space-x-1">
                        <Target size={14} />
                        <span>
                          {users.find(u => u.id === notification.target_user_id)?.full_name || t('notificationsUser')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{notification.read_by?.length || 0} {t('notificationsReadCount')}</span>
                  </div>
                </div>

                {notification.post && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {t('notificationsLinkedArticle')}: {notification.post.title}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleDelete(notification.id, notification.title)}
                  disabled={deleteLoading === notification.id}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200 disabled:opacity-50"
                >
                  {deleteLoading === notification.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredNotifications.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <Bell size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            {t('notificationsNotFound')}
          </h3>
          <p className="theme-text-muted mb-6">
            {t('notificationsChangeSearchOrCreate')}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>{t('notificationsCreateFirst')}</span>
          </button>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">{t('notificationsNewModal')}</h3>
              <button
                onClick={closeModal}
                className="theme-text-secondary hover:theme-text p-1 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              {message.text && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm ${message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {message.text}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    {t('notificationsTitleLabel')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text"
                    placeholder={t('notificationsTitlePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    {t('notificationsTypeLabel')}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text appearance-none"
                  >
                    <option value="info">{t('notificationsInfoType')}</option>
                    <option value="success">{t('notificationsSuccessType')}</option>
                    <option value="warning">{t('notificationsWarningType')}</option>
                    <option value="error">{t('notificationsErrorType')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    {t('notificationsTargetLabel')}
                  </label>
                  <select
                    name="target_type"
                    value={formData.target_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text appearance-none"
                  >
                    <option value="broadcast">{t('notificationsBroadcastOption')}</option>
                    <option value="individual">{t('notificationsIndividualOption')}</option>
                  </select>
                </div>

                {formData.target_type === 'individual' && (
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      {t('notificationsUserLabel')}
                    </label>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setUserDropdownOpen(!userDropdownOpen); if (!userDropdownOpen) setUserSearchTerm(''); }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text text-left flex items-center justify-between"
                      >
                        <span>{selectedUser ? selectedUser.full_name : t('notificationsSelectUser')}</span>
                        <ChevronDown className={`theme-text-muted transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                      </button>
                      {userDropdownOpen && (
                        <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          <div className="p-2 border-b border-gray-200 space-y-2">
                            <div className="text-xs text-gray-500">{filteredUsers.length} users</div>
                            <div className="flex space-x-2">
                              <div className="relative flex-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={14} />
                                <input
                                  type="text"
                                  placeholder="Search users"
                                  value={userSearchTerm}
                                  onChange={(e) => setUserSearchTerm(e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <select
                                value={userSortBy}
                                onChange={(e) => setUserSortBy(e.target.value)}
                                className="flex-1 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="all">All</option>
                                <option value="name">Name</option>
                                <option value="phone">Phone</option>
                                <option value="email">Email</option>
                                <option value="google">Google</option>
                                <option value="created_at">Date</option>
                              </select>
                            </div>
                          </div>
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user);
                                setFormData(prev => ({ ...prev, target_user_id: user.id }));
                                setUserDropdownOpen(false);
                              }}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer theme-text flex items-center space-x-3"
                            >
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="theme-accent font-medium text-xs">
                                    {user.full_name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {user.full_name}
                                </div>
                                {user.provider === 'google' ? (
                                  <div className="flex items-center text-sm text-gray-600 truncate">
                                    <Globe size={14} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                  </div>
                                ) : user.phone && (!user.email || user.email.includes('@example.invalid')) ? (
                                  <div className="flex items-center text-sm text-gray-500 truncate">
                                    <Phone size={14} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{user.phone}</span>
                                  </div>
                                ) : user.email ? (
                                  <div className="flex items-center text-sm text-gray-600 truncate">
                                    <Mail size={14} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    {t('notificationsLinkedArticleLabel')}
                  </label>
                  <select
                    name="post_id"
                    value={formData.post_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text appearance-none"
                  >
                    <option value="">{t('notificationsNoArticleSelected')}</option>
                    {posts.map((post) => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    {t('notificationsExpirationLabel')}
                  </label>
                  <input
                    type="datetime-local"
                    name="expires_at"
                    value={formData.expires_at}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  {t('notificationsMessageLabel')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text resize-none"
                  placeholder={t('notificationsMessagePlaceholder')}
                />
                <div className="text-xs theme-text-muted mt-1">
                  {formData.message.length}/500
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Send size={18} />
                  <span>{isSubmitting ? t('notificationsSending') : t('notificationsSend')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;