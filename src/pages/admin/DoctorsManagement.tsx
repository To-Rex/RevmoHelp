import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Plus } from 'lucide-react';
import DoctorsManagement from '../../components/admin/DoctorsManagement';
import DoctorProfilesManagement from '../../components/admin/DoctorProfilesManagement';

const DoctorsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const legacyDoctorsRef = useRef<any>(null);

  const tabs = [
    { id: 'profiles', label: 'Shifokor Profillari', icon: Stethoscope },
    { id: 'legacy', label: 'Eski Shifokorlar', icon: Stethoscope }
  ];

  const pageTitle = activeTab === 'profiles' ? 'Shifokor Profillari' : 'Eski Shifokorlar';
  const pageSubtitle = activeTab === 'profiles' ? 'Shifokor profillarini boshqarish' : 'Eski shifokorlarni boshqarish';

  return (
    <div className="space-y-4 lg:space-y-6 xl:space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold theme-text">{pageTitle}</h1>
            <p className="theme-text-secondary text-sm lg:text-base">{pageSubtitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center flex-1">
            <div className="inline-flex rounded-lg theme-bg-secondary p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 font-semibold transition-all duration-200 whitespace-nowrap rounded-md text-sm ${
                      activeTab === tab.id
                        ? 'theme-accent-bg text-white shadow-sm'
                        : 'theme-text-secondary hover:theme-accent'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            {activeTab === 'legacy' && (
              <button
                onClick={() => {
                  if (legacyDoctorsRef.current) {
                    legacyDoctorsRef.current.openCreateModal();
                  }
                }}
                className="flex items-center space-x-2 theme-accent-bg text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
              >
                <Plus size={18} />
                <span>Yangi Shifokor</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profiles' && <DoctorProfilesManagement />}
        {activeTab === 'legacy' && <DoctorsManagement ref={legacyDoctorsRef} />}
      </div>
    </div>
  );
};

export default DoctorsManagementPage;