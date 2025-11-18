import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Stethoscope,
  Award,
  Calendar,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  User,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { getAllDoctorProfiles, verifyDoctorProfile } from '../../lib/doctorProfiles';
import type { DoctorProfile } from '../../lib/doctorProfiles';

const DoctorProfilesManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const { data } = await getAllDoctorProfiles();
      if (data) {
        setProfiles(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Profillarni yuklashda xatolik' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (profileId: string, verified: boolean, doctorName: string) => {
    const action = verified ? 'tasdiqlash' : 'rad etish';
    if (!confirm(`${doctorName} shifokorni ${action}ni xohlaysizmi?`)) return;

    setVerifyLoading(profileId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await verifyDoctorProfile(profileId, verified);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: `Shifokor ${verified ? 'tasdiqlandi' : 'rad etildi'}!` 
        });
        await loadProfiles();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setVerifyLoading(null);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'verified' && profile.verified) ||
                         (selectedStatus === 'pending' && !profile.verified) ||
                         (selectedStatus === 'active' && profile.active);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Shifokor profillari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold theme-text">{profiles.length}</div>
          <div className="text-sm theme-text-secondary">Jami shifokorlar</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{profiles.filter(p => p.verified).length}</div>
          <div className="text-sm theme-text-secondary">Tasdiqlangan</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-yellow-600">{profiles.filter(p => !p.verified).length}</div>
          <div className="text-sm theme-text-secondary">Kutilmoqda</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-blue-600">{profiles.filter(p => p.active).length}</div>
          <div className="text-sm theme-text-secondary">Faol</div>
        </div>
      </div>

      {/* Filters */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={18} />
              <input
                type="text"
                placeholder="Shifokorlarni qidiring..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48 relative">
            <button
              onClick={(e) => { e.stopPropagation(); setStatusDropdownOpen(!statusDropdownOpen); }}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm text-left flex items-center justify-between"
            >
              <span>{selectedStatus === 'all' ? 'Barcha holatlar' :
                     selectedStatus === 'pending' ? 'Tasdiq kutilmoqda' :
                     selectedStatus === 'verified' ? 'Tasdiqlangan' :
                     'Faol'}</span>
              <ChevronDown className={`theme-text-muted transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            {statusDropdownOpen && (
              <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div
                  onClick={() => { setSelectedStatus('all'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  Barcha holatlar
                </div>
                <div
                  onClick={() => { setSelectedStatus('pending'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  Tasdiq kutilmoqda
                </div>
                <div
                  onClick={() => { setSelectedStatus('verified'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  Tasdiqlangan
                </div>
                <div
                  onClick={() => { setSelectedStatus('active'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  Faol
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            className="theme-bg rounded-2xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-300 theme-border border overflow-hidden"
          >
            {/* Profile Header */}
            <div className="relative p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
                      <Stethoscope size={24} className="text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold theme-text">{profile.full_name}</h3>
                    <p className="theme-accent font-medium">{profile.specialization}</p>
                    <p className="theme-text-secondary text-sm">{profile.experience_years} yil tajriba</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    profile.verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.verified ? 'Tasdiqlangan' : 'Kutilmoqda'}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    profile.active
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.active ? 'Faol' : 'Faol emas'}
                  </span>
                </div>
              </div>

              {profile.bio && (
                <p className="theme-text-secondary text-sm line-clamp-3 mb-4">
                  {profile.bio}
                </p>
              )}

              {/* Contact Info */}
              <div className="space-y-2 text-sm theme-text-muted">
                <div className="flex items-center space-x-2">
                  <Mail size={14} />
                  <span className="truncate">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone size={14} />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar size={14} />
                  <span>Ro'yxatdan o'tgan: {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-lg font-bold theme-text">{profile.certificates.length}</div>
                  <div className="text-xs theme-text-secondary">Sertifikatlar</div>
                </div>
                <div>
                  <div className="text-lg font-bold theme-text">{profile.education.length}</div>
                  <div className="text-xs theme-text-secondary">Ta'lim</div>
                </div>
                <div>
                  <div className="text-lg font-bold theme-text">{profile.languages.length}</div>
                  <div className="text-xs theme-text-secondary">Tillar</div>
                </div>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {profile.languages.slice(0, 3).map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {lang.toUpperCase()}
                    </span>
                  ))}
                  {profile.languages.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{profile.languages.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6">
              <div className="flex space-x-2">
                {!profile.verified && (
                  <button
                    onClick={() => handleVerification(profile.id, true, profile.full_name)}
                    disabled={verifyLoading === profile.id}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-1"
                  >
                    {verifyLoading === profile.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span className="text-sm">Tasdiqlash</span>
                      </>
                    )}
                  </button>
                )}
                
                {profile.verified && (
                  <button
                    onClick={() => handleVerification(profile.id, false, profile.full_name)}
                    disabled={verifyLoading === profile.id}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-1"
                  >
                    {verifyLoading === profile.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span className="text-sm">Rad etish</span>
                      </>
                    )}
                  </button>
                )}
                
                <button className="p-2 theme-accent hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProfiles.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <Stethoscope size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            Shifokor profili topilmadi
          </h3>
          <p className="theme-text-muted">
            Qidiruv so'zini o'zgartiring yoki filtrlarni qayta sozlang
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorProfilesManagement;