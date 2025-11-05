import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Bell,
  Mail,
  Phone,
  MapPin,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const Settings: React.FC = () => {
  const { admin } = useAdminAuth();
  const [message, setMessage] = useState({ type: '', text: '' });


  const openSitePreview = () => {
    window.open('/', '_blank');
  };

  const settingsSections = [
    {
      title: 'Tizim Sozlamalari',
      description: 'Umumiy tizim konfiguratsiyasi',
      icon: SettingsIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Xavfsizlik',
      description: 'Autentifikatsiya va ruxsatlar',
      icon: Shield,
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Ma\'lumotlar Bazasi',
      description: 'Database sozlamalari',
      icon: Database,
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">Tizim Sozlamalari</h1>
          <p className="theme-text-secondary">Platformaning umumiy sozlamalarini boshqarish</p>
        </div>
        <button
          onClick={openSitePreview}
          className="flex items-center space-x-2 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
        >
          <Eye size={18} />
          <span>Saytni ko'rish</span>
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

      {/* Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={index}
              className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold theme-text mb-2">{section.title}</h3>
              <p className="theme-text-secondary text-sm">{section.description}</p>
            </div>
          );
        })}
      </div>



      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Info */}
        <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
          <h3 className="text-lg font-semibold theme-text mb-4">Platforma Ma'lumotlari</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Versiya</span>
              <span className="font-semibold theme-text">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Build</span>
              <span className="font-semibold theme-text">2024.01.20</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Environment</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                Production
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Database</span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                Supabase
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
          <h3 className="text-lg font-semibold theme-text mb-4">Aloqa Ma'lumotlari</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Mail size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium theme-text">Email</p>
                <p className="text-sm theme-text-secondary">revmohelp@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <Phone size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium theme-text">Telefon</p>
                <p className="text-sm theme-text-secondary">+998 (93) 200 10 22</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium theme-text">Manzil</p>
                <p className="text-sm theme-text-secondary">Toshkent, O'zbekiston</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">Qo'shimcha Sozlamalar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold theme-text">Sayt Sozlamalari</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Yangi foydalanuvchi ro'yxati</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Email bildirishnomalar</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Avtomatik zaxira</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold theme-text">Xavfsizlik</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">2FA majburiy</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Session timeout</span>
                <select className="px-2 py-1 theme-border border rounded text-sm theme-bg theme-text">
                  <option>24 soat</option>
                  <option>7 kun</option>
                  <option>30 kun</option>
                </select>
              </label>
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Login loglar</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;