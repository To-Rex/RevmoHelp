import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Home,
  TrendingUp,
  Users,
  BookOpen,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Settings,
  Globe
} from 'lucide-react';
import { 
  getAllHomepageTranslations, 
  updateHomepageSettings 
} from '../../lib/homepageSettings';
import type { HomepageTranslation, UpdateHomepageTranslationData } from '../../lib/homepageSettings';

const HomepageManagement: React.FC = () => {
  const [translations, setTranslations] = useState<HomepageTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeLanguage, setActiveLanguage] = useState<'uz' | 'ru' | 'en'>('uz');

  const [formData, setFormData] = useState<{[key: string]: {
    title: string;
    subtitle_authenticated: string;
    subtitle_unauthenticated: string;
    stats: {
      articles: { value: number; label: string; suffix: string };
      doctors: { value: number; label: string; suffix: string };
      patients: { value: number; label: string; suffix: string };
    };
  }}>({
    uz: {
      title: '',
      subtitle_authenticated: '',
      subtitle_unauthenticated: '',
      stats: {
        articles: { value: 500, label: 'Tibbiy Maqolalar', suffix: '+' },
        doctors: { value: 50, label: 'Ekspert Shifokorlar', suffix: '+' },
        patients: { value: 10000, label: 'Yordam Berilgan Bemorlar', suffix: '+' }
      }
    },
    ru: {
      title: '',
      subtitle_authenticated: '',
      subtitle_unauthenticated: '',
      stats: {
        articles: { value: 500, label: 'Медицинские Статьи', suffix: '+' },
        doctors: { value: 50, label: 'Врачи-Эксперты', suffix: '+' },
        patients: { value: 10000, label: 'Пациентов Получили Помощь', suffix: '+' }
      }
    },
    en: {
      title: '',
      subtitle_authenticated: '',
      subtitle_unauthenticated: '',
      stats: {
        articles: { value: 500, label: 'Medical Articles', suffix: '+' },
        doctors: { value: 50, label: 'Expert Doctors', suffix: '+' },
        patients: { value: 10000, label: 'Patients Helped', suffix: '+' }
      }
    }
  });

  const languages = [
    { code: 'uz' as const, label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru' as const, label: 'Русский', flag: '🇷🇺' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' }
  ];

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    setLoading(true);
    try {
      const { data } = await getAllHomepageTranslations('hero');
      if (data) {
        setTranslations(data);
        
        // Fill form data from loaded translations
        const newFormData = { ...formData };
        data.forEach(translation => {
          newFormData[translation.language] = {
            title: translation.title,
            subtitle_authenticated: translation.subtitle_authenticated || '',
            subtitle_unauthenticated: translation.subtitle_unauthenticated || '',
            stats: translation.stats
          };
        });
        setFormData(newFormData);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sozlamalarni yuklashda xatolik' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [name]: value
      }
    }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleStatsChange = (statKey: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        stats: {
          ...prev[activeLanguage].stats,
          [statKey]: {
            ...prev[activeLanguage].stats[statKey as keyof typeof prev[typeof activeLanguage]['stats']],
            [field]: field === 'value' ? Number(value) : value
          }
        }
      }
    }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData[activeLanguage].title.trim()) {
      setMessage({ type: 'error', text: 'Sarlavha kiritilishi shart' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData: UpdateHomepageTranslationData = {
        title: formData[activeLanguage].title,
        subtitle_authenticated: formData[activeLanguage].subtitle_authenticated,
        subtitle_unauthenticated: formData[activeLanguage].subtitle_unauthenticated,
        stats: formData[activeLanguage].stats
      };

      const { data, error } = await updateHomepageSettings('hero', activeLanguage, updateData);

      if (error) {
        setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
      } else {
        setMessage({ type: 'success', text: `${languages.find(l => l.code === activeLanguage)?.label} tili uchun sozlamalar muvaffaqiyatli yangilandi!` });
        await loadTranslations();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefaults = () => {
    const defaults = {
      uz: {
        title: 'Revmatik kasalliklar haqida ishonchli ma\'lumot',
        subtitle_authenticated: 'Bemor va shifokorlar uchun professional tibbiy ma\'lumot va yo\'riqnoma platformasi',
        subtitle_unauthenticated: 'Agar bemor bo\'lsangiz, ro\'yxatdan o\'ting va professional maslahat oling',
        stats: {
          articles: { value: 500, label: 'Tibbiy Maqolalar', suffix: '+' },
          doctors: { value: 50, label: 'Ekspert Shifokorlar', suffix: '+' },
          patients: { value: 10000, label: 'Yordam Berilgan Bemorlar', suffix: '+' }
        }
      },
      ru: {
        title: 'Достоверная информация о ревматических заболеваниях',
        subtitle_authenticated: 'Профессиональная медицинская информационная платформа для пациентов и врачей',
        subtitle_unauthenticated: 'Если вы пациент, зарегистрируйтесь и получите профессиональную консультацию',
        stats: {
          articles: { value: 500, label: 'Медицинские Статьи', suffix: '+' },
          doctors: { value: 50, label: 'Врачи-Эксперты', suffix: '+' },
          patients: { value: 10000, label: 'Пациентов Получили Помощь', suffix: '+' }
        }
      },
      en: {
        title: 'Reliable information about rheumatic diseases',
        subtitle_authenticated: 'Professional medical information platform for patients and doctors',
        subtitle_unauthenticated: 'If you are a patient, register and get professional advice',
        stats: {
          articles: { value: 500, label: 'Medical Articles', suffix: '+' },
          doctors: { value: 50, label: 'Expert Doctors', suffix: '+' },
          patients: { value: 10000, label: 'Patients Helped', suffix: '+' }
        }
      }
    };
    
    setFormData(defaults);
    setMessage({ type: '', text: '' });
  };

  const openPreview = () => {
    const languagePrefix = activeLanguage === 'uz' ? '' : `/${activeLanguage}`;
    window.open(languagePrefix || '/', '_blank');
  };

  const getCompletionStatus = (lang: string) => {
    const data = formData[lang];
    const hasTitle = !!data.title.trim();
    const hasSubtitles = !!(data.subtitle_authenticated.trim() && data.subtitle_unauthenticated.trim());
    const hasStats = !!(data.stats.articles.label && data.stats.doctors.label && data.stats.patients.label);
    
    if (hasTitle && hasSubtitles && hasStats) return 'complete';
    if (hasTitle) return 'partial';
    return 'empty';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Sahifa sozlamalari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">Bosh Sahifa Boshqaruvi</h1>
          <p className="theme-text-secondary">Hero section va statistikalarni ko'p tilda boshqarish</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={openPreview}
            className="flex items-center space-x-2 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
          >
            <Eye size={18} />
            <span>Bosh sahifani ko'rish</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          )}
          <span className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Language Progress */}
      <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">Tillar bo'yicha holat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {languages.map((lang) => {
            const status = getCompletionStatus(lang.code);
            return (
              <div
                key={lang.code}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  activeLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'theme-border hover:border-blue-300'
                }`}
                onClick={() => setActiveLanguage(lang.code)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-semibold theme-text">{lang.label}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'complete' ? 'bg-green-500' :
                    status === 'partial' ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <div className="text-xs theme-text-muted">
                  {status === 'complete' ? 'To\'liq' :
                   status === 'partial' ? 'Qisman' : 'Bo\'sh'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Section Settings */}
      <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
              <Home size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text">
                Hero Section - {languages.find(l => l.code === activeLanguage)?.label}
              </h2>
              <p className="theme-text-secondary text-sm">
                {activeLanguage === 'uz' ? "O'zbek" : activeLanguage === 'ru' ? 'Rus' : 'Ingliz'} tili uchun kontent
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 theme-text-secondary hover:theme-accent px-3 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
            >
              <RotateCcw size={16} />
              <span>Standartga qaytarish</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-3">
              Asosiy Sarlavha ({languages.find(l => l.code === activeLanguage)?.label})
            </label>
            <input
              type="text"
              name="title"
              value={formData[activeLanguage].title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 theme-border border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-lg font-semibold"
              placeholder={activeLanguage === 'uz' ? "Bosh sahifa sarlavhasi" : 
                          activeLanguage === 'ru' ? "Заголовок главной страницы" : 
                          "Homepage title"}
            />
          </div>

          {/* Subtitles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-3">
                {activeLanguage === 'uz' ? "Ro'yxatdan o'tmagan foydalanuvchilar uchun" :
                 activeLanguage === 'ru' ? "Для незарегистрированных пользователей" :
                 "For unregistered users"}
              </label>
              <textarea
                name="subtitle_unauthenticated"
                value={formData[activeLanguage].subtitle_unauthenticated}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 theme-border border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                placeholder={activeLanguage === 'uz' ? "Mehmonlar uchun matn" :
                            activeLanguage === 'ru' ? "Текст для гостей" :
                            "Text for guests"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-3">
                {activeLanguage === 'uz' ? "Ro'yxatdan o'tgan foydalanuvchilar uchun" :
                 activeLanguage === 'ru' ? "Для зарегистрированных пользователей" :
                 "For registered users"}
              </label>
              <textarea
                name="subtitle_authenticated"
                value={formData[activeLanguage].subtitle_authenticated}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 theme-border border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                placeholder={activeLanguage === 'uz' ? "Ro'yxatdan o'tgan foydalanuvchilar uchun matn" :
                            activeLanguage === 'ru' ? "Текст для зарегистрированных пользователей" :
                            "Text for registered users"}
              />
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-semibold theme-text mb-6">
              {activeLanguage === 'uz' ? 'Statistika Raqamlari' :
               activeLanguage === 'ru' ? 'Статистические Данные' :
               'Statistics Numbers'}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Articles Stat */}
              <div className="theme-bg-secondary rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold theme-text">
                    {activeLanguage === 'uz' ? 'Maqolalar' :
                     activeLanguage === 'ru' ? 'Статьи' :
                     'Articles'}
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">
                      {activeLanguage === 'uz' ? 'Raqam' :
                       activeLanguage === 'ru' ? 'Число' :
                       'Number'}
                    </label>
                    <input
                      type="number"
                      value={formData[activeLanguage].stats.articles.value}
                      onChange={(e) => handleStatsChange('articles', 'value', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">
                      {activeLanguage === 'uz' ? 'Matn' :
                       activeLanguage === 'ru' ? 'Текст' :
                       'Text'}
                    </label>
                    <input
                      type="text"
                      value={formData[activeLanguage].stats.articles.label}
                      onChange={(e) => handleStatsChange('articles', 'label', e.target.value)}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">Suffix</label>
                    <input
                      type="text"
                      value={formData[activeLanguage].stats.articles.suffix}
                      onChange={(e) => handleStatsChange('articles', 'suffix', e.target.value)}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                </div>
              </div>

              {/* Doctors Stat */}
              <div className="theme-bg-secondary rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                    <Stethoscope size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold theme-text">
                    {activeLanguage === 'uz' ? 'Shifokorlar' :
                     activeLanguage === 'ru' ? 'Врачи' :
                     'Doctors'}
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">
                      {activeLanguage === 'uz' ? 'Raqam' :
                       activeLanguage === 'ru' ? 'Число' :
                       'Number'}
                    </label>
                    <input
                      type="number"
                      value={formData[activeLanguage].stats.doctors.value}
                      onChange={(e) => handleStatsChange('doctors', 'value', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">
                      {activeLanguage === 'uz' ? 'Matn' :
                       activeLanguage === 'ru' ? 'Текст' :
                       'Text'}
                    </label>
                    <input
                      type="text"
                      value={formData[activeLanguage].stats.doctors.label}
                      onChange={(e) => handleStatsChange('doctors', 'label', e.target.value)}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">Suffix</label>
                    <input
                      type="text"
                      value={formData[activeLanguage].stats.doctors.suffix}
                      onChange={(e) => handleStatsChange('doctors', 'suffix', e.target.value)}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                </div>
              </div>

              {/* Patients Stat */}
              <div className="theme-bg-secondary rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold theme-text">
                    {activeLanguage === 'uz' ? 'Bemorlar' :
                     activeLanguage === 'ru' ? 'Пациенты' :
                     'Patients'}
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">
                      {activeLanguage === 'uz' ? 'Raqam' :
                       activeLanguage === 'ru' ? 'Число' :
                       'Number'}
                    </label>
                    <input
                      type="number"
                      value={formData[activeLanguage].stats.patients.value}
                      onChange={(e) => handleStatsChange('patients', 'value', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">
                      {activeLanguage === 'uz' ? 'Matn' :
                       activeLanguage === 'ru' ? 'Текст' :
                       'Text'}
                    </label>
                    <input
                      type="text"
                      value={formData[activeLanguage].stats.patients.label}
                      onChange={(e) => handleStatsChange('patients', 'label', e.target.value)}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium theme-text-secondary mb-1">Suffix</label>
                    <input
                      type="text"
                      value={formData[activeLanguage].stats.patients.suffix}
                      onChange={(e) => handleStatsChange('patients', 'suffix', e.target.value)}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="theme-bg-secondary rounded-xl p-6">
            <h3 className="text-lg font-semibold theme-text mb-4">
              Ko'rinish Namunasi ({languages.find(l => l.code === activeLanguage)?.label})
            </h3>
            <div className="bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5 rounded-xl p-8 text-center">
              <h1 className="text-3xl font-bold theme-text mb-4">
                {formData[activeLanguage].title}
              </h1>
              <p className="text-lg theme-text-secondary mb-8">
                {formData[activeLanguage].subtitle_unauthenticated}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold theme-accent mb-1">
                    {formData[activeLanguage].stats.articles.value.toLocaleString()}{formData[activeLanguage].stats.articles.suffix}
                  </div>
                  <div className="theme-text-secondary text-sm">{formData[activeLanguage].stats.articles.label}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold theme-accent mb-1">
                    {formData[activeLanguage].stats.doctors.value.toLocaleString()}{formData[activeLanguage].stats.doctors.suffix}
                  </div>
                  <div className="theme-text-secondary text-sm">{formData[activeLanguage].stats.doctors.label}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold theme-accent mb-1">
                    {formData[activeLanguage].stats.patients.value.toLocaleString()}{formData[activeLanguage].stats.patients.suffix}
                  </div>
                  <div className="theme-text-secondary text-sm">{formData[activeLanguage].stats.patients.label}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              <Save size={20} />
              <span>
                {isSubmitting ? 'Saqlanmoqda...' : 
                 `${languages.find(l => l.code === activeLanguage)?.label} tilini saqlash`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomepageManagement;