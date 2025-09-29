import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Users,
  Stethoscope,
  Shield,
  Heart,
  CheckCircle,
  ArrowRight,
  Book,
  UserPlus,
  Lock
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  popular: boolean;
}

const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<number[]>([1, 2]); // First two items open by default

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: 'Revmoinfo platformasi nima?',
      answer: 'Revmoinfo - bu revmatik kasalliklar bo\'yicha professional tibbiy ma\'lumotlar platformasidir. Bu yerda siz ishonchli tibbiy ma\'lumotlar, shifokor maslahatlari va boshqa bemorlarning tajribalarini topishingiz mumkin.',
      category: 'general',
      popular: true
    },
    {
      id: 2,
      question: 'Platformadan foydalanish pullikmi?',
      answer: 'Platformaning asosiy xizmatlari - maqolalarni o\'qish, umumiy ma\'lumotlar olish va savol-javob bo\'limidan foydalanish mutlaqo bepul. Faqat individual shifokor konsultatsiyalari uchun alohida to\'lov talab etilishi mumkin.',
      category: 'general',
      popular: true
    },
    {
      id: 3,
      question: 'Qanday qilib ro\'yxatdan o\'tishim mumkin?',
      answer: 'Ro\'yxatdan o\'tish juda oson! "Ro\'yxatdan o\'tish" tugmasini bosing, kerakli ma\'lumotlarni kiriting. Siz email va parol orqali yoki Google hisobi orqali ro\'yxatdan o\'tishingiz mumkin.',
      category: 'account',
      popular: true
    },
    {
      id: 4,
      question: 'Shifokor bilan qanday bog\'lanishim mumkin?',
      answer: 'Shifokorlar sahifasiga o\'ting, kerakli mutaxassisni tanlang va uning profili orqali bog\'lanish ma\'lumotlarini toping. Shuningdek, savol-javob bo\'limida savol berib, shifokorlardan javob olishingiz mumkin.',
      category: 'doctors',
      popular: true
    },
    {
      id: 5,
      question: 'Ma\'lumotlarim xavfsizligini qanday kafolatlaysizlar?',
      answer: 'Biz eng yuqori xavfsizlik standartlaridan foydalanamiz: 256-bit SSL shifrlash, xavfsiz serverlar, ikki bosqichli autentifikatsiya. Sizning shaxsiy ma\'lumotlaringiz hech qachon uchinchi shaxslarga berilmaydi.',
      category: 'security',
      popular: false
    },
    {
      id: 6,
      question: 'Tibbiy maslahat olish uchun nima qilishim kerak?',
      answer: 'Avval ro\'yxatdan o\'ting, keyin shifokorlar ro\'yxatidan kerakli mutaxassisni tanlang. Siz online konsultatsiya yoki shaxsiy uchrashuvni belgilashingiz mumkin. Shoshilinch holatlar uchun 103 ga qo\'ng\'iroq qiling.',
      category: 'medical',
      popular: false
    },
    {
      id: 7,
      question: 'Qanday qilib parolimni o\'zgartirishim mumkin?',
      answer: 'Profilingizga kiring, "Xavfsizlik" bo\'limini tanlang va "Parolni o\'zgartirish" tugmasini bosing. Joriy parolingizni kiritib, yangi parol o\'rnating. Google orqali kirgan bo\'lsangiz, Google hisobingizda parolni o\'zgartiring.',
      category: 'account',
      popular: false
    },
    {
      id: 8,
      question: 'Platformada qanday ma\'lumotlar mavjud?',
      answer: 'Platformada revmatik kasalliklar bo\'yicha professional maqolalar, shifokor maslahatlari, kasallik belgilari, davolash usullari, profilaktika choralari va boshqa foydali tibbiy ma\'lumotlar mavjud.',
      category: 'medical',
      popular: false
    },
    {
      id: 9,
      question: 'Savol-javob bo\'limi qanday ishlaydi?',
      answer: 'Savol-javob bo\'limida siz tibbiy savollaringizni berishingiz mumkin. Professional shifokorlar sizning savollaringizga javob berishadi. Boshqa bemorlarning savollarini ham ko\'rib, foydali ma\'lumotlar olishingiz mumkin.',
      category: 'general',
      popular: false
    },
    {
      id: 10,
      question: 'Mobil ilovangiz bormi?',
      answer: 'Hozircha mobil ilova mavjud emas, lekin veb-saytimiz barcha qurilmalarda (telefon, planshet, kompyuter) mukammal ishlaydi. Yaqin kelajakda mobil ilova ham chiqariladi.',
      category: 'technical',
      popular: false
    }
  ];

  const categories = [
    { value: 'all', label: 'Barcha savollar', count: faqData.length },
    { value: 'general', label: 'Umumiy', count: faqData.filter(f => f.category === 'general').length },
    { value: 'account', label: 'Hisob', count: faqData.filter(f => f.category === 'account').length },
    { value: 'medical', label: 'Tibbiy', count: faqData.filter(f => f.category === 'medical').length },
    { value: 'doctors', label: 'Shifokorlar', count: faqData.filter(f => f.category === 'doctors').length },
    { value: 'security', label: 'Xavfsizlik', count: faqData.filter(f => f.category === 'security').length },
    { value: 'technical', label: 'Texnik', count: faqData.filter(f => f.category === 'technical').length }
  ];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFAQ = faqData.filter(item => item.popular);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return HelpCircle;
      case 'account': return UserPlus;
      case 'medical': return Stethoscope;
      case 'doctors': return Users;
      case 'security': return Shield;
      case 'technical': return Lock;
      default: return HelpCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-600';
      case 'account': return 'bg-green-100 text-green-600';
      case 'medical': return 'bg-red-100 text-red-600';
      case 'doctors': return 'bg-purple-100 text-purple-600';
      case 'security': return 'bg-orange-100 text-orange-600';
      case 'technical': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Tez-tez Beriladigan Savollar"
        description="Revmohelp platformasi haqida eng ko'p beriladigan savollar va javoblar. Yordam va qo'llanma."
        keywords="FAQ, savollar, javoblar, yordam, qo'llanma, revmohelp"
        url="https://revmohelp.uz/faq"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-blue-600/10 dark:from-teal-400/5 dark:to-blue-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-teal-100 dark:bg-teal-900/50 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <HelpCircle size={16} className="text-teal-600 dark:text-teal-400" />
              <span className="text-teal-800 dark:text-teal-300 text-sm font-medium">Frequently Asked Questions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6 animate-slide-up">
              Tez-tez Beriladigan <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Savollar</span>
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8 animate-slide-up delay-200">
              Platformamiz haqida eng ko'p beriladigan savollar va ularning batafsil javoblari. 
              Kerakli javobni topa olmagan bo'lsangiz, biz bilan bog'laning.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Search and Filter */}
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 mb-12 animate-slide-up delay-300">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                  <input
                    type="text"
                    placeholder="Savollar bo'yicha qidiring..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 theme-bg theme-text"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 theme-bg theme-text"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Popular Questions */}
          <div className="mb-16">
            <div className="text-center mb-8 animate-fade-in delay-400">
              <h2 className="text-2xl font-bold theme-text mb-4">Mashhur Savollar</h2>
              <p className="theme-text-secondary">Eng ko'p beriladigan savollar</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularFAQ.map((item, index) => {
                const CategoryIcon = getCategoryIcon(item.category);
                return (
                  <div
                    key={item.id}
                    className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${getCategoryColor(item.category)} rounded-xl flex items-center justify-center`}>
                          <CategoryIcon size={20} />
                        </div>
                        <h3 className="text-lg font-semibold theme-text flex-1">{item.question}</h3>
                      </div>
                      <button className="theme-text-muted hover:theme-accent transition-colors duration-200">
                        {openItems.includes(item.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                    
                    {openItems.includes(item.id) && (
                      <div className="animate-slide-down">
                        <p className="theme-text-secondary leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Questions */}
          <div className="mb-16">
            <div className="text-center mb-8 animate-fade-in delay-600">
              <h2 className="text-2xl font-bold theme-text mb-4">Barcha Savollar</h2>
              <p className="theme-text-secondary">
                <span className="font-semibold theme-text">{filteredFAQ.length}</span> ta savol topildi
              </p>
            </div>
            
            <div className="space-y-4">
              {filteredFAQ.map((item, index) => {
                const CategoryIcon = getCategoryIcon(item.category);
                return (
                  <div
                    key={item.id}
                    className="theme-bg rounded-xl theme-shadow hover:theme-shadow-lg transition-all duration-300 theme-border border animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-center justify-between p-6 text-left hover:theme-bg-tertiary transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-8 h-8 ${getCategoryColor(item.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <CategoryIcon size={16} />
                        </div>
                        <h3 className="text-lg font-semibold theme-text">{item.question}</h3>
                        {item.popular && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                            Mashhur
                          </span>
                        )}
                      </div>
                      <div className="theme-text-muted">
                        {openItems.includes(item.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    
                    {openItems.includes(item.id) && (
                      <div className="px-6 pb-6 animate-slide-down">
                        <div className="pl-12">
                          <p className="theme-text-secondary leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* No Results */}
          {filteredFAQ.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="theme-text-muted mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold theme-text-secondary mb-2">
                Hech qanday savol topilmadi
              </h3>
              <p className="theme-text-muted mb-6">
                Qidiruv so'zini o'zgartiring yoki boshqa kategoriyani tanlang
              </p>
            </div>
          )}

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-3xl p-8 text-white text-center animate-zoom-in delay-800">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-medical">
              <MessageSquare size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Javob Topa Olmadingizmi?</h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              Agar sizning savolingizga javob topa olmagan bo'lsangiz, biz bilan bog'laning. 
              Bizning yordam xizmati 24/7 ishlaydi va sizga yordam berishga tayyor.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="mailto:support@revmoinfo.uz"
                className="flex items-center space-x-2 bg-white text-teal-600 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-colors duration-200 transform hover:scale-105"
              >
                <Mail size={20} />
                <span>Email Yuborish</span>
              </a>
              <a
                href="tel:+998711234567"
                className="flex items-center space-x-2 border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors duration-200 transform hover:scale-105"
              >
                <Phone size={20} />
                <span>Qo'ng'iroq Qilish</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;