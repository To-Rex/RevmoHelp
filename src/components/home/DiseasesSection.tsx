import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
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
  TrendingUp
} from 'lucide-react';
import { getDiseases } from '../../lib/diseases';
import type { Disease } from '../../lib/diseases';
import LanguageAwareLink from '../common/LanguageAwareLink';

const DiseasesSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiseases();
  }, [i18n.language]);

  const loadDiseases = async () => {
    setLoading(true);
    try {
      const { data } = await getDiseases(i18n.language, { active: true, featured: true });
      if (data) {
        setDiseases(data);
      }
    } catch (error) {
      console.error('Error loading diseases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseIcon = (index: number) => {
    const icons = [Heart, Activity, Stethoscope, AlertCircle, Shield, Target];
    return icons[index % icons.length];
  };

  const getDiseaseColor = (index: number) => {
    const colors = [
      'from-red-500 to-pink-500',
      'from-blue-500 to-indigo-500', 
      'from-green-500 to-teal-500',
      'from-purple-500 to-violet-500',
      'from-orange-500 to-amber-500',
      'from-cyan-500 to-blue-500'
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
      <section className="py-20 theme-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="theme-text-muted">Kasalliklar yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  if (diseases.length === 0) {
    return null; // Don't show section if no diseases
  }

  return (
    <section className="py-20 theme-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 theme-bg-secondary backdrop-blur-sm rounded-full px-6 py-3 mb-6 theme-shadow-lg theme-border border">
            <Activity size={18} className="theme-accent" />
            <span className="theme-accent text-sm font-medium">{t('medicalConditions')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold theme-text mb-6">
            {t('rheumaticDiseases')}
          </h2>
          <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8">
            {language === 'ru' ? 
              'Получите подробную информацию о наиболее распространенных ревматических заболеваниях. Симптомы, методы лечения и профилактические меры для каждого заболевания.' :
              language === 'en' ?
              'Get detailed information about the most common rheumatic diseases. Symptoms, treatment methods and preventive measures for each disease.' :
              'Eng keng tarqalgan revmatik kasalliklar haqida batafsil ma\'lumot oling. Har bir kasallik uchun belgilar, davolash usullari va profilaktika choralari.'
            }
          </p>
        </div>

        {/* Diseases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {diseases.map((disease, index) => {
            const DiseaseIcon = getDiseaseIcon(index);
            const gradientColor = getDiseaseColor(index);
            const bgColor = getBgColor(index);
            
            return (
              <LanguageAwareLink
                key={disease.id}
                to={`/diseases/${disease.slug}`}
                className="group block animate-fade-in transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`relative overflow-hidden rounded-2xl border-2 ${bgColor} p-6 h-full hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2`} style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 20px 20px, currentColor 1px, transparent 0)`,
                      backgroundSize: '40px 40px'
                    }}></div>
                  </div>
                  
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${gradientColor} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse-medical`}>
                      <DiseaseIcon size={28} className="text-white" />
                    </div>
                    
                    {/* Floating indicator */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight size={14} className="text-gray-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative text-center">
                    <h3 className="text-lg font-bold theme-text mb-3 group-hover:theme-accent transition-colors duration-300 leading-tight">
                      {disease.name}
                    </h3>
                    
                    <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                      {disease.description}
                    </p>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-center space-x-4 text-xs theme-text-secondary mb-4">
                      <div className="flex items-center space-x-1">
                        <AlertCircle size={12} />
                        <span>{disease.symptoms?.length || 0} {t('symptoms')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Stethoscope size={12} />
                        <span>{disease.treatment_methods?.length || 0} {t('methods')}</span>
                      </div>
                    </div>

                    {/* Hover Indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="inline-flex items-center space-x-2 theme-text font-medium text-sm">
                        <BookOpen size={14} />
                        <span>{t('detailedInfo')}</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${gradientColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
                </div>
              </LanguageAwareLink>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center animate-fade-in delay-700">
          <LanguageAwareLink
            to="/diseases"
            className="inline-flex items-center space-x-3 bg-[#62B6CB] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#5FA8D3] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Activity size={20} />
            <span>{t('allDiseases')}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
          </LanguageAwareLink>
        </div>

        {/* Medical Notice */}
        <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl animate-fade-in delay-1000">
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
      </div>
    </section>
  );
};

export default DiseasesSection;
