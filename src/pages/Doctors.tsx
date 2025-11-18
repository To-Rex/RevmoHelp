import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, MapPin, Star, Award, Calendar, Phone, Mail, Video, Clock } from 'lucide-react';
import { ArrowRight, Eye } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { getDoctors } from '../lib/doctors';
import { getDoctorReviews, getDoctorRatingStats } from '../lib/doctorReviews';
import type { Doctor } from '../lib/doctors';

const Doctors: React.FC = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const formatExperience = (years: number) => {
    switch (i18n.language) {
      case 'ru': return `${years} лет опыта`;
      case 'en': return `${years} years experience`;
      default: return `${years} yil tajriba`;
    }
  };
  const formatReviews = (count: number) => {
    switch (i18n.language) {
      case 'ru': return `${count} отзывов`;
      case 'en': return `${count} reviews`;
      default: return `${count} sharh`;
    }
  };
  const certsLabel = i18n.language === 'ru' ? 'Сертификаты:' : i18n.language === 'en' ? 'Certificates:' : 'Sertifikatlar:';
  const moreLabel = i18n.language === 'ru' ? 'ещё' : i18n.language === 'en' ? 'more' : "ko'proq";
  const phoneMissing = i18n.language === 'ru' ? 'Телефон не указан' : i18n.language === 'en' ? 'Phone not provided' : 'Telefon kiritilmagan';
  const viewProfile = i18n.language === 'ru' ? 'Смотреть профиль' : i18n.language === 'en' ? 'View profile' : "Profil ko'rish";
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [doctorRatings, setDoctorRatings] = useState<Record<string, { averageRating: number; totalReviews: number }>>({});
  const [fetchLimit, setFetchLimit] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Reload doctors when language or limit changes to apply translations
    loadDoctors();
    setDoctorRatings({});
  }, [i18n.language, fetchLimit]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading doctors for public site...');
      
      const { data, error } = await getDoctors(i18n.language, { allowMock: false, limit: fetchLimit, verified: true });
      
      if (data) {
        console.log('✅ Doctors loaded for public site:', data.length);
        setDoctors(data);
        setLoading(false);

        // Load ratings in parallel without blocking initial render
        Promise.all(
          data.map(async (d) => {
            try {
              const [stats, reviews] = await Promise.all([
                getDoctorRatingStats(d.id),
                getDoctorReviews(d.id, { approved: true })
              ]);
              return [d.id, { averageRating: stats.averageRating, totalReviews: reviews.data?.length || 0 }] as const;
            } catch (e) {
              console.error(`Error loading data for doctor ${d.id}:`, e);
              return [d.id, { averageRating: 4.9, totalReviews: 0 }] as const;
            }
          })
        ).then((entries) => {
          setDoctorRatings(Object.fromEntries(entries));
        });
      } else if (error) {
        console.log('❌ Error loading doctors:', error);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    { value: 'all', label: t('allSpecialties'), count: doctors.length },
    { value: 'revmatologiya', label: 'Revmatologiya', count: 2 },
    { value: 'ortopediya', label: 'Ortopediya', count: 1 },
    { value: 'reabilitatsiya', label: 'Reabilitatsiya', count: 1 },
    { value: 'kardiologiya', label: 'Kardiologiya', count: 1 },
    { value: 'nevrologiya', label: 'Nevrologiya', count: 1 }
  ];

  const experienceRanges = [
    { value: 'all', label: t('allExperience'), count: doctors.length },
    { value: '5-10', label: '5-10 ' + t('yearsExperience'), count: 2 },
    { value: '10-15', label: '10-15 ' + t('yearsExperience'), count: 3 },
    { value: '15+', label: '15+ ' + t('yearsExperience'), count: 1 }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doctor.bio && doctor.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            doctor.specialization.toLowerCase().includes(selectedSpecialty);
    
    const matchesExperience = selectedExperience === 'all' ||
                             (selectedExperience === '5-10' && doctor.experience_years >= 5 && doctor.experience_years <= 10) ||
                             (selectedExperience === '10-15' && doctor.experience_years >= 10 && doctor.experience_years <= 15) ||
                             (selectedExperience === '15+' && doctor.experience_years >= 15);
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const newLimit = fetchLimit + 12;
      setFetchLimit(newLimit);
      const { data } = await getDoctors(i18n.language, { allowMock: false, limit: newLimit, verified: true });
      if (data) setDoctors(data);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Shifokorlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Shifokorlar"
        description="Revmatik kasalliklar bo'yicha tajribali shifokorlar. Professional maslahat va davolash xizmatlari."
        keywords="shifokor, revmatolog, ortoped, kardiolog, nevropatolog, tibbiy maslahat"
        url="https://revmohelp.uz/doctors"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Award size={16} className="text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">{t('professionalMedicalTeam')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6">{t('doctorsTitle')}</h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8">{t('doctorsSubtitle')}</p>
            <div className="flex items-center justify-center space-x-8 text-sm theme-text-tertiary">
              <div className="flex items-center space-x-2">
                <Award size={16} className="text-blue-600" />
                <span>{t('certifiedSpecialists')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-green-600" />
                <span>{t('consultation24_7')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video size={16} className="text-purple-600" />
                <span>{t('onlineConsultation')}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Search and Filter */}
          <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 mb-8 mt-8 animate-slide-up" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                  <input style={{ backgroundColor: '#ffffff' }}
                    type="text"
                    placeholder={t('searchDoctors')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 ring-1 ring-[#5FA8D3] border-transparent rounded-lg focus:ring-2 focus:ring-[#62B6CB] focus:border-[#62B6CB] transition-colors duration-200 bg-white dark:bg-[#3E433B] theme-text"
                  />
                </div>
              </div>

              {/* Specialty Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                  <select style={{ backgroundColor: '#ffffff' }}
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 ring-1 ring-[#5FA8D3] border-transparent rounded-lg focus:ring-2 focus:ring-[#62B6CB] focus:border-[#62B6CB] transition-colors duration-200 appearance-none bg-white dark:bg-[#3E433B] theme-text"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                  <select style={{ backgroundColor: '#ffffff' }}
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 ring-1 ring-[#5FA8D3] border-transparent rounded-lg focus:ring-2 focus:ring-[#62B6CB] focus:border-[#62B6CB] transition-colors duration-200 appearance-none bg-white dark:bg-[#3E433B] theme-text"
                  >
                    {experienceRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="theme-text-secondary">
             <span className="font-semibold theme-text">{filteredDoctors.length}</span> {t('doctorsFound')}
            </p>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor, index) => (
              <Link
                key={doctor.id}
                to={`/doctors/${doctor.id}`}
                className="group block h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="bg-white rounded-3xl theme-shadow-lg theme-border border overflow-hidden animate-fade-in h-full flex flex-col hover:theme-shadow-lg transition-all duration-500 hover:-translate-y-2 hover-medical"
                  style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                {/* Doctor Photo */}
                <div className="relative overflow-hidden">
                  <img
                    src={doctor.avatar_url}
                    alt={doctor.full_name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 lazyload"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Verification Badge */}
                  {doctor.verified && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                      <Award size={16} />
                    </div>
                  )}

                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">4.9</span>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-gray-900 font-semibold flex items-center space-x-2">
                        <ArrowRight size={16} />
                        <span>{viewProfile}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold theme-text mb-2 group-hover:theme-accent transition-colors duration-200">
                      {doctor.full_name}
                    </h3>
                    <p className="theme-accent font-semibold mb-2">
                      {doctor.specialization}
                    </p>
                    <p className="theme-text-secondary text-sm leading-relaxed line-clamp-3">
                      {doctor.bio || (i18n.language === 'ru' ? 'Профессиональный врач' : i18n.language === 'en' ? 'Professional doctor' : 'Professional shifokor')}
                    </p>
                  </div>

                  {/* Experience & Contact */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 theme-text-secondary">
                        <Calendar size={14} />
                        <span>{formatExperience(doctor.experience_years)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="theme-text-secondary">{doctorRatings[doctor.id]?.averageRating?.toFixed(1) || '4.9'} ({formatReviews(doctorRatings[doctor.id]?.totalReviews || 0)})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm theme-text-secondary">
                      <Phone size={14} />
                      <span>{doctor.phone || phoneMissing}</span>
                    </div>
                  </div>

                  {/* Certificates */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold theme-text mb-2">{certsLabel}</h4>
                    <div className="flex flex-wrap gap-1">
                      {doctor.certificates?.slice(0, 2).map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                        >
                          {cert}
                        </span>
                      ))}
                      {doctor.certificates && doctor.certificates.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                          +{doctor.certificates.length - 2} {moreLabel}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredDoctors.length === 0 && (
            <div className="text-center py-16">
              <div className="theme-text-muted mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold theme-text-secondary mb-2">
                {t('noDoctorsFound')}
              </h3>
              <p className="theme-text-muted">
                {t('changeSearchOrFilters')}
              </p>
            </div>
          )}

          {/* Load More */}
          {filteredDoctors.length > 0 && doctors.length >= fetchLimit && (
            <div className="text-center mt-12">
              <button onClick={handleLoadMore} disabled={loadingMore} className="theme-bg border-2 border-blue-600 theme-accent px-8 py-4 rounded-xl font-semibold hover:theme-bg-tertiary transition-colors duration-200 transform hover:scale-105 disabled:opacity-60">
                {loadingMore ? t('loading') : t('viewMoreDoctors')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
