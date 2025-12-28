import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Shield,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';
import { getAuthUsers, getUserProfiles, deleteAuthUser, updateUserMetadata } from '../../lib/adminUsers';
import type { AuthUser } from '../../lib/adminUsers';
import type { User } from '../../types';

interface UsersListProps {
  searchTerm: string;
  selectedRole: string;
  selectedProvider: string;
}

const UsersList: React.FC<UsersListProps> = ({
  searchTerm,
  selectedRole,
  selectedProvider
}) => {
  const { t } = useTranslation();
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [authResult, profilesResult] = await Promise.all([
        getAuthUsers(),
        getUserProfiles()
      ]);

      if (authResult.data) {
        setAuthUsers(authResult.data);
      }

      if (profilesResult.data) {
        setProfiles(profilesResult.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: t('errorLoadingUsers') });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName} ${t('confirmDeleteUser')}`)) return;

    setDeleteLoading(userId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deleteAuthUser(userId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('userDeleted') });
        await loadUsers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('error') });
    } finally {
      setDeleteLoading(null);
    }
  };

  // Combine auth users with profiles
  const combinedUsers = authUsers.map(authUser => {
    const profile = profiles.find(p => p.id === authUser.id);
    return {
      ...authUser,
      profile,
      full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: profile?.role || authUser.user_metadata?.role || 'patient',
      phone: profile?.phone || authUser.user_metadata?.phone || authUser.phone,
      avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
    };
  });

  // Filter users
  const filteredUsers = combinedUsers.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesProvider = selectedProvider === 'all' || 
                           user.app_metadata?.provider === selectedProvider;
    return matchesSearch && matchesRole && matchesProvider;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'moderator':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'doctor':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'patient':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3 h-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        );
      case 'email':
        return <Mail size={16} className="text-blue-600" />;
      default:
        return <Shield size={16} className="text-gray-600" />;
    }
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
          <p className="theme-text-muted">{t('usersLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Users Table */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y theme-border">
            <thead className="theme-bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('userTable')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('provider')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('lastLogin')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('statusTable')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium theme-text-muted uppercase tracking-wider">
                  {t('actionsTable')}
                </th>
              </tr>
            </thead>
            <tbody className="theme-bg divide-y theme-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:theme-bg-tertiary transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="theme-accent font-medium text-sm">
                            {user.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium theme-text">
                          {user.full_name}
                        </div>
                        <div className="text-sm theme-text-muted">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getProviderIcon(user.app_metadata?.provider || 'email')}
                      <span className="text-sm theme-text capitalize">
                        {user.app_metadata?.provider || 'email'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm theme-text">
                    {user.phone || t('notEntered')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-muted">
                    {user.last_sign_in_at ? (
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDate(user.last_sign_in_at)}</span>
                      </div>
                    ) : (
                      t('never')
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.email_confirmed_at
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {user.email_confirmed_at ? t('confirmedStatus') : t('unconfirmedStatus')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="theme-accent hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 rounded">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                        disabled={deleteLoading === user.id}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded disabled:opacity-50"
                      >
                        {deleteLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            {t('userNotFound')}
          </h3>
          <p className="theme-text-muted">
            {t('changeSearchOrFilters')}
          </p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm theme-text-secondary">
          {filteredUsers.length} {t('usersShown')}
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 theme-border border rounded-lg hover:theme-bg-tertiary transition-colors duration-200 theme-text-secondary">
            {t('previous')}
          </button>
          <button className="px-4 py-2 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            1
          </button>
          <button className="px-4 py-2 theme-border border rounded-lg hover:theme-bg-tertiary transition-colors duration-200 theme-text-secondary">
            {t('next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersList;