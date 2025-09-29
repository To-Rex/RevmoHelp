import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  User, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  X,
  Crown,
  Settings,
  Clock
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../lib/adminAuth';
import type { AdminUser } from '../../lib/adminAuth';

const AdminsManagement: React.FC = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    login: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'moderator' as 'admin' | 'moderator'
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await getAdmins();
      if (data) {
        setAdmins(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Adminlarni yuklashda xatolik' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const resetForm = () => {
    setFormData({
      login: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'moderator'
    });
    setShowPassword(false);
    setEditingAdmin(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setFormData({
      login: admin.login,
      password: '', // Don't show existing password
      full_name: admin.full_name,
      phone: admin.phone || '',
      role: admin.role
    });
    setEditingAdmin(admin);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
    setMessage({ type: '', text: '' });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.login.trim()) {
      setMessage({ type: 'error', text: 'Login kiritilishi shart' });
      return;
    }
    
    if (!formData.password.trim()) {
      setMessage({ type: 'error', text: 'Parol kiritilishi shart' });
      return;
    }
    
    if (!formData.full_name.trim()) {
      setMessage({ type: 'error', text: 'To\'liq ism kiritilishi shart' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await createAdmin(
        formData.login,
        formData.password,
        formData.full_name,
        formData.phone,
        formData.role
      );

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Admin muvaffaqiyatli yaratildi!' });
        await loadAdmins();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAdmin) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await updateAdmin(editingAdmin.id, {
        login: formData.login,
        password: formData.password || undefined, // Only update if provided
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Admin muvaffaqiyatli yangilandi!' });
        await loadAdmins();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (adminId === currentAdmin?.id) {
      setMessage({ type: 'error', text: 'O\'zingizni o\'chira olmaysiz!' });
      return;
    }

    if (!confirm(`${adminName} adminni o'chirishni xohlaysizmi?`)) return;

    setDeleteLoading(adminId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deleteAdmin(adminId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Admin muvaffaqiyatli o\'chirildi!' });
        await loadAdmins();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.login.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'moderator':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Crown : Settings;
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
          <p className="theme-text-muted">Adminlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold theme-text">Adminlar Boshqaruvi</h1>
          <p className="theme-text-secondary">Admin panel foydalanuvchilarini boshqarish</p>
        </div>
        {currentAdmin?.role === 'admin' && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Yangi Admin</span>
          </button>
        )}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold theme-text">{admins.length}</div>
          <div className="text-sm theme-text-secondary">Jami adminlar</div>
        </div>
        <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-red-600">{admins.filter(a => a.role === 'admin').length}</div>
          <div className="text-sm theme-text-secondary">Super adminlar</div>
        </div>
        <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-orange-600">{admins.filter(a => a.role === 'moderator').length}</div>
          <div className="text-sm theme-text-secondary">Moderatorlar</div>
        </div>
        <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{admins.filter(a => a.active).length}</div>
          <div className="text-sm theme-text-secondary">Faol adminlar</div>
        </div>
      </div>

      {/* Search */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
          <input
            type="text"
            placeholder="Adminlarni qidiring..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y theme-border">
            <thead className="theme-bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  Holat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  Yaratilgan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium theme-text-muted uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="theme-bg divide-y theme-border">
              {filteredAdmins.map((admin) => {
                const RoleIcon = getRoleIcon(admin.role);
                return (
                  <tr key={admin.id} className="hover:theme-bg-tertiary transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          admin.role === 'admin' 
                            ? 'bg-red-100 dark:bg-red-900' 
                            : 'bg-orange-100 dark:bg-orange-900'
                        }`}>
                          <RoleIcon size={18} className={
                            admin.role === 'admin' 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-orange-600 dark:text-orange-400'
                          } />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium theme-text">
                            {admin.full_name}
                          </div>
                          <div className="text-sm theme-text-muted">
                            {admin.id === currentAdmin?.id && (
                              <span className="text-blue-600 dark:text-blue-400 font-medium">(Siz)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm theme-text font-mono">@{admin.login}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(admin.role)}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text">
                      {admin.phone || 'Kiritilmagan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        admin.active
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {admin.active ? 'Faol' : 'Faol emas'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-muted">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDate(admin.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {currentAdmin?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => openEditModal(admin)}
                              className="theme-accent hover:text-blue-900 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-200"
                            >
                              <Edit size={16} />
                            </button>
                            {admin.id !== currentAdmin?.id && (
                              <button
                                onClick={() => handleDelete(admin.id, admin.full_name)}
                                disabled={deleteLoading === admin.id}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200 disabled:opacity-50"
                              >
                                {deleteLoading === admin.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredAdmins.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            Admin topilmadi
          </h3>
          <p className="theme-text-muted">
            Qidiruv so'zini o'zgartiring
          </p>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">Yangi Admin Qo'shish</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Login *</label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  placeholder="admin_login"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Parol *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 pr-10 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-muted hover:theme-accent"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">To'liq ism *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  placeholder="Admin ismi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Rol *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">Admin Tahrirlash</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Login</label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Yangi parol (bo'sh qoldiring agar o'zgartirmoqchi bo'lmasangiz)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="Yangi parol"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-muted hover:theme-accent"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">To'liq ism</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={editingAdmin?.id === currentAdmin?.id}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text disabled:opacity-50"
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                {editingAdmin?.id === currentAdmin?.id && (
                  <p className="text-xs theme-text-muted mt-1">O'z rolingizni o'zgartira olmaysiz</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Notice */}
      {currentAdmin?.role !== 'admin' && (
        <div className="theme-bg rounded-lg theme-shadow theme-border border p-6">
          <div className="flex items-center space-x-3">
            <Shield size={20} className="text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold theme-text">Cheklangan Ruxsat</h3>
              <p className="theme-text-secondary text-sm">
                Siz moderator sifatida faqat adminlar ro'yxatini ko'rishingiz mumkin. 
                Yangi admin qo'shish yoki tahrirlash uchun admin huquqi kerak.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsManagement;