import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock,
  Star,
  Heart,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Pill,
  Target,
  Quote,
  Award,
  Share2,
  ThumbsUp,
  MessageSquare,
  Play,
  FileText,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import LanguageAwareLink from '../components/common/LanguageAwareLink';
import { getPatientStoryById } from '../lib/patientStories';
import type { PatientStory } from '../lib/patientStories';

const PatientStoryDetail: React.FC = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [story, setStory] = useState<PatientStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      loadStory();
    }
  }, [id, i18n.language]);

  const loadStory = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await getPatientStoryById(id, i18n.language);
      
      if (error) {
        setError('Bemor tarixi topilmadi');
      } else if (data) {
        setStory(data);
      }
    } catch (error) {
      setError('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      default: return FileText;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-primary-600';
      case 'video': return 'bg-primary-700';
      default: return 'bg-primary-800';
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Rasm';
      case 'video': return 'Video';
      default: return 'Matn';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${story?.patient_name} - Bemor Tarixi`,
        text: story?.story_content,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="theme-text-secondary font-medium">Bemor tarixi yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">Bemor tarixi topilmadi</h1>
          <p className="theme-text-secondary mb-6">Siz qidirayotgan bemor tarixi mavjud emas yoki o'chirilgan.</p>
          <LanguageAwareLink
            to="/patient-stories"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>{t('back')}</span>
          </LanguageAwareLink>
        </div>
      </div>
    );
  }

  const ContentIcon = getContentTypeIcon(story.content_type);

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title={`${story.patient_name} - Bemor Tarixi`}
        description={story.story_content}
        keywords={`${story.patient_name}, ${story.diagnosis}, bemor tarixi, shifo topish`}
        url={`https://revmohelp.uz/patient-stories/${story.id}`}
        type="article"
        article={{
          author: story.doctor_name,
          publishedTime: story.created_at,
          modifiedTime: story.updated_at,
          section: 'Bemorlar Tarixi',
          tags: story.symptoms
        }}
      />

      <div className="min-h-screen theme-bg">
        {/* Header */}
        <div className="theme-bg theme-shadow theme-border border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <LanguageAwareLink
              to="/patient-stories"
              className="inline-flex items-center space-x-2 theme-text hover:theme-accent transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span>{t('back')}</span>
            </LanguageAwareLink>
          </div>
        </div>

        {/* Story Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#CAD8D6] to-[#CAD8D6] dark:from-[#CAD8D6] dark:to-[#CAD8D6]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border overflow-hidden animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Story Media */}
                <div className="relative h-96 lg:h-full">
                  {story.featured_image_url ? (
                    <img
                      src={story.featured_image_url}
                      alt={story.patient_name}
                      className="w-full h-full object-cover"
                    />
                  ) : story.youtube_url ? (
                    <div className="relative w-full h-full">
                      <img
                        src={`https://img.youtube.com/vi/${story.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                        alt={story.patient_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://img.youtube.com/vi/${story.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#CAD8D6] to-[#CAD8D6] dark:from-[#CAD8D6] dark:to-[#CAD8D6] flex items-center justify-center">
                      <div className="text-center">
                        <ContentIcon size={64} className="text-gray-500 dark:text-gray-300 mx-auto mb-4 opacity-80" />
                        <p className="theme-text-secondary text-xl font-medium">{getContentTypeLabel(story.content_type)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay Badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-3">
                    <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg ${getContentTypeColor(story.content_type)} text-white flex items-center space-x-2`}>
                      <ContentIcon size={16} />
                      <span>{getContentTypeLabel(story.content_type)}</span>
                    </span>
                    {story.featured && (
                      <span className="bg-amber-400 text-gray-900 rounded-full px-4 py-2 flex items-center space-x-2 text-sm font-bold shadow-lg">
                        <Award size={16} />
                        <span>Asosiy Hikoya</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-6 right-6">
                    <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={16} className={`${star <= (story.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-sm font-bold text-gray-900 ml-2">{story.rating || 5}</span>
                    </div>
                  </div>
                </div>

                {/* Story Info */}
                <div className="p-8 lg:p-12">
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm font-bold text-gray-900 dark:text-gray-100 shadow-md">
                        {story.age}
                      </span>
                      <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-full px-4 py-2 text-sm font-bold">
                        {story.diagnosis}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl lg:text-4xl font-bold theme-text mb-4">
                      {story.patient_name}
                    </h1>
                    
                    <div className="flex items-center space-x-6 text-sm theme-text-secondary mb-6">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>{formatDate(story.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} />
                        <span>{story.treatment_duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Stethoscope size={16} />
                        <span>{story.doctor_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                        isLiked
                                                                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                                                                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                                                        }`}
                    >
                      <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                      <span>Yoqdi</span>
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                    >
                      <Share2 size={18} />
                      <span>Ulashish</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 bg-[#90978C] text-white px-6 py-3 rounded-xl hover:bg-[#90978C]/80 transition-colors duration-200 font-medium">
                      <MessageSquare size={18} />
                      <span>Izoh qoldirish</span>
                    </button>
                  </div>

                  {/* Treatment Outcome */}
                  <div className="bg-gray-100 dark:bg-gray-900/20 rounded-2xl p-6 border-l-4 border-[#90978C]">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                        <CheckCircle size={20} className="text-gray-700 dark:text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold theme-text">{t('successful')}</h3>
                    </div>
                    <p className="text-lg font-semibold text-green-700 dark:text-green-300">{story.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Story Quote */}
              <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border p-8 animate-fade-in">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Quote size={24} className="text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold theme-text mb-4">{t('patientStoriesTitle')}</h2>
                    <blockquote className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed italic">
                      "{story.story_content}"
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* Detailed Information Sections */}
              <div className="space-y-8">
                {/* Symptoms Section */}
                {story.symptoms && story.symptoms.length > 0 && (
                  <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                        <AlertCircle size={24} className="text-gray-700 dark:text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-bold theme-text">{t('symptoms')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {story.symptoms.map((symptom, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="w-3 h-3 bg-orange-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">{symptom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment Methods Section */}
                {story.treatment_methods && story.treatment_methods.length > 0 && (
                  <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-200">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                        <Stethoscope size={24} className="text-gray-700 dark:text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-bold theme-text">{t('methods')}</h3>
                    </div>
                    <div className="space-y-4">
                      {story.treatment_methods.map((method, idx) => (
                        <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700">
                          <CheckCircle size={20} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                          <span className="font-semibold text-lg">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medications Section */}
                {story.medications && story.medications.length > 0 && (
                  <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-400">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                        <Pill size={24} className="text-gray-700 dark:text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-bold theme-text">{t('medications')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {story.medications.map((medication, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Pill size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="font-medium">{medication}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle Changes Section */}
                {story.lifestyle_changes && (
                  <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-600">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                        <Target size={24} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-2xl font-bold theme-text">Turmush Tarzi O'zgarishlari</h3>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <p className="text-lg leading-relaxed">{story.lifestyle_changes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Patient Info Card */}
              <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border p-6 animate-slide-left">
                <h3 className="text-xl font-bold theme-text mb-6">Bemor Ma'lumotlari</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <span className="theme-text-secondary font-medium">{t('age')}</span>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{story.age}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <span className="theme-text-secondary font-medium">Tashxis</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{story.diagnosis}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <span className="theme-text-secondary font-medium">Davolash muddati</span>
                    <span className="font-bold text-gray-900 dark:text-white">{story.treatment_duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <span className="theme-text-secondary font-medium">Reyting</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={16} className={`${star <= (story.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border p-6 animate-slide-left delay-200">
                <h3 className="text-xl font-bold theme-text mb-6">Davolash Shifokor</h3>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Stethoscope size={24} className="text-gray-700 dark:text-gray-300" />
                  </div>
                  <h4 className="text-lg font-bold theme-text mb-2">{story.doctor_name}</h4>
                  <p className="theme-text-secondary text-sm mb-4">Davolash shifokor</p>
                  
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="theme-text-secondary ml-2 text-sm">4.9 (127 sharh)</span>
                  </div>
                  
                  <button className="w-full bg-[#90978C] text-white py-3 rounded-xl font-semibold hover:bg-[#90978C]/80 transition-colors duration-200">
                    Shifokor bilan bog'lanish
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-[#CAD8D6] rounded-3xl theme-shadow-lg theme-border border p-6 animate-slide-left delay-400">
                <h3 className="text-xl font-bold theme-text mb-6">Davolash Statistikasi</h3>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="text-2xl font-bold theme-text mb-1">
                      {story.symptoms?.length || 0}
                    </div>
                    <div className="text-sm theme-text-secondary">{t('symptoms')}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="text-2xl font-bold theme-text mb-1">
                      {story.treatment_methods?.length || 0}
                    </div>
                    <div className="text-sm theme-text-secondary">{t('methods')}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="text-2xl font-bold theme-text mb-1">
                      {story.medications?.length || 0}
                    </div>
                    <div className="text-sm theme-text-secondary">{t('medications')}</div>
                  </div>
                </div>
              </div>

              {/* Share Story */}
              <div className="bg-[#90978C] rounded-3xl p-6 text-white animate-slide-left delay-600">
                <h3 className="text-lg font-bold mb-2">Hikoyani Ulashing</h3>
                <p className="text-white mb-4 text-sm">
                  Bu hikoya boshqa bemorlar uchun umid manbai bo'lishi mumkin
                </p>
                <button
                  onClick={handleShare}
                  className="w-full bg-white text-primary-600 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Share2 size={18} />
                  <span>Ulashish</span>
                </button>
              </div>
            </div>
          </div>

          {/* Related Stories */}
          <div className="mt-16 animate-fade-in delay-800">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold theme-text mb-4">O'xshash Hikoyalar</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                Shunga o'xshash kasalliklardan shifo topgan boshqa bemorlar tarixi
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full text-center theme-text-secondary">
                O'xshash hikoyalar yuklanmoqda...
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 bg-primary-500 rounded-3xl p-12 text-white text-center animate-zoom-in delay-1000">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse-medical">
              <Heart size={36} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Sizning Hikoyangiz Ham Muhim</h2>
            <p className="text-white mb-8 max-w-2xl mx-auto text-lg">
              Agar siz ham revmatik kasalliklardan shifo topgan bo'lsangiz, 
              o'z tajribangiz bilan boshqa bemorlarni ilhomlantiring.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
                <Heart size={20} />
                <span>Hikoyangizni ulashing</span>
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors duration-200 transform hover:scale-105 flex items-center space-x-2">
                <Stethoscope size={20} />
                <span>Shifokor bilan bog'laning</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientStoryDetail;
