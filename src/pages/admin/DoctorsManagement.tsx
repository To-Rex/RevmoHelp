import React, { useState, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
import DoctorsManagement from '../../components/admin/DoctorsManagement';
import DoctorProfilesManagement from '../../components/admin/DoctorProfilesManagement';

const DoctorsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profiles');

  const tabs = [
    { id: 'profiles', label: 'Shifokor Profillari', icon: Stethoscope },
    { id: 'legacy', label: 'Eski Shifokorlar', icon: Stethoscope }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold theme-text">Shifokorlar Boshqaruvi</h1>
        <p className="theme-text-secondary">Shifokor profillarini tasdiqlash va boshqarish</p>
      </div>

      {/* Tabs */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors duration-200 whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'theme-accent border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'theme-text-secondary hover:theme-accent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profiles' && <DoctorProfilesManagement />}
        {activeTab === 'legacy' && <DoctorsManagement />}
      </div>
    </div>
  );
};

export default DoctorsManagementPage;