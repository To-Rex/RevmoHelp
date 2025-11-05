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
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      name: 'Kutilmoqda',
      value: stats.pending.toLocaleString(),
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      name: 'Bog\'lanildi',
      value: stats.contacted.toLocaleString(),
      icon: Phone,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Yakunlandi',
      value: stats.completed.toLocaleString(),
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Bekor qilindi',
      value: stats.cancelled.toLocaleString(),
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      name: 'Oxirgi 7 kun',
      value: stats.recent.toLocaleString(),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
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