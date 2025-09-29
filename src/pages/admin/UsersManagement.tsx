import React, { useState, useEffect } from 'react';
import { Plus, Shield, MessageSquare, Search, Filter } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { getAdmins, createAdmin } from '../../lib/adminAuth';
import { getAuthUsers } from '../../lib/adminUsers';
import { getConsultationRequests } from '../../lib/consultationRequests';
import type { AdminUser } from '../../lib/adminAuth';
import type { AuthUser } from '../../lib/adminUsers';
import type { ConsultationRequest } from '../../lib/consultationRequests';
import UsersFilters from '../../components/admin/UsersFilters';
import UsersList from '../../components/admin/UsersList';
import UsersStats from '../../components/admin/UsersStats';
import ConsultationRequestsList from '../../components/admin/ConsultationRequestsList';
import ConsultationRequestsStats from '../../components/admin/ConsultationRequestsStats';
import CreateAdminModal from '../../components/admin/CreateAdminModal';

const UsersManagement: React.FC = () => {
  const { admin } = useAdminAuth();
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [consultationSearchTerm, setConsultationSearchTerm] = useState('');
  const [selectedConsultationStatus, setSelectedConsultationStatus] = useState('all');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [authResult, adminsResult, consultationResult] = await Promise.all([
        getAuthUsers(),
        getAdmins(),
        getConsultationRequests()
      ]);

      if (authResult.data) {
        setAuthUsers(authResult.data);
      }

      if (adminsResult.data) {
        setAdmins(adminsResult.data);
      }

      if (consultationResult.data) {
        setConsultationRequests(consultationResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate user statistics
  const userStats = {
    total: authUsers.length,
    confirmed: authUsers.filter(u => u.email_confirmed_at).length,
    unconfirmed: authUsers.filter(u => !u.email_confirmed_at).length,
    emailUsers: authUsers.filter(u => u.app_metadata?.provider === 'email').length,
    googleUsers: authUsers.filter(u => u.app_metadata?.provider === 'google').length,
    recentSignups: authUsers.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.created_at) > weekAgo;
    }).length,
  };

  // Calculate consultation requests statistics
  const consultationStats = {
    total: consultationRequests.length,
    pending: consultationRequests.filter(r => r.status === 'pending').length,
    contacted: consultationRequests.filter(r => r.status === 'contacted').length,
    completed: consultationRequests.filter(r => r.status === 'completed').length,
    cancelled: consultationRequests.filter(r => r.status === 'cancelled').length,
    recent: consultationRequests.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.created_at) > weekAgo;
    }).length,
  };

  // Calculate user counts for filters
  const userCounts = {
    total: authUsers.length,
    byRole: authUsers.reduce((acc, user) => {
      const role = user.user_metadata?.role || 'patient';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byProvider: authUsers.reduce((acc, user) => {
      const provider = user.app_metadata?.provider || 'email';
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const consultationStatusCounts = {
    total: consultationRequests.length,
    pending: consultationRequests.filter(r => r.status === 'pending').length,
    contacted: consultationRequests.filter(r => r.status === 'contacted').length,
    completed: consultationRequests.filter(r => r.status === 'completed').length,
    cancelled: consultationRequests.filter(r => r.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Foydalanuvchilar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 xl:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold theme-text">Foydalanuvchilar Boshqaruvi</h1>
          <p className="theme-text-secondary text-sm lg:text-base">Supabase Auth foydalanuvchilarini boshqarish</p>
        </div>
        {admin?.role === 'admin' && (
          <button
            onClick={() => setShowAddAdminModal(true)}
            className="flex items-center space-x-2 theme-accent-bg text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            <Plus size={18} />
            <span>Admin Qo'shish</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <UsersStats stats={userStats} />

      {/* Admin Panel Users */}
      {admins.length > 0 && (
        <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold theme-text flex items-center space-x-2">
              <Shield size={18} className="text-blue-600" />
              <span>Admin Panel Foydalanuvchilari</span>
            </h3>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
              {admins.length} ta admin
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {admins.map((adminUser) => (
              <div key={adminUser.id} className="flex items-center justify-between p-3 theme-bg-tertiary rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Shield size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold theme-text truncate max-w-24">{adminUser.full_name}</p>
                    <p className="text-xs theme-text-muted truncate max-w-24">@{adminUser.login}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  adminUser.role === 'admin'
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                }`}>
                  {adminUser.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <UsersFilters
        searchTerm={searchTerm}
        selectedRole={selectedRole}
        selectedProvider={selectedProvider}
        onSearchChange={setSearchTerm}
        onRoleChange={setSelectedRole}
        onProviderChange={setSelectedProvider}
        userCounts={userCounts}
      />

      {/* Users List */}
      <UsersList
        searchTerm={searchTerm}
        selectedRole={selectedRole}
        selectedProvider={selectedProvider}
      />

      {/* Consultation Requests Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold theme-text flex items-center space-x-2">
              <MessageSquare size={20} className="text-primary-600" />
              <span>Bepul Maslahat So'rovlari</span>
            </h2>
            <p className="theme-text-secondary text-sm">Saytdan kelgan maslahat so'rovlari</p>
          </div>
        </div>

        {/* Consultation Stats */}
        <ConsultationRequestsStats stats={consultationStats} />

        {/* Consultation Filters */}
        <div className="theme-bg rounded-lg theme-shadow theme-border border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Maslahat so'rovlarini qidiring..."
                  value={consultationSearchTerm}
                  onChange={(e) => setConsultationSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 theme-bg theme-text"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                <select
                  value={selectedConsultationStatus}
                  onChange={(e) => setSelectedConsultationStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 appearance-none theme-bg theme-text"
                >
                  <option value="all">Barcha holatlar ({consultationStatusCounts.total})</option>
                  <option value="pending">Kutilmoqda ({consultationStatusCounts.pending})</option>
                  <option value="contacted">Bog'lanildi ({consultationStatusCounts.contacted})</option>
                  <option value="completed">Yakunlandi ({consultationStatusCounts.completed})</option>
                  <option value="cancelled">Bekor qilindi ({consultationStatusCounts.cancelled})</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Requests List */}
        <ConsultationRequestsList
          searchTerm={consultationSearchTerm}
          selectedStatus={selectedConsultationStatus}
        />
      </div>
      {/* Create Admin Modal */}
      {showAddAdminModal && (
        <CreateAdminModal
          onClose={() => setShowAddAdminModal(false)}
          onSuccess={() => {
            setShowAddAdminModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default UsersManagement;