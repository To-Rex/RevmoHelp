import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Lock, 
  Server, 
  Key, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Database,
  Globe,
  Zap,
  FileText,
  Users,
  Clock,
  Activity,
  Wifi,
  HardDrive
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const DataSecurity: React.FC = () => {
  const { t } = useTranslation();

  const securityMeasures = [
    {
      icon: Lock,
      title: 'SSL/TLS Shifrlash',
      description: 'Barcha ma\'lumotlar 256-bit SSL shifrlash bilan himoyalangan',
      level: 'Yuqori',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Server,
      title: 'Xavfsiz Serverlar',
      description: 'Ma\'lumotlar ISO 27001 sertifikatlangan data markazlarda saqlanadi',
      level: 'Maksimal',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Key,
      title: 'Ikki Bosqichli Autentifikatsiya',
      description: 'Qo\'shimcha himoya qatlami sifatida 2FA mavjud',
      level: 'Tavsiya etiladi',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Database,
      title: 'Ma\'lumotlar Zaxirasi',
      description: 'Kunlik avtomatik zaxira nusxalar yaratiladi',
      level: 'Avtomatik',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Eye,
      title: 'Kirish Nazorati',
      description: 'Barcha kirish urinishlari kuzatiladi va loglanadi',
      level: 'Doimiy',
      color: 'bg-teal-100 text-teal-600'
    },
    {
      icon: Wifi,
      title: 'Tarmoq Himoyasi',
      description: 'Firewall va DDoS himoyasi faol',
      level: '24/7',
      color: 'bg-red-100 text-red-600'
    }
  ];

  const certifications = [
    {
      name: 'ISO 27001',
      description: 'Axborot xavfsizligi boshqaruvi',
      status: 'Faol',
      icon: Shield
    },
    {
      name: 'GDPR',
      description: 'Evropa ma\'lumotlar himoyasi qoidalari',
      status: 'Muvofiq',
      icon: Globe
    },
    {
      name: 'HIPAA',
      description: 'Tibbiy ma\'lumotlar himoyasi',
      status: 'Muvofiq',
      icon: FileText
    },
    {
      name: 'SOC 2',
      description: 'Xavfsizlik va mavjudlik nazorati',
      status: 'Sertifikatlangan',
      icon: CheckCircle
    }
  ];

  const securityPractices = [
    'Muntazam xavfsizlik auditlari',
    'Penetratsiya testlari',
    'Xodimlar xavfsizlik treningi',
    'Incident javob rejasi',
    'Ma\'lumotlar shifrlash',
    'Kirish huquqlarini boshqarish',
    'Xavfsizlik monitoring',
    'Zaiflik boshqaruvi'
  ];

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Ma'lumotlar Xavfsizligi"
        description="Revmohelp platformasida ma'lumotlar xavfsizligi choralari. Sizning tibbiy ma'lumotlaringiz qanday himoyalanadi."
        keywords="ma'lumotlar xavfsizligi, tibbiy ma'lumotlar himoyasi, SSL, shifrlash"
        url="https://revmohelp.uz/data-security"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 dark:from-green-400/5 dark:to-blue-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/50 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Lock size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-300 text-sm font-medium">Data Security</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6 animate-slide-up">
              Ma'lumotlar <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Xavfsizligi</span>
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8 animate-slide-up delay-200">
              Sizning tibbiy ma'lumotlaringiz eng yuqori xavfsizlik standartlari bilan himoyalanadi. 
              Biz zamonaviy texnologiyalar va eng yaxshi amaliyotlardan foydalanamiz.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Security Measures */}
          <div className="mb-16">
            <div className="text-center mb-12 animate-fade-in delay-300">
              <h2 className="text-3xl font-bold theme-text mb-4">Xavfsizlik Choralari</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                Sizning ma'lumotlaringizni himoya qilish uchun ko'p qatlamli xavfsizlik tizimini qo'llaymiz.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityMeasures.map((measure, index) => {
                const Icon = measure.icon;
                return (
                  <div
                    key={index}
                    className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in hover-medical"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-14 h-14 ${measure.color} rounded-xl flex items-center justify-center mb-4 animate-pulse-medical`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold theme-text mb-2">{measure.title}</h3>
                    <p className="theme-text-secondary text-sm mb-3 leading-relaxed">{measure.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        measure.level === 'Maksimal' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        measure.level === 'Yuqori' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {measure.level}
                      </span>
                      <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-16">
            <div className="text-center mb-12 animate-fade-in delay-600">
              <h2 className="text-3xl font-bold theme-text mb-4">Sertifikatlar va Standartlar</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                Biz xalqaro xavfsizlik standartlariga amal qilamiz va muntazam sertifikatsiya o'tkazamiz.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, index) => {
                const Icon = cert.icon;
                return (
                  <div
                    key={index}
                    className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon size={28} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold theme-text mb-2">{cert.name}</h3>
                    <p className="theme-text-secondary text-sm mb-3">{cert.description}</p>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                      {cert.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Practices */}
          <div className="mb-16">
            <div className="text-center mb-12 animate-fade-in delay-800">
              <h2 className="text-3xl font-bold theme-text mb-4">Xavfsizlik Amaliyotlari</h2>
              <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
                Doimiy xavfsizlikni ta'minlash uchun qo'llaydigan amaliyotlarimiz.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {securityPractices.map((practice, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 theme-bg rounded-xl theme-shadow hover:theme-shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="theme-text-secondary text-sm">{practice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-8 text-white text-center animate-zoom-in delay-1000">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Xavfsizlik Hodisasi</h2>
            <p className="text-red-100 mb-6 max-w-2xl mx-auto">
              Agar sizning hisobingizda shubhali faollik sezgan bo'lsangiz yoki xavfsizlik muammosi bo'lsa, 
              darhol biz bilan bog'laning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="mailto:security@revmoinfo.uz"
                className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors duration-200 transform hover:scale-105"
              >
                security@revmoinfo.uz
              </a>
              <a
                href="tel:+998711234567"
                className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors duration-200 transform hover:scale-105"
              >
                +998 71 123 45 67
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSecurity;