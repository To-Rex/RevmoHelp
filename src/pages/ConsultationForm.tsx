import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  Send, 
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Heart,
  Activity,
  Shield,
  MessageSquare,
  Clock,
  Users,
  Award,
  Star,
  ArrowRight
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { supabase } from '../lib/supabase';

interface ConsultationFormData {
  firstName: string;
  lastName: string;
  age: string;
  diseaseType: string;
  phone: string;
  comments: string;
}

const ConsultationForm: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ConsultationFormData>({
    firstName: '',
    lastName: '',
    age: '',
    diseaseType: '',
    phone: '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const diseaseTypes = [
    'Revmatoid artrit',
    'Osteoartroz',
    'Fibromyalgiya',
    'Ankilozlovchi spondilit',
    'Psoriatic artrit',
    'Gut',
    'Lupus',
    'Boshqa revmatik kasallik',
    'Aniq emas / Maslahat kerak'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Ismingizni kiriting');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Familiyangizni kiriting');
      return false;
    }
    if (!formData.age.trim() || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      setError('To\'g\'ri yoshni kiriting (1-120)');
      return false;
    }
    if (!formData.diseaseType) {
      setError('Kasallik turini tanlang');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Telefon raqamingizni kiriting');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Submit to Supabase
      const { data, error: submitError } = await supabase
        .from('consultation_requests')
        .insert([
          {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            age: parseInt(formData.age),
            disease_type: formData.diseaseType,
            phone: formData.phone.trim(),
            comments: formData.comments.trim()
          }
        ])
        .select();

      if (submitError) {
        throw submitError;
      }

      console.log('Consultation request submitted:', data);
      setIsSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          age: '',
          diseaseType: '',
          phone: '',
          comments: ''
        });
      }, 5000);
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg relative overflow-hidden">
      <SEOHead
        title="A'zo bo'lish"
        description="Revmohelp platformasiga a'zo bo'lish uchun ma'lumotlaringizni qoldiring. Bizning jamoamiz siz bilan bog'lanadi."
        keywords="a'zo bo'lish, ro'yxatdan o'tish, revmohelp, tibbiy platforma"
        url="https://revmohelp.uz/consultation"
      />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 theme-bg"></div>
        
        {/* Animated Medical Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 theme-gradient opacity-20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 theme-gradient-secondary opacity-15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          
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
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center space-x-2 theme-bg-secondary backdrop-blur-sm rounded-full px-6 py-3 mb-6 theme-shadow-lg theme-border border">
              <MessageSquare size={18} className="theme-accent" />
              <span className="theme-accent text-sm font-medium">{t('membershipTitle')}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6">
              {t('membershipTitle')}
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8">
              {t('membershipSubtitle')}
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center space-x-8 opacity-70">
              <div className="flex items-center space-x-2 theme-text-muted">
                <Shield size={16} />
                <span className="text-sm font-medium">{t('freeMembership')}</span>
              </div>
              <div className="flex items-center space-x-2 theme-text-muted">
                <Clock size={16} />
                <span className="text-sm font-medium">{t('quickContact')}</span>
              </div>
              <div className="flex items-center space-x-2 theme-text-muted">
                <Award size={16} />
                <span className="text-sm font-medium">{t('professionalTeam')}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 animate-zoom-in delay-200 backdrop-blur-sm bg-opacity-95">
            {isSubmitted ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-medical">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold theme-text mb-4">{t('membershipSubmitted')}</h2>
                <p className="theme-text-secondary mb-6 max-w-md mx-auto">
                  {t('membershipSubmittedDesc')}
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm theme-text-muted">
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-green-600" />
                    <span>{t('phoneContact')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare size={16} className="text-primary-600" />
                    <span>{t('membershipInfo')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold theme-text mb-2">{t('membershipForm')}</h2>
                  <p className="theme-text-secondary">{t('membershipFormDescription')}</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                    <AlertCircle size={20} className="text-red-600" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium theme-text-secondary">
                      {t('firstName')} *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 theme-text-muted group-focus-within:theme-accent transition-colors duration-200" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                        placeholder={t('enterFirstName')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium theme-text-secondary">
                      {t('lastName')} *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 theme-text-muted group-focus-within:theme-accent transition-colors duration-200" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                        placeholder={t('enterLastName')}
                      />
                    </div>
                  </div>
                </div>

                {/* Age and Disease Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium theme-text-secondary">
                      {t('age')} *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 theme-text-muted group-focus-within:theme-accent transition-colors duration-200" />
                      </div>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="120"
                        className="w-full pl-12 pr-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                        placeholder={t('enterAge')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium theme-text-secondary">
                      {t('diseaseType')} *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Stethoscope className="h-5 w-5 theme-text-muted group-focus-within:theme-accent transition-colors duration-200" />
                      </div>
                      <select
                        name="diseaseType"
                        value={formData.diseaseType}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text appearance-none"
                      >
                        <option value="">{t('selectDiseaseType')}</option>
                        {diseaseTypes.map((disease) => (
                          <option key={disease} value={disease}>
                            {disease}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium theme-text-secondary">
                    {t('phoneNumber')} *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 theme-text-muted group-focus-within:theme-accent transition-colors duration-200" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                      placeholder={t('enterPhone')}
                    />
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium theme-text-secondary">
                    {t('comments')}
                  </label>
                  <div className="relative group">
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <FileText className="h-5 w-5 theme-text-muted group-focus-within:theme-accent transition-colors duration-200" />
                    </div>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full pl-12 pr-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400 resize-none"
                      placeholder={t('commentsPlaceholder')}
                    />
                  </div>
                  <p className="text-xs theme-text-muted">
                    {t('commentsHelper')}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Yuborilmoqda...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Send size={24} />
                      <span>A'zolik So'rovi Yuborish</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </button>

                {/* Privacy Notice */}
                <div className="text-center">
                  <p className="text-xs theme-text-muted">
                    Formani yuborish orqali siz{' '}
                    <a href="/privacy" className="theme-accent hover:underline">
                      Maxfiylik siyosati
                    </a>{' '}
                    va{' '}
                    <a href="/terms" className="theme-accent hover:underline">
                      Foydalanish shartlari
                    </a>ni qabul qilasiz
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in delay-400">
            <div className="text-center p-6 theme-bg-secondary rounded-2xl theme-shadow hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold theme-text mb-2">Bepul A'zolik</h3>
              <p className="theme-text-secondary text-sm">
                Platformaga a'zo bo'lish mutlaqo bepul va majburiyatsiz
              </p>
            </div>

            <div className="text-center p-6 theme-bg-secondary rounded-2xl theme-shadow hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="theme-accent" />
              </div>
              <h3 className="text-lg font-bold theme-text mb-2">Professional Jamoa</h3>
              <p className="theme-text-secondary text-sm">
                15+ yillik tajribaga ega tibbiy mutaxassislar
              </p>
            </div>

            <div className="text-center p-6 theme-bg-secondary rounded-2xl theme-shadow hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-bold theme-text mb-2">Tez Aloqa</h3>
              <p className="theme-text-secondary text-sm">
                24 soat ichida jamoamiz siz bilan bog'lanadi
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-16 text-center animate-fade-in delay-600">
            <h3 className="text-2xl font-bold theme-text mb-8">Bizga Ishongan A'zolar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold theme-accent mb-2">5,000+</div>
                <div className="theme-text-secondary">Faol a'zolar</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold theme-accent mb-2">98%</div>
                <div className="theme-text-secondary">Mamnun a'zolar</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold theme-accent mb-2">24h</div>
                <div className="theme-text-secondary">O'rtacha javob vaqti</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center animate-fade-in delay-800">
            <div className="theme-bg-secondary rounded-2xl p-8 theme-shadow-lg theme-border border">
              <h3 className="text-xl font-bold theme-text mb-4">Yana Savollaringiz Bormi?</h3>
              <p className="theme-text-secondary mb-6">
                A'zolik haqida ko'proq ma'lumot olish uchun FAQ bo'limini ko'ring yoki to'g'ridan-to'g'ri bog'laning
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <a
                  href="/faq"
                  className="theme-border border theme-text px-6 py-3 rounded-xl font-semibold hover:theme-bg-tertiary transition-colors duration-200"
                >
                  FAQ ko'rish
                </a>
                <a
                  href="/contact"
                  className="theme-accent-bg text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  To'g'ridan-to'g'ri bog'lanish
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm;