import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Users, Shield, Mail, Globe } from 'lucide-react';

interface UsersFiltersProps {
  searchTerm: string;
  selectedRole: string;
  selectedProvider: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onProviderChange: (value: string) => void;
  userCounts: {
    total: number;
    byRole: Record<string, number>;
    byProvider: Record<string, number>;
  };
}

const UsersFilters: React.FC<UsersFiltersProps> = ({
  searchTerm,
  selectedRole,
  selectedProvider,
  onSearchChange,
  onRoleChange,
  onProviderChange,
  userCounts
}) => {
  const { t } = useTranslation();
  const roles = [
    { value: 'all', label: t('allRoles'), count: userCounts.total },
    { value: 'admin', label: t('adminRole'), count: userCounts.byRole.admin || 0 },
    { value: 'moderator', label: t('moderatorRole'), count: userCounts.byRole.moderator || 0 },
    { value: 'doctor', label: t('doctorRole'), count: userCounts.byRole.doctor || 0 },
    { value: 'patient', label: t('patientRole'), count: userCounts.byRole.patient || 0 },
  ];

  const providers = [
    { value: 'all', label: t('allProviders'), count: userCounts.total },
    { value: 'email', label: t('emailProvider'), count: userCounts.byProvider.email || 0 },
    { value: 'google', label: t('googleProvider'), count: userCounts.byProvider.google || 0 },
  ];

  return (
    <div className="theme-bg rounded-lg theme-shadow theme-border border p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
            <input
              type="text"
              placeholder={t('searchUsers')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 theme-text"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="lg:w-56">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none theme-text"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} ({role.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Provider Filter */}
        <div className="lg:w-48">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
            <select
              value={selectedProvider}
              onChange={(e) => onProviderChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none theme-text"
            >
              {providers.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label} ({provider.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersFilters;