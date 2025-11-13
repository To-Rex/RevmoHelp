import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { getAuthUsers } from '../../lib/adminUsers';
import { getConsultationRequests } from '../../lib/consultationRequests';
import type { AuthUser } from '../../lib/adminUsers';
import type { ConsultationRequest } from '../../lib/consultationRequests';
import UsersFilters from '../../components/admin/UsersFilters';
import UsersList from '../../components/admin/UsersList';
import UsersStats from '../../components/admin/UsersStats';
import ConsultationRequestsList from '../../components/admin/ConsultationRequestsList';
import ConsultationRequestsStats from '../../components/admin/ConsultationRequestsStats';

const UsersManagement: React.FC = () => {
  const { admin } = useAdminAuth();
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [consultationSearchTerm, setConsultationSearchTerm] = useState('');
  const [selectedConsultationStatus, setSelectedConsultationStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [authResult, consultationResult] = await Promise.all([
        getAuthUsers(),
        getConsultationRequests()
      ]);

      if (authResult.data) {
        setAuthUsers(authResult.data);
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold theme-text">Foydalanuvchilar Boshqaruvi</h1>
          <p className="theme-text-secondary">Supabase Auth foydalanuvchilarini boshqarish</p>
        </div>
      </div>

      {/* Stats */}
      <UsersStats stats={userStats} />

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
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text"
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none theme-text"
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
    </div>
  );
};

export default UsersManagement;