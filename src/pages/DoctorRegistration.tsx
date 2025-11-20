import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Stethoscope, 
  Award, 
  Calendar, 
  Phone,
  Mail,
  FileText,
  Plus,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Upload,
  Clock,
  DollarSign,
  Languages,
  GraduationCap
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { createDoctorProfile } from '../lib/doctorProfiles';
import type { CreateDoctorProfileData } from '../lib/doctorProfiles';

const DoctorRegistration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeLanguageTab, setActiveLanguageTab] = useState<'uz' | 'ru' | 'en'>('uz');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newCertificate, setNewCertificate] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateDoctorProfileData>({
    specialization: '',
    experience_years: 0,
    bio: '',
    certificates: [],
    education: [],
    languages: ['uz'],
    consultation_fee: 0,
    consultation_duration: 30,
    working_hours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '14:00', available: false },
      sunday: { start: '09:00', end: '14:00', available: false }
    },
    translations: {
      ru: {
        bio: '',
        specialization: '',
        education: []
      },
      en: {
        bio: '',
        specialization: '',
        education: []
      }
    }
  });

  const languages = [
    { code: 'uz' as const, label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru' as const, label: 'Русский', flag: '🇷🇺' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' }
  ];

  const weekDays = [
    { key: 'monday', label: 'Dushanba' },
    { key: 'tuesday', label: 'Seshanba' },
    { key: 'wednesday', label: 'Chorshanba' },
    { key: 'thursday', label: 'Payshanba' },
    { key: 'friday', label: 'Juma' },
    { key: 'saturday', label: 'Shanba' },
    { key: 'sunday', label: 'Yakshanba' }
  ];

  const specializations = [
    'Revmatologiya',
    'Ortopediya va travmatologiya',
    'Reabilitatsiya va jismoniy terapiya',
    'Ichki kasalliklar',
    'Kardiologiya',
    'Nevrologiya',
    'Endokrinologiya',
    'Immunologiya',
    'Boshqa'
  ];

  const availableLanguages = [
    { code: 'uz', label: "O'zbek tili" },
    { code: 'ru', label: 'Rus tili' },
    { code: 'en', label: 'Ingliz tili' },
    { code: 'tr', label: 'Turk tili' },
    { code: 'ar', label: 'Arab tili' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      }));
    }
    
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations!,
        [activeLanguageTab]: {
          ...prev.translations![activeLanguageTab],
          [name]: value
        }
      }
    }));
  };

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours!,
        [day]: {
          ...prev.working_hours![day],
          [field]: value
        }
      }
    }));
  };

  const addCertificate = () => {
    if (newCertificate.trim() && !formData.certificates.includes(newCertificate.trim())) {
      setFormData(prev => ({
        ...prev,
        certificates: [...prev.certificates, newCertificate.trim()]
      }));
      setNewCertificate('');
    }
  };

  const removeCertificate = (certificate: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(c => c !== certificate)
    }));
  };

  const addEducation = () => {
    if (newEducation.trim() && !formData.education.includes(newEducation.trim())) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, newEducation.trim()]
      }));
      setNewEducation('');
    }
  };

  const removeEducation = (education: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(e => e !== education)
    }));
  };

  const handleLanguageToggle = (langCode: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(langCode)
        ? prev.languages.filter(l => l !== langCode)
        : [...prev.languages, langCode]
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Rasm hajmi 5MB dan kichik bo\'lishi kerak' });
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: undefined }));
    setAvatarPreview(null);
  };

  const validateForm = () => {
    if (!formData.specialization.trim()) {
      setMessage({ type: 'error', text: 'Mutaxassislik kiritilishi shart' });
      return false;
    }
    if (formData.experience_years < 0) {
      setMessage({ type: 'error', text: 'Tajriba yillari 0 dan kam bo\'lishi mumkin emas' });
      return false;
    }
    if (!formData.bio?.trim()) {
      setMessage({ type: 'error', text: 'Bio ma\'lumot kiritilishi shart' });
      return false;
    }
    if (formData.certificates.length === 0) {
      setMessage({ type: 'error', text: 'Kamida bitta sertifikat kiritilishi shart' });
      return false;
    }
    if (formData.education.length === 0) {
      setMessage({ type: 'error', text: 'Ta\'lim ma\'lumotlari kiritilishi shart' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'Foydalanuvchi autentifikatsiya qilinmagan' });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await createDoctorProfile(user.id, formData);

      if (error) {
        setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'Shifokor profili muvaffaqiyatli yaratildi! Admin tasdiqlashini kuting.' });
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">Kirish Talab Etiladi</h1>
          <p className="theme-text-secondary mb-6">Shifokor profili yaratish uchun tizimga kirishingiz kerak.</p>
          <button
            onClick={() => navigate('/login')}
            className="theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Tizimga kirish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <SEOHead
        title="Shifokor Profili Yaratish"
        description="Shifokor sifatida professional profil yarating va bemorlar bilan bog'laning."
        keywords="shifokor profili, tibbiy mutaxassis, revmatolog"
        url="https://revmohelp.uz/doctor-registration"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
            <Stethoscope size={16} className="text-blue-600" />
            <span className="text-blue-800 text-sm font-medium">Doctor Registration</span>
          </div>
          <h1 className="text-4xl font-bold theme-text mb-4">
            Shifokor <span className="text-primary-500">Profili</span> Yaratish
          </h1>
          <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
            Professional shifokor profili yarating va bemorlar bilan bog'laning. 
            Profilingiz admin tomonidan tasdiqlanganidan so'ng faol bo'ladi.
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-red-600" />
            )}
            <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-2xl font-bold theme-text mb-6 flex items-center space-x-2">
              <User size={24} className="text-blue-600" />
              <span>Asosiy Ma'lumotlar</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  To'liq ism (o'zgartirib bo'lmaydi)
                </label>
                <input
                  type="text"
                  value={user.full_name}
                  disabled
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg theme-text opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Email (o'zgartirib bo'lmaydi)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg theme-text opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Telefon raqami
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={user.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Profil rasmi
                </label>
                {avatarPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 theme-bg-tertiary rounded-full flex items-center justify-center border-2 theme-border border-dashed">
                      <User size={32} className="theme-text-muted" />
                    </div>
                    <label className="cursor-pointer inline-flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      <Upload className="w-4 h-4" />
                      <span>Rasm yuklash</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                )}
                <p className="text-xs theme-text-muted mt-2">
                  PNG, JPG, WEBP (max 5MB). Profil rasmingiz shifokorlar sahifasida ko'rsatiladi.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Mutaxassislik *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Mutaxassislikni tanlang</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Tajriba (yil) *
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Konsultatsiya narxi (so'm)
                </label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                  placeholder="0 (bepul konsultatsiya)"
                />
              </div>
            </div>
          </div>

          {/* Bio and Translations */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold theme-text flex items-center space-x-2">
                <FileText size={24} className="text-green-600" />
                <span>Bio va Tarjimalar</span>
              </h2>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLanguageTab(lang.code)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                      activeLanguageTab === lang.code
                        ? 'bg-white theme-text shadow-sm'
                        : 'theme-text-secondary hover:theme-text'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeLanguageTab === 'uz' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Mutaxassislik (O'zbek) *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                    placeholder="Masalan: Revmatologiya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Bio (O'zbek) *
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="O'zingiz haqingizda batafsil yozing..."
                  />
                </div>
              </div>
            )}

            {activeLanguageTab === 'ru' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Специализация (Русский)
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.translations?.ru.specialization || ''}
                    onChange={handleTranslationChange}
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="Например: Ревматология"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Био (Русский)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.translations?.ru.bio || ''}
                    onChange={handleTranslationChange}
                    rows={4}
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                    placeholder="Подробно расскажите о себе..."
                  />
                </div>
              </div>
            )}

            {activeLanguageTab === 'en' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Specialization (English)
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.translations?.en.specialization || ''}
                    onChange={handleTranslationChange}
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="e.g., Rheumatology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Bio (English)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.translations?.en.bio || ''}
                    onChange={handleTranslationChange}
                    rows={4}
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                    placeholder="Tell us about yourself in detail..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-2xl font-bold theme-text mb-6 flex items-center space-x-2">
              <Award size={24} className="text-purple-600" />
              <span>Sertifikatlar va Diplomlar</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Sertifikat yoki diplom qo'shish"
                  value={newCertificate}
                  onChange={(e) => setNewCertificate(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertificate())}
                  className="flex-1 px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                />
                <button
                  type="button"
                  onClick={addCertificate}
                  className="px-4 py-3 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.certificates.map((certificate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-purple-50 text-purple-800 rounded-lg border border-purple-200"
                  >
                    <span className="flex-1">{certificate}</span>
                    <button
                      type="button"
                      onClick={() => removeCertificate(certificate)}
                      className="text-purple-600 hover:text-purple-800 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-2xl font-bold theme-text mb-6 flex items-center space-x-2">
              <GraduationCap size={24} className="text-orange-600" />
              <span>Ta'lim</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ta'lim muassasasi yoki kurs qo'shish"
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEducation())}
                  className="flex-1 px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                />
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-3 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {formData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-50 text-orange-800 rounded-lg border border-orange-200"
                  >
                    <span className="flex-1">{edu}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu)}
                      className="text-orange-600 hover:text-orange-800 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-2xl font-bold theme-text mb-6 flex items-center space-x-2">
              <Languages size={24} className="text-teal-600" />
              <span>Tillar</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableLanguages.map((lang) => (
                <label key={lang.code} className="flex items-center space-x-3 p-4 theme-bg-secondary rounded-lg cursor-pointer hover:theme-shadow-md transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(lang.code)}
                    onChange={() => handleLanguageToggle(lang.code)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium theme-text">{lang.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-8" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-2xl font-bold theme-text mb-6 flex items-center space-x-2">
              <Clock size={24} className="text-indigo-600" />
              <span>Ish Vaqti</span>
            </h2>
            
            <div className="space-y-4">
              {weekDays.map((day) => (
                <div key={day.key} className="flex items-center space-x-4 p-4 theme-bg-secondary rounded-lg">
                  <div className="w-24">
                    <span className="text-sm font-medium theme-text">{day.label}</span>
                  </div>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.working_hours?.[day.key]?.available || false}
                      onChange={(e) => handleWorkingHoursChange(day.key, 'available', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm theme-text-secondary">Mavjud</span>
                  </label>
                  
                  {formData.working_hours?.[day.key]?.available && (
                    <>
                      <input
                        type="time"
                        value={formData.working_hours[day.key].start}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                        className="px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      />
                      <span className="theme-text-secondary">dan</span>
                      <input
                        type="time"
                        value={formData.working_hours[day.key].end}
                        onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                        className="px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      />
                      <span className="theme-text-secondary">gacha</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-8 py-4 theme-border border theme-text-secondary rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save size={20} />
              <span>{isSubmitting ? 'Saqlanmoqda...' : 'Profil Yaratish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegistration;