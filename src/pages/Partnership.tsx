import React from 'react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Handshake,
  Users,
  Globe,
  Target,
  Award,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Heart,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { getPartners } from '../lib/partners';
import type { Partner } from '../lib/partners';

const Partnership: React.FC = () => {
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
    { icon: Users, value: '50+', labelKey: 'activePartners' },
    { icon: Globe, value: '15+', labelKey: 'countries' },
    { icon: Heart, value: '100K+', labelKey: 'patientsHelped' },
    { icon: Award, value: '25+', labelKey: 'successfulProjects' }
  ];

  const partnershipTypes = [
    {
      icon: Shield,
      titleKey: 'medicalInstitutions',
      descriptionKey: 'medicalInstitutionsDesc',
      benefits: ['jointResearch', 'sharedResources', 'professionalDevelopment']
    },
    {
      icon: TrendingUp,
      titleKey: 'pharmaCompanies',
      descriptionKey: 'pharmaCompaniesDesc',
      benefits: ['clinicalTrials', 'drugDevelopment', 'marketAccess']
    },
    {
      icon: Users,
      titleKey: 'healthOrganizations',
      descriptionKey: 'healthOrganizationsDesc',
      benefits: ['communityPrograms', 'healthEducation', 'policyAdvocacy']
    },
    {
      icon: Globe,
      titleKey: 'internationalPartners',
      descriptionKey: 'internationalPartnersDesc',
      benefits: ['globalCollaboration', 'knowledgeExchange', 'crossBorderCare']
    }
  ];

  const benefits = [
    {
      icon: Target,
      titleKey: 'expandedReach',
      descriptionKey: 'expandedReachDesc'
    },
    {
      icon: Award,
      titleKey: 'enhancedCredibility',
      descriptionKey: 'enhancedCredibilityDesc'
    },
    {
      icon: TrendingUp,
      titleKey: 'innovationAccess',
      descriptionKey: 'innovationAccessDesc'
    },
    {
      icon: Users,
      titleKey: 'collaborativeGrowth',
      descriptionKey: 'collaborativeGrowthDesc'
    }
  ];

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Hamkorlik"
        description="Revmohelp bilan hamkorlik qilish imkoniyatlari. Tibbiy muassasalar, farmatsevtika kompaniyalari va sog'liqni saqlash tashkilotlari uchun hamkorlik dasturlari."
        keywords="hamkorlik, tibbiy hamkorlik, farmatsevtika, sog'liqni saqlash, revmohelp"
        url="https://revmohelp.uz/partnership"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Handshake size={16} className="text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">Partnership Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6">
              <span className="text-primary-500">{t('partnershipTitle')}</span>
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8">
              {t('partnershipSubtitle')}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl theme-shadow-lg theme-border border p-8 text-center animate-fade-in hover-medical"
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

          {/* Partnership Types */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold theme-text mb-4">{t('partnershipTypes')}</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                {t('partnershipTypesDesc')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partnershipTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-left hover-medical"
                    style={{ animationDelay: `${index * 100}ms`, boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                      <Icon size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold theme-text mb-4">{t(type.titleKey)}</h3>
                    <p className="theme-text-secondary leading-relaxed mb-6">
                      {t(type.descriptionKey)}
                    </p>
                    <div className="space-y-3">
                      {type.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <CheckCircle size={20} className="text-green-600" />
                          <span className="theme-text-secondary">{t(benefit)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold theme-text mb-4">{t('partnershipBenefits')}</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                {t('partnershipBenefitsDesc')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover-medical animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon size={28} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold theme-text mb-3">{t(benefit.titleKey)}</h3>
                    <p className="theme-text-secondary text-sm leading-relaxed">{t(benefit.descriptionKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Partners */}
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
                            <Handshake size={24} className="theme-accent" />
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
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('interestedInPartnership')}</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('partnershipContactDesc')}
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
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 transform hover:scale-105 inline-block"
            >
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partnership;