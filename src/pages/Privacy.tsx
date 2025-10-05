import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Globe,
  Server,
  Key
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const Privacy: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: Database,
      title: 'Ma\'lumotlar To\'plash',
      content: 'Biz faqat zarur bo\'lgan shaxsiy ma\'lumotlaringizni to\'playmiz: ism, email, telefon raqam va tibbiy tarixingiz (agar siz ruxsat bersangiz). Bu ma\'lumotlar sizga yaxshiroq xizmat ko\'rsatish uchun ishlatiladi.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Lock,
      title: 'Ma\'lumotlar Himoyasi',
      content: 'Barcha shaxsiy ma\'lumotlaringiz zamonaviy shifrlash texnologiyalari bilan himoyalangan. Biz SSL sertifikati va 256-bit shifrlashdan foydalanamiz. Ma\'lumotlaringiz xavfsiz serverlarimizda saqlanadi.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: UserCheck,
      title: 'Ma\'lumotlardan Foydalanish',
      content: 'Sizning ma\'lumotlaringiz faqat tibbiy xizmatlar ko\'rsatish, maslahat berish va platformani yaxshilash uchun ishlatiladi. Biz hech qachon ma\'lumotlaringizni uchinchi shaxslarga sotmaymiz.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Eye,
      title: 'Ma\'lumotlarga Kirish',
      content: 'Siz istalgan vaqtda o\'z ma\'lumotlaringizni ko\'rish, o\'zgartirish yoki o\'chirish huquqiga egasiz. Profil sahifangizda barcha ma\'lumotlaringizni boshqarishingiz mumkin.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Server,
      title: 'Ma\'lumotlar Saqlash',
      content: 'Ma\'lumotlaringiz O\'zbekiston hududi ichidagi xavfsiz serverlarimizda saqlanadi. Biz xalqaro ma\'lumotlar himoyasi standartlariga amal qilamiz va muntazam xavfsizlik tekshiruvlarini o\'tkazamiz.',
      color: 'bg-teal-100 text-teal-600'
    },
    {
      icon: Key,
      title: 'Cookie va Kuzatuv',
      content: 'Biz faqat zarur cookie-lardan foydalanamiz: autentifikatsiya, til sozlamalari va tema. Reklama yoki kuzatuv cookie-lari ishlatmaymiz. Siz cookie sozlamalarini nazorat qilishingiz mumkin.',
      color: 'bg-red-100 text-red-600'
    }
  ];

  const rights = [
    'Ma\'lumotlaringizni ko\'rish va nusxasini olish',
    'Noto\'g\'ri ma\'lumotlarni tuzatish',
    'Ma\'lumotlaringizni o\'chirish (o\'chirish huquqi)',
    'Ma\'lumotlar qayta ishlanishini cheklash',
    'Ma\'lumotlar portativligi',
    'Avtomatik qaror qabul qilishga qarshi chiqish'
  ];

  const contacts = [
    { icon: Mail, label: 'Email', value: 'privacy@revmoinfo.uz' },
    { icon: Phone, label: 'Telefon', value: '+998 71 123 45 67' },
    { icon: Globe, label: 'Manzil', value: 'Toshkent, Yunusobod tumani' }
  ];

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Maxfiylik Siyosati"
        description="Revmohelp platformasining maxfiylik siyosati. Shaxsiy ma'lumotlaringiz qanday himoyalanishi va ishlatilishi haqida."
        keywords="maxfiylik siyosati, shaxsiy ma'lumotlar, ma'lumotlar himoyasi, GDPR"
        url="https://revmohelp.uz/privacy"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/50 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Shield size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">Privacy & Security</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Maxfiylik</span> Siyosati
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8 animate-slide-up delay-200">
              Sizning shaxsiy ma'lumotlaringiz bizning eng muhim ustuvorligimizdir. 
              Biz qanday qilib ma'lumotlaringizni himoya qilishimiz va ishlatishimiz haqida batafsil ma'lumot.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm theme-text-tertiary animate-fade-in delay-300">
              <div className="flex items-center space-x-2">
                <Lock size={16} className="text-green-600" />
                <span>256-bit shifrlash</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-blue-600" />
                <span>GDPR muvofiq</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-teal-600" />
                <span>Xavfsiz saqlash</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Last Updated */}
          <div className="text-center mb-12 animate-fade-in delay-400">
            <div className="inline-flex items-center space-x-2 theme-bg-secondary rounded-full px-4 py-2">
              <Calendar size={16} className="theme-text-muted" />
              <span className="theme-text-secondary text-sm">Oxirgi yangilanish: 18 Yanvar, 2024</span>
            </div>
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl theme-shadow-lg theme-border border p-8 hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in hover-medical"
                  style={{ animationDelay: `${index * 100}ms` }}
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

          {/* Your Rights */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8 mb-16 animate-slide-up delay-600">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold theme-text mb-4">Sizning Huquqlaringiz</h2>
              <p className="theme-text-secondary max-w-2xl mx-auto">
                Ma'lumotlar himoyasi qonunlariga muvofiq, sizda quyidagi huquqlar mavjud:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rights.map((right, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 theme-bg-secondary rounded-xl hover:theme-shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${(index + 6) * 100}ms` }}
                >
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="theme-text-secondary">{right}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 mb-16 border-l-4 border-orange-500 animate-slide-up delay-800">
            <div className="flex items-start space-x-4">
              <AlertTriangle size={24} className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-2">Muhim Eslatma</h3>
                <p className="text-orange-800 dark:text-orange-300 leading-relaxed">
                  Ushbu platforma tibbiy ma'lumot berish maqsadida yaratilgan. Bu yerda berilgan ma'lumotlar 
                  shifokor maslahati o'rnini bosa olmaydi. Har qanday tibbiy muammo uchun mutaxassis shifokorga murojaat qiling.
                </p>
              </div>
            </div>
          </div>

          {/* Contact for Privacy */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8 animate-zoom-in delay-1000">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold theme-text mb-4">Maxfiylik Bo'yicha Savollar</h2>
              <p className="theme-text-secondary">
                Maxfiylik siyosati yoki ma'lumotlaringiz haqida savollaringiz bormi? Biz bilan bog'laning.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contacts.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div
                    key={index}
                    className="text-center p-6 theme-bg-secondary rounded-xl hover:theme-shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${(index + 10) * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold theme-text mb-2">{contact.label}</h4>
                    <p className="theme-text-secondary text-sm">{contact.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;