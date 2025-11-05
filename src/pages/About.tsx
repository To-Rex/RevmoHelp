import React from 'react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  Heart, 
  Shield, 
  Target, 
  Globe,
  CheckCircle,
  Star,
  BookOpen,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { getPartners } from '../lib/partners';
import type { Partner } from '../lib/partners';

const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data } = await getPartners({ active: true });
      if (data) {
        setPartners(data);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setPartnersLoading(false);
    }
  };

  const stats = [
    { icon: Users, value: '10,000+', labelKey: 'totalUsers' },
    { icon: Stethoscope, value: '50+', labelKey: 'totalDoctors' },
    { icon: BookOpen, value: '500+', labelKey: 'totalArticles' },
    { icon: Award, value: '15+', labelKey: 'totalAwards' }
  ];

  const values = [
    {
      icon: Heart,
      titleKey: 'patientCare',
      descriptionKey: 'patientCareDesc'
    },
    {
      icon: Shield,
      titleKey: 'reliability',
      descriptionKey: 'reliabilityDesc'
    },
    {
      icon: Target,
      titleKey: 'professionalApproach',
      descriptionKey: 'professionalApproachDesc'
    },
    {
      icon: Globe,
      titleKey: 'openness',
      descriptionKey: 'opennessDesc'
    }
  ];

  const team = [
    {
      name: 'Dr. Aziza Karimova',
      roleKey: 'chiefRheumatologist',
      image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400',
      descriptionKey: 'internationalCertificate'
    },
    {
      name: 'Dr. Bobur Toshmatov',
      roleKey: 'orthopedistTraumatologist',
      image: 'https://images.pexels.com/photos/6098828/pexels-photo-6098828.jpeg?auto=compress&cs=tinysrgb&w=400',
      descriptionKey: 'surgerySpecialist'
    },
    {
      name: 'Dr. Nilufar Abdullayeva',
      roleKey: 'rehabilitationSpecialist',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      descriptionKey: 'physicalTherapyExpert'
    },
    {
      name: 'Dr. Sardor Rahimov',
      roleKey: 'internalMedicineSpecialist',
      image: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=400',
      descriptionKey: 'cardiologyExpert'
    }
  ];

  const achievements = [
    {
      year: '2020',
      titleKey: 'revmoinfoEstablished',
      descriptionKey: 'firstPlatformDesc'
    },
    {
      year: '2021',
      titleKey: 'first1000Users',
      descriptionKey: 'platformGrowthDesc'
    },
    {
      year: '2022',
      titleKey: 'internationalPartnership',
      descriptionKey: 'europeanAssociationDesc'
    },
    {
      year: '2023',
      titleKey: 'mobileAppLaunched',
      descriptionKey: 'mobileAppDesc'
    },
    {
      year: '2024',
      titleKey: 'over10000Users',
      descriptionKey: 'platformServingDesc'
    }
  ];

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Biz Haqimizda"
        description="Revmohelp - O'zbekistondagi eng yirik revmatik kasalliklar bo'yicha ma'lumot platformasi. Bizning missiya, jamoa va yutuqlarimiz haqida."
        keywords="revmohelp haqida, tibbiy platforma, revmatik kasalliklar, o'zbekiston"
        url="https://revmohelp.uz/about"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Building2 size={16} className="text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">About Revmoinfo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6">
              <span className="text-primary-500">{t('aboutTitle')}</span>
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8">
              {t('aboutSubtitle')}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 mt-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in hover-medical"
                  style={{ animationDelay: `${index * 100}ms`, boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold theme-text mb-2">{stat.value}</div>
                  <div className="theme-text-secondary">{t(stat.labelKey)}</div>
                </div>
              );
            })}
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-left hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Target size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold theme-text mb-4">{t('ourMission')}</h2>
              <p className="theme-text-secondary leading-relaxed mb-6">
                {t('missionText')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="theme-text-secondary">{t('qualityMedicalInfo')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="theme-text-secondary">{t('professionalAdvice')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="theme-text-secondary">{t('patientDoctorConnection')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-right hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={32} className="text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold theme-text mb-4">{t('ourVision')}</h2>
              <p className="theme-text-secondary leading-relaxed mb-6">
                {t('visionText')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="theme-text-secondary">{t('regionalLeadership')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="theme-text-secondary">{t('innovativeSolutions')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="theme-text-secondary">{t('internationalStandards')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold theme-text mb-4">{t('ourValues')}</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                {t('operateBasedOnValues')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon size={28} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold theme-text mb-3">{t(value.titleKey)}</h3>
                    <p className="theme-text-secondary text-sm leading-relaxed">{t(value.descriptionKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold theme-text mb-4">{t('ourTeam')}</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                {t('experiencedTeamWorking')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms`, boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold theme-text mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-semibold mb-3">{t(member.roleKey)}</p>
                    <p className="theme-text-secondary text-sm">
                      15 {t('yearsExperience')}, {t(member.descriptionKey)}
                    </p>
                    <div className="flex items-center mt-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={16} className="text-yellow-500 fill-current" />
                      ))}
                      <span className="theme-text-secondary text-sm ml-2">5.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold theme-text mb-4">{t('ourAchievements')}</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                {t('developmentHistoryPlatform')}
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
              <div className="space-y-12">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} animate-fade-in`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                        <div className="text-2xl font-bold text-blue-600 mb-2">{achievement.year}</div>
                        <h3 className="text-lg font-bold theme-text mb-2">{t(achievement.titleKey)}</h3>
                        <p className="theme-text-secondary">{t(achievement.descriptionKey)}</p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Partners */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold theme-text mb-4">{t('ourPartners')}</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                {t('workingWithPartners')}
              </p>
            </div>
            {partnersLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="theme-text-muted">
                  {t('loadingPartners')}
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div className="flex animate-scroll-horizontal">
                  {/* Birinchi to'plam */}
                  {partners.concat(partners).map((partner, index) => (
                    <Link
                      to={`/partners/${partner.slug}`}
                      key={`${partner.id}-${index}`}
                      className="group flex-shrink-0 text-center mx-6 animate-fade-in transform hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${(index % partners.length) * 100}ms` }}
                    >
                      {/* Yumaloq Partner Logo */}
                      <div className="relative mb-4">
                        {partner.logo_url ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg border-4 border-white dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg border-4 border-white dark:border-gray-700">
                            <Building2 size={24} className="theme-accent" />
                          </div>
                        )}
                      </div>

                      {/* Partner Name */}
                      <div>
                        <h3 className="text-sm font-semibold theme-text text-center group-hover:theme-accent transition-colors duration-300 line-clamp-2 leading-tight max-w-24 mx-auto">
                          {partner.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-12 text-center text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <h2 className="text-3xl font-bold mb-4">{t('contactUs')}</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('haveQuestions')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-8">
              <div className="flex items-center space-x-2">
                <Mail size={20} />
                <span>revmohelp@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={20} />
                <span>+998 (93) 200 10 22</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={20} />
                <span>
                  {i18n.language === 'ru' ? 'Ташкент, Узбекистан' : 
                   i18n.language === 'en' ? 'Tashkent, Uzbekistan' : 
                   'Toshkent, O\'zbekiston'}
                </span>
              </div>
            </div>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              {t('contactUsBtn')}
            </button>
            <p className="mt-4 text-blue-100">
              {t('aboutDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;