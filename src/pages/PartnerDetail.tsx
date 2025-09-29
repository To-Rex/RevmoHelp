import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Building2, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  Star,
  Award,
  Users,
  Heart,
  GraduationCap,
  Cpu,
  Briefcase,
  Calendar,
  Share2,
  CheckCircle
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { getPartnerBySlug } from '../lib/partners';
import type { Partner } from '../lib/partners';

const PartnerDetail: React.FC = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadPartner();
    }
  }, [slug]);

  const loadPartner = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const { data, error } = await getPartnerBySlug(slug);
      
      if (error) {
        setError('Hamkor topilmadi');
      } else if (data) {
        setPartner(data);
      }
    } catch (error) {
      setError('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return Heart;
      case 'education': return GraduationCap;
      case 'technology': return Cpu;
      case 'association': return Users;
      default: return Briefcase;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-red-100 text-red-600';
      case 'education': return 'bg-blue-100 text-blue-600';
      case 'technology': return 'bg-purple-100 text-purple-600';
      case 'association': return 'bg-green-100 text-green-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'medical': return 'Tibbiy muassasa';
      case 'education': return 'Ta\'lim muassasasi';
      case 'technology': return 'Texnologiya';
      case 'association': return 'Assotsiatsiya';
      default: return 'Umumiy';
    }
  };

  const handleShare = async () => {
    if (navigator.share && partner) {
      try {
        await navigator.share({
          title: partner.name,
          text: partner.description || '',
          url: window.location.href,
        });
      } catch (error) {
        navigator.clipboard.writeText(window.location.href);
        alert('Havola nusxalandi!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Havola nusxalandi!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Hamkor ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">Hamkor topilmadi</h1>
          <p className="theme-text-secondary mb-6">Siz qidirayotgan hamkor mavjud emas yoki o'chirilgan.</p>
          <Link
            to="/about"
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Orqaga qaytish</span>
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(partner.partnership_type);

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title={`${partner.name} - Hamkor`}
        description={partner.description || `${partner.name} - Revmoinfo hamkori`}
        keywords={`${partner.name}, hamkor, ${getTypeLabel(partner.partnership_type)}`}
        url={`https://revmoinfo.uz/partners/${partner.slug}`}
      />

      <div className="min-h-screen theme-bg">
        {/* Header */}
        <div className="theme-bg theme-shadow theme-border border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              to="/about"
              className="inline-flex items-center space-x-2 theme-text-secondary hover:theme-accent transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span>Hamkorlarga qaytish</span>
            </Link>
          </div>
        </div>

        {/* Partner Profile Header */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-teal-600/5 dark:from-blue-400/3 dark:to-teal-400/3"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border overflow-hidden animate-fade-in">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  {/* Partner Logo */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="w-32 h-32 object-contain rounded-2xl theme-shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 theme-bg-tertiary rounded-2xl flex items-center justify-center">
                          <Building2 size={48} className="theme-text-muted opacity-50" />
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute -top-2 -right-2">
                        <div className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(partner.partnership_type)} flex items-center space-x-1 shadow-lg`}>
                          <TypeIcon size={16} />
                          <span>{getTypeLabel(partner.partnership_type)}</span>
                        </div>
                      </div>

                      {/* Featured Badge */}
                      {partner.featured && (
                        <div className="absolute -bottom-2 -left-2">
                          <div className="px-3 py-1 text-sm font-medium bg-yellow-500 text-white rounded-full flex items-center space-x-1 shadow-lg">
                            <Star size={14} />
                            <span>Asosiy hamkor</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Partner Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold theme-text mb-4">
                      {partner.name}
                    </h1>
                    
                    {partner.description && (
                      <p className="text-lg theme-text-secondary mb-6 leading-relaxed">
                        {partner.description}
                      </p>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                      {partner.website_url && (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105"
                        >
                          <Globe size={18} />
                          <span>Veb-saytga o'tish</span>
                          <ExternalLink size={16} />
                        </a>
                      )}
                      
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 theme-border border theme-text-secondary px-6 py-3 rounded-xl font-semibold hover:theme-bg-tertiary transition-colors duration-200"
                      >
                        <Share2 size={18} />
                        <span>Ulashish</span>
                      </button>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center md:justify-start space-x-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        partner.active
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {partner.active ? 'Faol hamkor' : 'Faol emas'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Details */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-8">
              <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
                <h2 className="text-2xl font-bold theme-text mb-6">Aloqa Ma'lumotlari</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partner.contact_email && (
                    <div className="flex items-center space-x-4 p-4 theme-bg-secondary rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                        <Mail size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold theme-text">Email</h3>
                        <a
                          href={`mailto:${partner.contact_email}`}
                          className="theme-accent hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          {partner.contact_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {partner.contact_phone && (
                    <div className="flex items-center space-x-4 p-4 theme-bg-secondary rounded-xl">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                        <Phone size={20} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold theme-text">Telefon</h3>
                        <a
                          href={`tel:${partner.contact_phone}`}
                          className="theme-accent hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          {partner.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {partner.address && (
                    <div className="flex items-center space-x-4 p-4 theme-bg-secondary rounded-xl md:col-span-2">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                        <MapPin size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold theme-text">Manzil</h3>
                        <p className="theme-text-secondary">{partner.address}</p>
                      </div>
                    </div>
                  )}

                  {partner.website_url && (
                    <div className="flex items-center space-x-4 p-4 theme-bg-secondary rounded-xl md:col-span-2">
                      <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center">
                        <Globe size={20} className="text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold theme-text">Veb-sayt</h3>
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="theme-accent hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <span>{partner.website_url.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Partnership Information */}
              <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
                <h2 className="text-2xl font-bold theme-text mb-6">Hamkorlik Haqida</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${getTypeColor(partner.partnership_type)} rounded-xl flex items-center justify-center`}>
                      <TypeIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold theme-text">Hamkorlik turi</h3>
                      <p className="theme-text-secondary">{getTypeLabel(partner.partnership_type)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                      <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold theme-text">Hamkorlik boshlangan</h3>
                      <p className="theme-text-secondary">
                        {new Date(partner.created_at).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {partner.featured && (
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
                        <Star size={20} className="text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold theme-text">Maxsus status</h3>
                        <p className="theme-text-secondary">Asosiy hamkor</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Contact */}
              <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
                <h3 className="text-lg font-bold theme-text mb-4">Tezkor Aloqa</h3>
                
                <div className="space-y-3">
                  {partner.contact_phone && (
                    <a
                      href={`tel:${partner.contact_phone}`}
                      className="w-full flex items-center space-x-3 p-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors duration-200"
                    >
                      <Phone size={18} />
                      <span className="font-medium">Qo'ng'iroq qilish</span>
                    </a>
                  )}
                  
                  {partner.contact_email && (
                    <a
                      href={`mailto:${partner.contact_email}`}
                      className="w-full flex items-center space-x-3 p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors duration-200"
                    >
                      <Mail size={18} />
                      <span className="font-medium">Email yuborish</span>
                    </a>
                  )}
                  
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center space-x-3 p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors duration-200"
                    >
                      <Globe size={18} />
                      <span className="font-medium">Veb-saytga o'tish</span>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Partnership Stats */}
              <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
                <h3 className="text-lg font-bold theme-text mb-4">Hamkorlik Ma'lumotlari</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="theme-text-secondary">Tartib raqami</span>
                    <span className="font-semibold theme-text">#{partner.order_index}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="theme-text-secondary">Holat</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      partner.active
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {partner.active ? 'Faol' : 'Faol emas'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="theme-text-secondary">Hamkorlik turi</span>
                    <span className="font-semibold theme-text">{getTypeLabel(partner.partnership_type)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="theme-text-secondary">Qo'shilgan sana</span>
                    <span className="font-semibold theme-text">
                      {new Date(partner.created_at).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
                <h3 className="text-lg font-bold theme-text mb-4">Ulashish</h3>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 theme-accent-bg text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  <Share2 size={18} />
                  <span>Hamkorni ulashish</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PartnerDetail;