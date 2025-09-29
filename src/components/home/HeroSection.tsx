import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Stethoscope, Users, BookOpen, Heart, Activity, Shield, Zap, Plus, MessageSquare } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { useAuth } from '../../hooks/useAuth';
import { getHomepageSettings } from '../../lib/homepageSettings';
import type { HomepageTranslation } from '../../lib/homepageSettings';
import LanguageAwareLink from '../common/LanguageAwareLink';

const StatCard: React.FC<{ 
  icon: React.ComponentType<any>; 
  endValue: number; 
  label: string; 
  suffix?: string;
  delay?: number;
}> = ({ icon: Icon, endValue, label, suffix = '', delay = 0 }) => {
  const { count, ref } = useCountUp({ 
    end: endValue, 
    duration: 2500, 
    delay,
    easing: (t) => t * t * (3 - 2 * t) // smooth ease-in-out
  });

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
    }
    return num.toString();
  };

  return (
    <div 
      ref={ref}
      className="group text-center p-6 theme-bg-secondary backdrop-blur-sm rounded-xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-300 hover:scale-105 theme-border border"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon size={28} className="theme-accent" />
      </div>
      <div className="text-2xl font-bold theme-text mb-2 tabular-nums">
        {formatNumber(count)}{suffix}
      </div>
      <div className="theme-text-secondary text-sm font-medium">{label}</div>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<HomepageTranslation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [i18n.language]);

  const loadSettings = async () => {
    try {
      const { data } = await getHomepageSettings('hero', i18n.language);
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading homepage settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use settings data or fallback to defaults
  const getDefaultByLanguage = () => {
    switch (i18n.language) {
      case 'ru':
        return {
          title: 'Достоверная информация о ревматических заболеваниях',
          subtitle_authenticated: 'Профессиональная медицинская информационная платформа для пациентов и врачей',
          subtitle_unauthenticated: 'Если вы пациент, зарегистрируйтесь и получите профессиональную консультацию',
          stats: {
            articles: { value: 500, label: 'Медицинские Статьи', suffix: '+' },
            doctors: { value: 50, label: 'Врачи-Эксперты', suffix: '+' },
            patients: { value: 10000, label: 'Пациентов Получили Помощь', suffix: '+' }
          }
        };
      case 'en':
        return {
          title: 'Reliable information about rheumatic diseases',
          subtitle_authenticated: 'Professional medical information platform for patients and doctors',
          subtitle_unauthenticated: 'If you are a patient, register and get professional advice',
          stats: {
            articles: { value: 500, label: 'Medical Articles', suffix: '+' },
            doctors: { value: 50, label: 'Expert Doctors', suffix: '+' },
            patients: { value: 10000, label: 'Patients Helped', suffix: '+' }
          }
        };
      default:
        return {
          title: 'Revmatik kasalliklar haqida ishonchli ma\'lumot',
          subtitle_authenticated: 'Bemor va shifokorlar uchun professional tibbiy ma\'lumot va yo\'riqnoma platformasi',
          subtitle_unauthenticated: 'Agar bemor bo\'lsangiz, ro\'yxatdan o\'ting va professional maslahat oling',
          stats: {
            articles: { value: 500, label: 'Tibbiy Maqolalar', suffix: '+' },
            doctors: { value: 50, label: 'Ekspert Shifokorlar', suffix: '+' },
            patients: { value: 10000, label: 'Yordam Berilgan Bemorlar', suffix: '+' }
          }
        };
    }
  };

  const defaults = getDefaultByLanguage();
  const heroTitle = settings?.title || defaults.title;
  const heroSubtitleAuth = settings?.subtitle_authenticated || defaults.subtitle_authenticated;
  const heroSubtitleUnauth = settings?.subtitle_unauthenticated || defaults.subtitle_unauthenticated;
  
  const statsData = settings?.stats || defaults.stats;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden theme-bg">
      {/* Main Background with Theme Support */}
      <div className="absolute inset-0 theme-bg"></div>
      
      {/* Animated Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Geometric Shapes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 theme-gradient opacity-20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 theme-gradient-secondary opacity-15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-200 opacity-10 rounded-full blur-2xl animate-pulse-slow"></div>
        
        {/* Medical Icons - Subtle and Professional */}
        <div className="absolute top-20 right-20 opacity-10">
          <Stethoscope size={48} className="theme-accent animate-float" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Heart size={40} className="text-red-500 animate-pulse-slow" />
        </div>
        <div className="absolute top-1/3 left-16 opacity-8">
          <Activity size={36} className="theme-accent-secondary animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-1/3 right-16 opacity-8">
          <Shield size={32} className="text-green-600 animate-float" style={{ animationDelay: '3s' }} />
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--accent-primary) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Badge */}
          <div className="inline-flex items-center space-x-2 theme-bg-secondary backdrop-blur-sm rounded-full px-6 py-3 mb-8 animate-fade-in hover:scale-105 transition-all duration-300 theme-shadow-lg theme-border border">
            <Stethoscope size={18} className="theme-accent" />
            <span className="theme-accent text-sm font-medium">Professional Medical Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 animate-fade-in theme-text leading-tight">
            {heroTitle}
          </h1>

          {/* Subtitle */}
          {isAuthenticated ? (
            <p className="text-xl md:text-2xl theme-text-secondary mb-12 leading-relaxed animate-slide-up delay-200 max-w-3xl mx-auto">
              {heroSubtitleAuth}
            </p>
          ) : (
            <p className="text-xl md:text-2xl theme-text-secondary mb-12 leading-relaxed animate-slide-up delay-200 max-w-3xl mx-auto">
              {heroSubtitleUnauth}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20 animate-slide-up delay-300">
            {isAuthenticated ? (
              // Authenticated user buttons
              <>
                <LanguageAwareLink
                  to="/posts"
                  className="group theme-accent-bg text-white px-8 py-4 rounded-xl font-semibold hover:theme-accent-bg transition-all duration-300 transform hover:scale-105 theme-shadow-lg hover:theme-shadow-xl flex items-center space-x-3"
                >
                  <BookOpen size={20} />
                  <span>{t('readArticles')}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </LanguageAwareLink>
                <LanguageAwareLink
                  to="/qa"
                  className="group theme-border border-2 theme-text px-8 py-4 rounded-xl font-semibold hover:theme-bg-tertiary transition-all duration-300 transform hover:scale-105 theme-shadow-lg hover:theme-shadow-xl flex items-center space-x-3"
                >
                  <Plus size={20} />
                  <span>{t('askQuestionBtn')}</span>
                </LanguageAwareLink>
              </>
            ) : (
              // Non-authenticated user buttons
              <>
                <LanguageAwareLink
                  to="/consultation"
                  className="group bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 theme-shadow-lg hover:theme-shadow-xl flex items-center space-x-3"
                >
                  <MessageSquare size={20} />
                  <span>{t('getFreeConsultation')}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </LanguageAwareLink>
                <LanguageAwareLink
                  to="/posts"
                  className="group theme-border border-2 theme-text px-8 py-4 rounded-xl font-semibold hover:theme-bg-tertiary transition-all duration-300 transform hover:scale-105 theme-shadow-lg hover:theme-shadow-xl flex items-center space-x-3"
                >
                  <BookOpen size={20} />
                  <span>{t('viewArticles')}</span>
                </LanguageAwareLink>
              </>
            )}
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in delay-500">
            <StatCard 
              icon={BookOpen}
              endValue={statsData.articles.value}
              label={statsData.articles.label}
              suffix={statsData.articles.suffix}
              delay={0}
            />
            
            <StatCard 
              icon={Stethoscope}
              endValue={statsData.doctors.value}
              label={statsData.doctors.label}
              suffix={statsData.doctors.suffix}
              delay={300}
            />
            
            <StatCard 
              icon={Users}
              endValue={statsData.patients.value}
              label={statsData.patients.label}
              suffix={statsData.patients.suffix}
              delay={600}
            />
          </div>
          
          {/* Medical Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center space-x-8 opacity-60 animate-fade-in delay-700">
            <div className="flex items-center space-x-2 theme-text-muted">
              <Shield size={18} />
              <span className="text-sm font-medium">Tasdiqlangan Tibbiy Kontent</span>
            </div>
            <div className="flex items-center space-x-2 theme-text-muted">
              <Heart size={18} />
              <span className="text-sm font-medium">Bemorga Yo'naltirilgan G'amxo'rlik</span>
            </div>
            <div className="flex items-center space-x-2 theme-text-muted">
              <Activity size={18} />
              <span className="text-sm font-medium">Real Vaqt Yangilanishlari</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;