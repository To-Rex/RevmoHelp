import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, Mail, Globe, Clock, Shield } from 'lucide-react';

interface UsersStatsProps {
  stats: {
    total: number;
    confirmed: number;
    unconfirmed: number;
    emailUsers: number;
    googleUsers: number;
    recentSignups: number;
  };
}

const UsersStats: React.FC<UsersStatsProps> = ({ stats }) => {
  const { t } = useTranslation();
  const statCards = [
    {
      name: t('totalUsersStats'),
      value: stats.total.toLocaleString(),
      icon: Users,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: t('confirmed'),
      value: stats.confirmed.toLocaleString(),
      icon: UserCheck,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: t('emailUsers'),
      value: stats.emailUsers.toLocaleString(),
      icon: Mail,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: t('googleUsers'),
      value: stats.googleUsers.toLocaleString(),
      icon: Globe,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: t('last7Days'),
      value: stats.recentSignups.toLocaleString(),
      icon: Clock,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: t('unconfirmed'),
      value: stats.unconfirmed.toLocaleString(),
      icon: Shield,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="theme-bg rounded-lg theme-shadow theme-border border p-4 hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon size={20} className={stat.textColor} />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold theme-text mb-1">
                {stat.value}
              </p>
              <p className="text-xs theme-text-secondary">
                {stat.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsersStats;