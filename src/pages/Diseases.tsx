import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Activity,
  ArrowRight,
  Heart,
  Stethoscope,
  AlertCircle,
  Eye,
  BookOpen,
  ChevronRight,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Play,
  FileText,
  Image as ImageIcon,
  Video,
  Users,
  Clock,
  MessageCircle
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { getDiseases } from '../lib/diseases';
import { getContentTypeIcon, getContentTypeLabel, getContentTypeColor } from '../utils/diseaseHelpers';
import type { Disease } from '../lib/diseases';

const Diseases: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadDiseases();
  }, [i18n.language]);

  const loadDiseases = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading diseases for page...');
      const { data, error } = await getDiseases(i18n.language, { active: true });
      
      console.log('📊 Diseases result:', { data: data?.length, error });
      
      if (data) {
        setDiseases(data);
        console.log('✅ Diseases set:', data.length);
      } else {
        console.log('❌ No diseases data received');
        setDiseases([]);
      }
    } catch (error) {
      console.error('Error loading diseases:', error);
      setDiseases([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiseases = diseases.filter(disease => {
    const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disease.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'featured' && disease.featured) ||
                       (selectedType === 'video' && disease.youtube_url) ||
                       (selectedType === 'image' && disease.featured_image_url);
    return matchesSearch && matchesType;
  });

  const getDiseaseIcon = (index: number) => {
    const icons = [Heart, Activity, Stethoscope, AlertCircle, Shield, Target];
    return icons[index % icons.length];
  };

  const getDiseaseColor = (index: number) => {
    const colors = [
      'from-blue-500 to-teal-500',
      'from-blue-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-teal-500 to-blue-500',
      'from-indigo-500 to-blue-500',
      'from-cyan-500 to-teal-500'
    ];
    return colors[index % colors.length];
  };

  const getBgColor = (index: number) => {
    const colors = [
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">{t('loadingDiseases')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Revmatik Kasalliklar"
        description="Revmatik kasalliklar haqida batafsil ma'lumot. Belgilar, davolash usullari va profilaktika choralari."
        keywords="revmatik kasalliklar, artrit, artroz, spondiloartrit, lupus, belgilar, davolash"
        url="https://revmohelp.uz/diseases"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 theme-bg-secondary backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-in theme-shadow-lg theme-border border">
              <Activity size={16} className="theme-bg-secondary dark:text-blue-800" />
              <span className="text-blue-800 text-sm font-medium">Medical Conditions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6 animate-slide-up">
              {t('rheumaticDiseases')}
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8 animate-slide-up delay-200">
              {t('diseasesSubtitle')}
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm theme-text-tertiary animate-fade-in delay-300">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-blue-600" />
                <span>{t('verifiedInfo')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart size={16} className="text-green-600" />
                <span>{t('professionalAdvice')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity size={16} className="text-purple-600" />
                <span>{t('modernTreatment')}</span>
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
                    placeholder={t('searchDiseases')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 ring-1 ring-[#5FA8D3] border-transparent rounded-lg focus:ring-2 focus:ring-[#62B6CB] focus:border-[#62B6CB] transition-colors duration-200 bg-white dark:bg-[#3E433B] theme-text"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                  <select style={{ backgroundColor: '#ffffff' }}
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 ring-1 ring-[#5FA8D3] border-transparent rounded-lg focus:ring-2 focus:ring-[#62B6CB] focus:border-[#62B6CB] transition-colors duration-200 appearance-none bg-white dark:bg-[#3E433B] theme-text"
                  >
                    <option value="all">{t('allDiseases')}</option>
                    <option value="featured">{t('mainDiseases')}</option>
                    <option value="video">{t('withVideo')}</option>
                    <option value="image">{t('withImage')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="theme-text-secondary">
              <span className="font-semibold theme-text">{filteredDiseases.length}</span> {t('diseasesFound')}
            </p>
          </div>

          {/* Diseases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDiseases.map((disease, index) => {
              const DiseaseIcon = getDiseaseIcon(index);
              const gradientColor = getDiseaseColor(index);
              const bgColor = getBgColor(index);
              const ContentIcon = getContentTypeIcon(disease);
              
              return (
                <Link
                  key={disease.id}
                  to={i18n.language === 'uz' ? `/diseases/${disease.slug}` : `/${i18n.language}/diseases/${disease.slug}`}
                  className="group block h-full min-h-[350px]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white rounded-3xl theme-shadow-lg theme-border border overflow-hidden animate-fade-in h-full flex flex-col hover:theme-shadow-lg transition-all duration-500 hover:-translate-y-2 hover-medical">
                    {/* Disease Media */}
                    <div className="relative overflow-hidden">
                      {disease.featured_image_url ? (
                        <img
                          src={disease.featured_image_url}
                          alt={disease.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : disease.youtube_url ? (
                        <div className="relative w-full h-64">
                          <img
                            src={`https://img.youtube.com/vi/${disease.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                            alt={disease.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://img.youtube.com/vi/${disease.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-300">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl animate-pulse group-hover:scale-110 transition-transform duration-300">
                              <Play size={24} className="text-white ml-1" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-64 bg-blue-50 dark:bg-blue-900/20 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                          <DiseaseIcon size={DiseaseIcon === Activity ? 32 : 48} className="theme-accent" />
                        </div>
                      )}
                      
                      {/* Content Type Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContentTypeColor(disease)} flex items-center space-x-1`}>
                          <ContentIcon size={12} />
                          <span>{getContentTypeLabel(disease)}</span>
                        </span>
                      </div>

                      {/* Featured Badge */}
                      {disease.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-yellow-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg">
                            {t('main')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Disease Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold theme-text mb-3 group-hover:theme-accent transition-colors duration-300 leading-tight">
                        {disease.name}
                      </h3>
                      
                      <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed min-h-[3.75rem]">
                        {disease.description}
                      </p>

                      {/* Quick Stats */}
                      <div className="flex items-center justify-center space-x-4 text-xs theme-text-muted mb-4">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{disease.symptoms?.length || 0} {t('symptoms')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{disease.treatment_methods?.length || 0} {t('methods')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle size={14} />
                          <span>{disease.prevention_tips?.length || 0} {t('advice')}</span>
                        </div>
                      </div>

                      {/* Hover Indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-center">
                        <div className="inline-flex items-center space-x-2 theme-accent font-medium text-sm">
                          <BookOpen size={14} />
                          <span>{t('detailedInfo')}</span>
                          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>

          {/* No Results */}
          {filteredDiseases.length === 0 && !loading && (
            <div className="text-center py-16 animate-fade-in">
              <div className="theme-text-muted mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold theme-text-secondary mb-2">
                {t('diseaseNotFound')}
              </h3>
              <p className="theme-text-muted">
                {t('changeSearchOrFilters')}
              </p>
            </div>
          )}

          {/* Medical Notice */}
          <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl animate-fade-in delay-1000">
            <div className="flex items-center space-x-3 text-black dark:text-black">
              <Shield size={10} className="flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">{t('medicalWarning')}</h4>
                <p className="text-sm">
                  {t('medicalWarningText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diseases;
