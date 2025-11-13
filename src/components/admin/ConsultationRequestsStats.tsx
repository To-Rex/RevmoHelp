import React from 'react';
import { MessageSquare, Clock, Phone, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface ConsultationRequestsStatsProps {
  stats: {
    total: number;
    pending: number;
    contacted: number;
    completed: number;
    cancelled: number;
    recent: number;
  };
}

const ConsultationRequestsStats: React.FC<ConsultationRequestsStatsProps> = ({ stats }) => {
  const statCards = [
    {
      name: 'Jami So\'rovlar',
      value: stats.total.toLocaleString(),
      icon: MessageSquare,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: 'Kutilmoqda',
      value: stats.pending.toLocaleString(),
      icon: Clock,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: 'Bog\'lanildi',
      value: stats.contacted.toLocaleString(),
      icon: Phone,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: 'Yakunlandi',
      value: stats.completed.toLocaleString(),
      icon: CheckCircle,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: 'Bekor qilindi',
      value: stats.cancelled.toLocaleString(),
      icon: XCircle,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      name: 'Oxirgi 7 kun',
      value: stats.recent.toLocaleString(),
      icon: TrendingUp,
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

export default ConsultationRequestsStats;