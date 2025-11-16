import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  User,
  Award,
  Clock,
  Stethoscope,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Quote,
  Users,
  Activity,
  Play,
  FileText,
  Image as ImageIcon,
  Video,
  Pill,
  Target,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  Eye,
  BookOpen,
  Filter
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import LanguageAwareLink from '../components/common/LanguageAwareLink';
import { getPatientStories } from '../lib/patientStories';
import { getContentTypeIcon, getContentTypeLabel, getContentTypeColor } from '../utils/patientStoryHelpers';
import type { PatientStory } from '../lib/patientStories';

const PatientStories: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [stories, setStories] = useState<PatientStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadStories();
  }, [i18n.language]);

  const loadStories = async () => {
    setLoading(true);
    try {
      const { data } = await getPatientStories(i18n.language, { published: true });
      if (data) {
        setStories(data);
      }
    } catch (error) {
      console.error('Error loading patient stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewStoryLabel = i18n.language === 'ru' ? 'Смотреть историю' : i18n.language === 'en' ? 'View story' : "Bemor tarixini ko'rish";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOutcomeColor = (outcome: string) => {
    if (outcome.toLowerCase().includes('shifo') || outcome.toLowerCase().includes('yaxshi') || outcome.toLowerCase().includes('recovery')) {
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    }
    if (outcome.toLowerCase().includes('yaxshilan') || outcome.toLowerCase().includes('improvement')) {
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
    }
    return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200';
  };

  const filteredStories = stories.filter(story => {
    if (selectedType === 'all') return true;
    return story.content_type === selectedType;
  });

  const getLocalizedPath = (path: string) => {
    if (i18n.language === 'ru' || i18n.language === 'en') return `/${i18n.language}${path}`;
    return path;
  };

  const handleOpenDetail = (id: string | number) => {
    navigate(getLocalizedPath(`/patient-stories/${id}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Bemorlar tarixi yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Bemorlar Tarixi"
        description="Revmatik kasalliklardan shifo topgan bemorlarning haqiqiy tarihlari. Umid va ilhom beruvchi hikoyalar."
        keywords="bemorlar tarixi, shifo topish, revmatik kasalliklar, muvaffaqiyat hikoyalari"
        url="https://revmohelp.uz/patient-stories"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 dark:from-green-400/5 dark:to-blue-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/50 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Heart size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-300 text-sm font-medium">Patient Success Stories</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6 animate-slide-up">
              <span className="text-green-600">{t('patientStoriesTitle')}</span>
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8 animate-slide-up delay-200">
              {t('patientStoriesSubtitle')}
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center space-x-8 text-sm theme-text-tertiary animate-fade-in delay-300">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-green-600" />
                <span>{stories.length}+ {t('successStories')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-blue-600" />
                <span>{t('realResults')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart size={16} className="text-red-500" />
                <span>{t('inspiring')}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Success Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 mt-8">
            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-white" />
              </div>
              <div className="text-3xl font-bold theme-text mb-2">{stories.length}+</div>
              <div className="theme-text-secondary">{t('healedPatients')}</div>
            </div>

            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in delay-100 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-white" />
              </div>
              <div className="text-3xl font-bold theme-text mb-2">95%</div>
              <div className="theme-text-secondary">{t('successRate')}</div>
            </div>

            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in delay-200 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Stethoscope size={32} className="text-white" />
              </div>
              <div className="text-3xl font-bold theme-text mb-2">15+</div>
              <div className="theme-text-secondary">{t('expertDoctors')}</div>
            </div>

            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in delay-300 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-white" />
              </div>
              <div className="text-3xl font-bold theme-text mb-2">18</div>
              <div className="theme-text-secondary">{t('averageTreatment')}</div>
            </div>
          </div>

          {/* Content Type Filter */}
          <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 mb-8 animate-slide-up" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* All Stories Filter */}
              <div className="flex-1">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                  <select style={{ backgroundColor: '#ffffff' }}
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 ring-1 ring-[#5FA8D3] border-transparent rounded-lg focus:ring-2 focus:ring-[#62B6CB] focus:border-[#62B6CB] transition-colors duration-200 appearance-none bg-white dark:bg-[#3E433B] theme-text"
                  >
                    <option value="all">Barcha hikoyalar ({stories.length})</option>
                    <option value="text">{t('textStories')} ({stories.filter(s => s.content_type === 'text').length})</option>
                    <option value="image">{t('imageStories')} ({stories.filter(s => s.content_type === 'image').length})</option>
                    <option value="video">{t('videoStories')} ({stories.filter(s => s.content_type === 'video').length})</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredStories.map((story, index) => {
              const ContentIcon = getContentTypeIcon(story.content_type);
              return (
                <article
                  key={story.id}
                  className="bg-white rounded-3xl theme-shadow-lg theme-border border overflow-hidden animate-fade-in group cursor-pointer hover:theme-shadow-lg transition-all duration-500 transform hover:-translate-y-3 hover-medical"
                  style={{ animationDelay: `${index * 150}ms`, boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  onClick={() => handleOpenDetail(story.id)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenDetail(story.id);
                    }
                  }}
                >
                  {/* Story Header with Media */}
                  <div className="relative h-64 overflow-hidden">
                    {story.featured_image_url ? (
                      <img
                        src={story.featured_image_url}
                        alt={story.patient_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : story.youtube_url ? (
                      <div className="relative w-full h-full">
                        <img
                          src={`https://img.youtube.com/vi/${story.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                          alt={story.patient_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://img.youtube.com/vi/${story.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-300">
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl animate-pulse group-hover:scale-110 transition-transform duration-300">
                            <Play size={28} className="text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 flex items-center justify-center transition-all duration-500">
                        {/* subtle pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 20px 20px, currentColor 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                          }} />
                        </div>
                        {/* icon tile */}
                        <div className="relative z-10 text-center">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white/40 dark:ring-white/10 mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
                            <ContentIcon size={28} className="text-white" />
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 text-gray-700 dark:text-white text-xs font-semibold shadow-sm">
                            Matn Hikoyasi
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#CAD8D6] dark:bg-white/15"></div>
                      </div>
                    )}
                    
                    {/* Minimal Gradient Overlay - faqat pastki qism */}
                    {(story.featured_image_url || story.youtube_url) && (
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                    )}

                    {/* Hover Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-gray-900 font-semibold flex items-center space-x-2">
                          <ArrowRight size={16} />
                          <span>{viewStoryLabel}</span>
                        </span>
                      </div>
                    </div>

                    {/* Minimal Top Badge - faqat content type */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md shadow-sm ${getContentTypeColor(story.content_type)} text-white flex items-center space-x-1`}>
                        <ContentIcon size={10} />
                        <span>{getContentTypeLabel(story.content_type)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="p-6 space-y-4">
                    {/* Patient Info Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold theme-text mb-1">{story.patient_name}</h3>
                        <p className="theme-accent font-semibold text-sm">{story.diagnosis}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={14} className={`${star <= (story.rating || 5) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs theme-text-muted">{story.age} yosh</p>
                      </div>
                    </div>

                    {/* Story Excerpt */}
                    <div className="relative">
                      <p className="theme-text-secondary leading-relaxed text-sm line-clamp-3">
                        "{story.story_content.length > 150 ? story.story_content.substring(0, 150) + '...' : story.story_content}"
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between text-sm theme-text-muted mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{story.treatment_duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Stethoscope size={14} />
                          <span className="truncate max-w-24">{story.doctor_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {story.featured && (
                          <Award size={14} className="text-yellow-500" />
                        )}
                        <span className="theme-text-secondary font-medium text-xs">{t('successful')}</span>
                      </div>
                    </div>

                    {/* Treatment Outcome - Compact */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 border-l-4 border-[#CAD8D6]">
                      <p className="text-sm font-medium theme-text line-clamp-2">{story.outcome}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t theme-border">
                      <div className="flex items-center space-x-3 text-xs theme-text-muted">
                        <div className="flex items-center space-x-1">
                          <AlertCircle size={12} />
                          <span>{story.symptoms?.length || 0} {t('symptoms')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Pill size={12} />
                          <span>{story.medications?.length || 0} {t('medications')}</span>
                        </div>
                      </div>
                      <LanguageAwareLink
                        to={`/patient-stories/${story.id}`}
                        className="flex items-center space-x-1 theme-accent-bg text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookOpen size={14} />
                        <span>{t('detailed')}</span>
                        <ArrowRight size={12} />
                      </LanguageAwareLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* No Stories */}
          {filteredStories.length === 0 && !loading && (
            <div className="text-center py-40 animate-fade-in">
              <div className="theme-text-muted mb-4">
                <Heart size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold theme-text-secondary mb-2">
                {selectedType === 'all' ? t('noStoriesYet') : `${selectedType === 'image' ? t('imageStories') : selectedType === 'video' ? t('videoStories') : t('textStories')} hikoyalar topilmadi`}
              </h3>
              <p className="theme-text-muted">
                {t('storiesWillBeAdded')}
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 bg-primary-500 rounded-3xl p-12 text-center text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse-medical">
              <Heart size={36} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">{t('yourStoryMatters')}</h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto text-lg">
              {t('shareYourStory')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
                <Heart size={20} />
                <span>{t('shareStoryBtn')}</span>
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors duration-200 transform hover:scale-105 flex items-center space-x-2">
                <Stethoscope size={20} />
                <span>{t('contactDoctor')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientStories;
