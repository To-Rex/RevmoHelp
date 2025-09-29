import React from 'react';
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
  const statCards = [
    {
      name: 'Jami Foydalanuvchilar',
      value: stats.total.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Tasdiqlangan',
      value: stats.confirmed.toLocaleString(),
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      name: 'Email Foydalanuvchilar',
      value: stats.emailUsers.toLocaleString(),
      icon: Mail,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      name: 'Google Foydalanuvchilar',
      value: stats.googleUsers.toLocaleString(),
      icon: Globe,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      name: 'Oxirgi 7 kun',
      value: stats.recentSignups.toLocaleString(),
      icon: Clock,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      textColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      name: 'Tasdiqlanmagan',
      value: stats.unconfirmed.toLocaleString(),
      icon: Shield,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
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