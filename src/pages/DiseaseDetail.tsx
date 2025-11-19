import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Activity, 
  AlertCircle, 
  Stethoscope, 
  Shield,
  Target,
  Heart,
  Play,
  FileText,
  Image as ImageIcon,
  Video,
  Calendar,
  Eye,
  Share2,
  BookOpen,
  Pill,
  CheckCircle,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { getDiseaseBySlug } from '../lib/diseases';
import { getContentTypeIcon, getContentTypeLabel, getContentTypeColor } from '../utils/diseaseHelpers';
import type { Disease } from '../lib/diseases';

const DiseaseDetail: React.FC = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadDisease();
    }
  }, [slug, i18n.language]);

  const loadDisease = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const { data, error } = await getDiseaseBySlug(slug, i18n.language);
      
      if (error) {
        setError(t('diseaseNotFound'));
      } else if (data) {
        setDisease(data);
      }
    } catch (error) {
      setError(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && disease) {
      try {
        await navigator.share({
          title: disease.name,
          text: disease.description,
          url: window.location.href,
        });
      } catch (error) {
        navigator.clipboard.writeText(window.location.href);
        alert(t('linkCopied'));
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('linkCopied'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">{t('loadingDiseaseInfo')}</p>
        </div>
      </div>
    );
  }

  if (error || !disease) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">{t('diseaseNotFound')}</h1>
          <p className="theme-text-secondary mb-6">{t('diseaseNotExist')}</p>
          <Link
            to="/diseases"
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>{t('backToDiseases')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const ContentIcon = getContentTypeIcon(disease);

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title={disease.meta_title || disease.name}
        description={disease.meta_description || disease.description}
        keywords={`${disease.name}, revmatik kasallik, belgilar, davolash, profilaktika`}
        url={`https://revmohelp.uz/diseases/${disease.slug}`}
        type="article"
        article={{
          author: 'Revmoinfo Medical Team',
          publishedTime: disease.created_at,
          modifiedTime: disease.updated_at,
          section: 'Kasalliklar',
          tags: disease.symptoms
        }}
      />

      <div className="min-h-screen theme-bg">
        {/* Header */}
        <div className="theme-bg theme-shadow-lg theme-border border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              to="/diseases"
              className="inline-flex items-center space-x-2 theme-text-secondary hover:theme-accent transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span>{t('backToDiseases')}</span>
            </Link>
          </div>
        </div>

        {/* Disease Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-teal-600/5 dark:from-blue-400/3 dark:to-teal-400/3"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border overflow-hidden animate-fade-in" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Disease Media */}
                <div className="relative h-96 lg:h-full">
                  {disease.featured_image_url ? (
                    <img
                      src={disease.featured_image_url}
                      alt={disease.name}
                      className="w-full h-full object-cover"
                    />
                  ) : disease.youtube_url ? (
                    <div className="relative w-full h-full">
                      <img
                        src={`https://img.youtube.com/vi/${disease.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                        alt={disease.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://img.youtube.com/vi/${disease.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-50 to-highlight-50 dark:from-primary-900/20 dark:to-highlight-900/20 flex items-center justify-center">
                      <div className="text-center">
                        <Activity size={64} className="theme-text-muted mx-auto mb-4 opacity-60" />
                        <p className="theme-text-muted text-xl font-medium">{getContentTypeLabel(disease)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay Badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {disease.featured && (
                    <div className="absolute top-6 left-6">
                      <span className="bg-yellow-500 text-white rounded-full px-4 py-2 flex items-center space-x-2 text-sm font-bold shadow-lg">
                        <Award size={16} />
                        <span>{t('mainDisease')}</span>
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-6 right-6">
                    <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg ${getContentTypeColor(disease)} flex items-center space-x-2`}>
                      <ContentIcon size={16} />
                      <span>{getContentTypeLabel(disease)}</span>
                    </span>
                  </div>
                </div>

                {/* Disease Info */}
                <div className="p-8 lg:p-12">
                  <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold theme-text mb-6">
                      {disease.name}
                    </h1>
                    
                    <p className="text-lg theme-text-secondary leading-relaxed mb-6">
                      {disease.description}
                    </p>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 theme-bg-tertiary theme-text-secondary px-6 py-3 rounded-xl hover:theme-bg-quaternary transition-colors duration-200 font-medium"
                      >
                        <Share2 size={18} />
                        <span>{t('share')}</span>
                      </button>
                      
                      <Link
                        to="/consultation"
                        className="flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        <Stethoscope size={18} />
                        <span>{t('getConsultation')}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                      <div className="text-2xl font-bold theme-text mb-1">{disease.symptoms?.length || 0}</div>
                      <div className="text-sm theme-text-secondary">{t('symptomsLabel')}</div>
                    </div>
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                      <div className="text-2xl font-bold theme-text mb-1">{disease.treatment_methods?.length || 0}</div>
                      <div className="text-sm theme-text-secondary">{t('treatmentLabel')}</div>
                    </div>
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                      <div className="text-2xl font-bold theme-text mb-1">{disease.prevention_tips?.length || 0}</div>
                      <div className="text-sm theme-text-secondary">{t('preventionLabel')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disease Details */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Symptoms */}
              {disease.symptoms && disease.symptoms.length > 0 && (
                <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 mt-8 animate-slide-up" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center">
                      <AlertCircle size={24} className="text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold theme-text">{t('diseaseSymptoms')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {disease.symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                        <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment Methods */}
              {disease.treatment_methods && disease.treatment_methods.length > 0 && (
                <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-200" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center">
                      <Stethoscope size={24} className="text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold theme-text">{t('treatmentMethods')}</h2>
                  </div>
                  <div className="space-y-4">
                    {disease.treatment_methods.map((method, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                        <CheckCircle size={20} className="text-primary-600 flex-shrink-0" />
                        <span className="font-semibold text-lg">{method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prevention Tips */}
              {disease.prevention_tips && disease.prevention_tips.length > 0 && (
                <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-400" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center">
                      <Shield size={24} className="text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold theme-text">{t('preventionTips')}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {disease.prevention_tips.map((tip, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                        <Target size={18} className="text-primary-600 flex-shrink-0" />
                        <span className="font-medium">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Video */}
              {disease.youtube_url && (
                <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-600" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center">
                      <Video size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold theme-text">{t('videoInfo')}</h2>
                  </div>
                  <div className="relative w-full h-64 md:h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <iframe
                      src={disease.youtube_url.replace('watch?v=', 'embed/')}
                      title={disease.name}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Disease Summary */}
              <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-6 mt-8 animate-slide-left" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <h3 className="text-xl font-bold theme-text mb-6">{t('diseaseSummary')}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                    <span className="theme-text-secondary font-medium">{t('symptomsCount')}</span>
                    <span className="font-bold theme-text text-lg">{disease.symptoms?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                    <span className="theme-text-secondary font-medium">{t('treatmentMethodsCount')}</span>
                    <span className="font-bold theme-text text-lg">{disease.treatment_methods?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                    <span className="theme-text-secondary font-medium">{t('preventionLabel')}</span>
                    <span className="font-bold theme-text text-lg">{disease.prevention_tips?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                    <span className="theme-text-secondary font-medium">{t('contentType')}</span>
                    <div className="flex items-center space-x-2">
                      <ContentIcon size={16} className="theme-accent" />
                      <span className="font-bold theme-text">{getContentTypeLabel(disease)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-6 animate-slide-left delay-200" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <h3 className="text-xl font-bold theme-text mb-6">{t('quickActions')}</h3>
                
                <div className="space-y-3">
                  <Link
                    to="/consultation"
                    className="w-full flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200 theme-text hover:theme-bg-tertiary transition-colors duration-200"
                  >
                    <Stethoscope size={18} className="text-blue-600" />
                    <span className="font-medium">{t('getFreeConsultationDetail')}</span>
                  </Link>
                  
                  <Link
                    to="/doctors"
                    className="w-full flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200 theme-text hover:theme-bg-tertiary transition-colors duration-200"
                  >
                    <Users size={18} className="text-green-600" />
                    <span className="font-medium">{t('meetDoctorsDetail')}</span>
                  </Link>
                  
                  <Link
                    to="/posts"
                    className="w-full flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200 theme-text hover:theme-bg-tertiary transition-colors duration-200"
                  >
                    <BookOpen size={18} className="text-purple-600" />
                    <span className="font-medium">{t('relatedArticles')}</span>
                  </Link>
                </div>
              </div>

              {/* Share */}
              <div className="bg-primary-600 rounded-2xl theme-shadow-lg p-6 text-white animate-slide-left delay-400" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <h3 className="text-lg font-bold mb-2">{t('shareInfo')}</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  {t('shareDiseaseInfo')}
                </p>
                <button
                  onClick={handleShare}
                  className="w-full bg-white text-primary-600 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Share2 size={18} />
                  <span>{t('share')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Notice */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl animate-fade-in">
            <div className="flex items-center space-x-3 text-black dark:text-black">
              <Shield size={20} className="flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">{t('medicalWarning')}</h4>
                <p className="text-sm">
                  {t('medicalWarningText')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DiseaseDetail;
