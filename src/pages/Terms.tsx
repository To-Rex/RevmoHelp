import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Shield, 
  Scale,
  Clock,
  Globe,
  Mail,
  Phone,
  Building2,
  Gavel,
  UserCheck,
  Ban
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const Terms: React.FC = () => {
  const { t } = useTranslation();

  const termsSection = [
    {
      icon: UserCheck,
      title: 'Foydalanuvchi Majburiyatlari',
      content: 'Platformadan foydalanishda to\'g\'ri ma\'lumotlar berish, boshqa foydalanuvchilarni hurmat qilish va tibbiy maslahatlarni shifokor ko\'rsatmasi o\'rniga ishlatmaslik majburiyatingiz.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Shield,
      title: 'Xizmat Shartlari',
      content: 'Revmoinfo tibbiy ma\'lumot berish platformasidir. Bu yerda berilgan ma\'lumotlar faqat ma\'lumot maqsadida bo\'lib, shifokor maslahati o\'rnini bosa olmaydi.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Ban,
      title: 'Taqiqlangan Harakatlar',
      content: 'Noto\'g\'ri tibbiy ma\'lumot tarqatish, spam yuborish, boshqa foydalanuvchilarni bezovta qilish va platformadan noto\'g\'ri maqsadlarda foydalanish taqiqlanadi.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Scale,
      title: 'Intellektual Mulk',
      content: 'Platformadagi barcha kontent mualliflik huquqi bilan himoyalangan. Ruxsatsiz nusxalash yoki tarqatish taqiqlanadi.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Gavel,
      title: 'Mas\'uliyat Cheklash',
      content: 'Revmoinfo platformasi tibbiy maslahat berish o\'rniga ma\'lumot taqdim etadi. Har qanday tibbiy qaror uchun shifokor bilan maslahatlashing.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Globe,
      title: 'Qonuniy Tartib',
      content: 'Ushbu shartlar O\'zbekiston Respublikasi qonunlariga muvofiq tuzilgan va har qanday nizolar sudda hal qilinadi.',
      color: 'bg-teal-100 text-teal-600'
    }
  ];

  const userRights = [
    'Platformadan bepul foydalanish',
    'Shaxsiy ma\'lumotlarni himoya qilish',
    'Xizmatdan istalgan vaqtda voz kechish',
    'Noto\'g\'ri ma\'lumotlar haqida shikoyat qilish',
    'Texnik yordam olish',
    'Ma\'lumotlarni yuklab olish'
  ];

  const prohibitedActions = [
    'Yolg\'on tibbiy ma\'lumot berish',
    'Boshqa foydalanuvchilarni aldash',
    'Spam yoki keraksiz xabarlar yuborish',
    'Platformani buzishga urinish',
    'Boshqalarning shaxsiy ma\'lumotlarini o\'g\'irlash',
    'Noto\'g\'ri maqsadlarda foydalanish'
  ];

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Foydalanish Shartlari"
        description="Revmohelp platformasining foydalanish shartlari. Huquq va majburiyatlaringiz haqida to'liq ma'lumot."
        keywords="foydalanish shartlari, huquqlar, majburiyatlar, qoidalar"
        url="https://revmohelp.uz/terms"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-400/5 dark:to-blue-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/50 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <FileText size={16} className="text-purple-600 dark:text-purple-400" />
              <span className="text-purple-800 dark:text-purple-300 text-sm font-medium">Terms of Service</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6 animate-slide-up">
              <span className="text-purple-600">Foydalanish</span> Shartlari
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8 animate-slide-up delay-200">
              Revmoinfo platformasidan foydalanish shartlari va qoidalari. 
              Iltimos, platformadan foydalanishdan oldin diqqat bilan o'qing.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm theme-text-tertiary animate-fade-in delay-300">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-blue-600" />
                <span>Oxirgi yangilanish: 18.01.2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe size={16} className="text-green-600" />
                <span>O'zbekiston qonunlari</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Main Terms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {termsSection.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="theme-bg-secondary rounded-2xl theme-shadow-lg theme-border border p-8 hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in hover-medical"
                  style={{ animationDelay: `${index * 100}ms`, boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className={`w-16 h-16 ${section.color} rounded-2xl flex items-center justify-center mb-6 animate-pulse-medical`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold theme-text mb-4">{section.title}</h3>
                  <p className="theme-text-secondary leading-relaxed">{section.content}</p>
                </div>
              );
            })}
          </div>

          {/* User Rights and Prohibitions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* User Rights */}
            <div className="theme-bg-secondary rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-left delay-600" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold theme-text mb-4">Sizning Huquqlaringiz</h2>
                <p className="theme-text-secondary">
                  Platformadan foydalanishda sizda quyidagi huquqlar mavjud:
                </p>
              </div>
              
              <div className="space-y-3">
                {userRights.map((right, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 theme-bg-secondary rounded-xl animate-fade-in"
                    style={{ animationDelay: `${(index + 6) * 100}ms` }}
                  >
                    <CheckCircle size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="theme-text-secondary">{right}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prohibited Actions */}
            <div className="theme-bg-secondary rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-right delay-600" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Ban size={32} className="text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold theme-text mb-4">Taqiqlangan Harakatlar</h2>
                <p className="theme-text-secondary">
                  Quyidagi harakatlar qat'iyan taqiqlanadi:
                </p>
              </div>
              
              <div className="space-y-3">
                {prohibitedActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 theme-bg-secondary rounded-xl animate-fade-in"
                    style={{ animationDelay: `${(index + 12) * 100}ms` }}
                  >
                    <Ban size={18} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                    <span className="theme-text-secondary">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-3xl p-8 mb-16 border-l-4 border-yellow-500 animate-slide-up delay-800">
            <div className="flex items-start space-x-4">
              <AlertTriangle size={32} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1 animate-pulse-medical" />
              <div>
                <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">Tibbiy Ogohlantirish</h3>
                <div className="space-y-3 text-yellow-900 dark:text-yellow-300 leading-relaxed">
                  <p>
                    <strong>Muhim:</strong> Ushbu platforma faqat ma'lumot berish maqsadida yaratilgan. 
                    Bu yerda berilgan ma'lumotlar shifokor maslahati, diagnostika yoki davolash o\'rnini bosa olmaydi.
                  </p>
                  <p>
                    Har qanday tibbiy muammo, simptom yoki kasallik belgilari uchun albatta malakali 
                    shifokorga murojaat qiling. Shoshilinch tibbiy yordam kerak bo'lsa 103 raqamiga qo'ng'iroq qiling.
                  </p>
                  <p>
                    Platformadagi ma'lumotlarga asoslanib mustaqil davolash qarorlari qabul qilmang. 
                    Har qanday dori yoki davolash usulini qo'llashdan oldin shifokor bilan maslahatlashing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact for Terms */}
          <div className="theme-bg-secondary rounded-3xl theme-shadow-lg theme-border border p-8 animate-zoom-in delay-1000" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold theme-text mb-4">Shartlar Bo'yicha Savollar</h2>
              <p className="theme-text-secondary">
                Foydalanish shartlari haqida savollaringiz yoki takliflaringiz bormi? Biz bilan bog'laning.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 theme-bg-secondary rounded-xl hover:theme-shadow-md transition-all duration-300 transform hover:-translate-y-1" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={20} className="text-blue-800 dark:text-blue-800" />
                </div>
                <h4 className="font-semibold theme-text mb-2">Email</h4>
                <p className="theme-text-secondary text-sm">revmohelp@gmail.com</p>
              </div>
              
              <div className="text-center p-6 theme-bg-secondary rounded-xl hover:theme-shadow-md transition-all duration-300 transform hover:-translate-y-1" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone size={20} className="text-green-800 dark:text-green-800" />
                </div>
                <h4 className="font-semibold theme-text mb-2">Telefon</h4>
                <p className="theme-text-secondary text-sm">+998 (93) 200 10 22</p>
              </div>
              
              <div className="text-center p-6 theme-bg-secondary rounded-xl hover:theme-shadow-md transition-all duration-300 transform hover:-translate-y-1" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 size={20} className="text-purple-800 dark:text-purple-800" />
                </div>
                <h4 className="font-semibold theme-text mb-2">Manzil</h4>
                <p className="theme-text-secondary text-sm">Toshkent, Yunusobod</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;