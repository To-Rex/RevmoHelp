import React, { useState, useEffect } from 'react';
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
  Mail
} from 'lucide-react';
import { 
  getAllNotifications, 
  createNotification, 
  deleteNotification 
} from '../../lib/notifications';
import { getUserProfiles } from '../../lib/adminUsers';
import { getPosts } from '../../lib/posts';
import type { Notification, CreateNotificationData } from '../../lib/notifications';
import type { User as UserType } from '../../types';
import type { Post } from '../../types';

const NotificationsManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTarget, setSelectedTarget] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      const [notificationsResult, usersResult, postsResult] = await Promise.all([
        getAllNotifications(),
        getUserProfiles(),
        getPosts('uz', { published: true })
      ]);

      if (notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      if (usersResult.data) {
        setUsers(usersResult.data);
      }

      if (postsResult.data) {
        setPosts(postsResult.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ma\'lumotlarni yuklashda xatolik' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      setMessage({ type: 'error', text: 'Sarlavha kiritilishi shart' });
      return false;
    }
    if (!formData.message.trim()) {
      setMessage({ type: 'error', text: 'Xabar matni kiritilishi shart' });
      return false;
    }
    if (formData.target_type === 'individual' && !formData.target_user_id) {
      setMessage({ type: 'error', text: 'Shaxsiy xabar uchun foydalanuvchi tanlanishi shart' });
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
        setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'Bildirishnoma muvaffaqiyatli yuborildi!' });
        await loadData();
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (notificationId: string, title: string) => {
    if (!confirm(`"${title}" bildirishnomani o'chirishni xohlaysizmi?`)) return;

    setDeleteLoading(notificationId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deleteNotification(notificationId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Bildirishnoma muvaffaqiyatli o\'chirildi!' });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
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
          <p className="theme-text-muted">Bildirishnomalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">Bildirishnomalar Boshqaruvi</h1>
          <p className="theme-text-secondary">Foydalanuvchilarga bildirishnoma yuborish va boshqarish</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Yangi Bildirishnoma</span>
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
          <div className="text-sm theme-text-secondary">Jami bildirishnomalar</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-purple-600">{notifications.filter(n => n.target_type === 'broadcast').length}</div>
          <div className="text-sm theme-text-secondary">Ommaviy</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-orange-600">{notifications.filter(n => n.target_type === 'individual').length}</div>
          <div className="text-sm theme-text-secondary">Shaxsiy</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{notifications.filter(n => n.active).length}</div>
          <div className="text-sm theme-text-secondary">Faol</div>
        </div>
      </div>

      {/* Filters */}
      <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
              <input
                type="text"
                placeholder="Bildirishnomalarni qidiring..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
            >
              <option value="all">Barcha turlar</option>
              <option value="info">Ma'lumot</option>
              <option value="success">Muvaffaqiyat</option>
              <option value="warning">Ogohlantirish</option>
              <option value="error">Xatolik</option>
            </select>
          </div>

          {/* Target Filter */}
          <div className="lg:w-48">
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
            >
              <option value="all">Barcha maqsadlar</option>
              <option value="broadcast">Ommaviy</option>
              <option value="individual">Shaxsiy</option>
            </select>
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
                    {notification.type}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTargetColor(notification.target_type)}`}>
                    {notification.target_type === 'broadcast' ? 'Ommaviy' : 'Shaxsiy'}
                  </span>
                  {notification.post && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                      Maqola bilan
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold theme-text mb-2">{notification.title}</h3>
                <p className="theme-text-secondary mb-4 line-clamp-2">{notification.message}</p>

                <div className="flex items-center justify-between text-sm theme-text-muted">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{notification.creator?.full_name || 'System'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(notification.sent_at)}</span>
                    </div>
                    {notification.target_type === 'individual' && (
                      <div className="flex items-center space-x-1">
                        <Target size={14} />
                        <span>
                          {users.find(u => u.id === notification.target_user_id)?.full_name || 'Foydalanuvchi'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{notification.read_by?.length || 0} o'qilgan</span>
                  </div>
                </div>

                {notification.post && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Bog'langan maqola: {notification.post.title}
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
            Bildirishnoma topilmadi
          </h3>
          <p className="theme-text-muted mb-6">
            Qidiruv so'zini o'zgartiring yoki yangi bildirishnoma yarating
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Birinchi bildirishnomani yaratish</span>
          </button>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">Yangi Bildirishnoma</h3>
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
                    Sarlavha *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="Bildirishnoma sarlavhasi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Turi *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  >
                    <option value="info">Ma'lumot</option>
                    <option value="success">Muvaffaqiyat</option>
                    <option value="warning">Ogohlantirish</option>
                    <option value="error">Xatolik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Maqsad *
                  </label>
                  <select
                    name="target_type"
                    value={formData.target_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  >
                    <option value="broadcast">Ommaviy (barcha foydalanuvchilar)</option>
                    <option value="individual">Shaxsiy (bitta foydalanuvchi)</option>
                  </select>
                </div>

                {formData.target_type === 'individual' && (
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Foydalanuvchi *
                    </label>
                    <select
                      name="target_user_id"
                      value={formData.target_user_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    >
                      <option value="">Foydalanuvchini tanlang</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Bog'langan maqola (ixtiyoriy)
                  </label>
                  <select
                    name="post_id"
                    value={formData.post_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  >
                    <option value="">Maqola tanlanmagan</option>
                    {posts.map((post) => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Amal qilish muddati (ixtiyoriy)
                  </label>
                  <input
                    type="datetime-local"
                    name="expires_at"
                    value={formData.expires_at}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Xabar matni *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                  placeholder="Bildirishnoma matnini kiriting..."
                />
                <div className="text-xs theme-text-muted mt-1">
                  {formData.message.length}/500 belgi
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Send size={18} />
                  <span>{isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}</span>
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