import React, { useState } from 'react';
import {
  Upload,
  X,
  Plus,
  FileText,
  Image as ImageIcon,
  Video,
  Star,
  User,
  Stethoscope,
  Pill,
  Activity,
  Heart
} from 'lucide-react';
import type { CreatePatientStoryData } from '../../lib/patientStories';
import type { Doctor } from '../../lib/doctors';

interface PatientStoryFormProps {
  formData: CreatePatientStoryData;
  doctors: Doctor[];
  onInputChange: (field: string, value: any) => void;
  onFormDataChange: (updater: (prev: CreatePatientStoryData) => CreatePatientStoryData) => void;
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const PatientStoryForm: React.FC<PatientStoryFormProps> = ({
  formData,
  doctors,
  onInputChange,
  onFormDataChange,
  imagePreview,
  onImageUpload,
  onRemoveImage
}) => {
  const [newSymptom, setNewSymptom] = useState('');
  const [newTreatment, setNewTreatment] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [activeLanguage, setActiveLanguage] = useState<'uz' | 'ru' | 'en'>('uz');

  const ensureTranslation = (lang: 'ru' | 'en', prev: CreatePatientStoryData) => {
    const current = prev.translations || {};
    const langObj = current[lang] || {
      patient_name: '',
      diagnosis: '',
      story_content: '',
      treatment_duration: '',
      outcome: '',
      doctor_name: prev.doctor_name || '',
      symptoms: prev.symptoms || [],
      treatment_methods: prev.treatment_methods || [],
      medications: prev.medications || [],
      lifestyle_changes: prev.lifestyle_changes || '',
      meta_title: '',
      meta_description: ''
    };
    return { current, langObj } as const;
  };

  const handleLocalizedChange = (field: string, value: any) => {
    if (activeLanguage === 'uz') {
      onInputChange(field, value);
      return;
    }
    const lang = activeLanguage;
    onFormDataChange(prev => {
      const { current, langObj } = ensureTranslation(lang, prev);
      return {
        ...prev,
        translations: {
          ...current,
          [lang]: {
            ...langObj,
            [field]: value
          }
        }
      };
    });
  };

  const getLocalizedValue = (field: keyof Omit<CreatePatientStoryData, 'translations'>) => {
    if (activeLanguage === 'uz') return (formData as any)[field] ?? '';
    const lang = activeLanguage as 'ru' | 'en';
    return formData.translations?.[lang]?.[field as string] ?? '';
  };

  const addSymptom = () => {
    if (newSymptom.trim() && !formData.symptoms.includes(newSymptom.trim())) {
      onInputChange('symptoms', [...formData.symptoms, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    onInputChange('symptoms', formData.symptoms.filter(s => s !== symptom));
  };

  const addTreatment = () => {
    if (newTreatment.trim() && !formData.treatment_methods.includes(newTreatment.trim())) {
      onInputChange('treatment_methods', [...formData.treatment_methods, newTreatment.trim()]);
      setNewTreatment('');
    }
  };

  const removeTreatment = (treatment: string) => {
    onInputChange('treatment_methods', formData.treatment_methods.filter(t => t !== treatment));
  };

  const addMedication = () => {
    if (newMedication.trim() && !formData.medications.includes(newMedication.trim())) {
      onInputChange('medications', [...formData.medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    onInputChange('medications', formData.medications.filter(m => m !== medication));
  };

  return (
    <div className="space-y-6">
      {/* Language Tabs (apply to localized fields) */}
      <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium theme-text-secondary">Til</label>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
            {[
              { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
              { code: 'ru', label: 'Русский', flag: '🇷🇺' },
              { code: 'en', label: 'English', flag: '🇺🇸' }
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLanguage(lang.code as 'uz' | 'ru' | 'en')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                  activeLanguage === lang.code
                    ? 'bg-white dark:bg-gray-700 theme-text shadow-sm'
                    : 'theme-text-secondary hover:theme-text'
                }`}
              >
                <span>{lang.flag}</span>
                <span className="hidden sm:inline">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
        <h3 className="text-lg font-semibold theme-text mb-4 flex items-center space-x-2">
          <User size={20} className="text-blue-600" />
          <span>Asosiy Ma'lumotlar</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Bemor ismi * {activeLanguage !== 'uz' && <span className="theme-text-muted">({activeLanguage.toUpperCase()})</span>}
            </label>
            <input
              type="text"
              value={getLocalizedValue('patient_name')}
              onChange={(e) => handleLocalizedChange('patient_name', e.target.value)}
              required
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
              placeholder="Bemor to'liq ismi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Yoshi *
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => onInputChange('age', parseInt(e.target.value) || 0)}
              required
              min="1"
              max="120"
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Tashxis * {activeLanguage !== 'uz' && <span className="theme-text-muted">({activeLanguage.toUpperCase()})</span>}
            </label>
            <input
              type="text"
              value={getLocalizedValue('diagnosis')}
              onChange={(e) => handleLocalizedChange('diagnosis', e.target.value)}
              required
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
              placeholder="Kasallik tashxisi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Davolash shifokor *
            </label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={16} />
              <select
                value={formData.doctor_name}
                onChange={(e) => onInputChange('doctor_name', e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text appearance-none"
              >
                <option value="">Shifokorni tanlang</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.full_name}>
                    {doctor.full_name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
            {doctors.length === 0 && (
              <p className="text-xs theme-text-muted mt-1">
                Hozircha shifokorlar mavjud emas. Avval shifokor qo'shing.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Davolash muddati * {activeLanguage !== 'uz' && <span className="theme-text-muted">({activeLanguage.toUpperCase()})</span>}
            </label>
            <input
              type="text"
              value={getLocalizedValue('treatment_duration')}
              onChange={(e) => handleLocalizedChange('treatment_duration', e.target.value)}
              required
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
              placeholder="Masalan: 6 oy, 1 yil"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Reyting *
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onInputChange('rating', star)}
                    className={`p-1 transition-colors duration-200 ${
                      star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    <Star size={20} className={star <= formData.rating ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
              <span className="text-sm theme-text-secondary">({formData.rating}/5)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
        <h3 className="text-lg font-semibold theme-text mb-4 flex items-center space-x-2">
          <Heart size={20} className="text-red-600" />
          <span>Bemor Hikoyasi</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Hikoya matni * {activeLanguage !== 'uz' && <span className="theme-text-muted">({activeLanguage.toUpperCase()})</span>}
            </label>
            <textarea
              value={getLocalizedValue('story_content')}
              onChange={(e) => handleLocalizedChange('story_content', e.target.value)}
              required
              rows={6}
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
              placeholder="Bemorning to'liq hikoyasini yozing..."
            />
            <div className="text-xs theme-text-muted mt-1">
              {(getLocalizedValue('story_content') as string).length} belgi
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Davolash natijasi * {activeLanguage !== 'uz' && <span className="theme-text-muted">({activeLanguage.toUpperCase()})</span>}
            </label>
            <textarea
              value={getLocalizedValue('outcome')}
              onChange={(e) => handleLocalizedChange('outcome', e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
              placeholder="Davolash natijasi va hozirgi holat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Turmush tarzi o'zgarishlari
            </label>
            <textarea
              value={formData.lifestyle_changes}
              onChange={(e) => onInputChange('lifestyle_changes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
              placeholder="Ovqatlanish, mashqlar, kundalik rejim o'zgarishlari"
            />
          </div>
        </div>
      </div>

      {/* Content Type */}
      <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">Kontent Turi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { type: 'text', icon: FileText, label: 'Matn Hikoyasi' },
            { type: 'image', icon: ImageIcon, label: 'Rasm Hikoyasi' },
            { type: 'video', icon: Video, label: 'Video Hikoya' },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => onInputChange('content_type', type)}
              className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                formData.content_type === type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'theme-border hover:border-gray-300 dark:hover:border-gray-500 theme-text-secondary'
              }`}
            >
              <Icon size={24} className="mx-auto mb-2" />
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Media Upload */}
      {(formData.content_type === 'image' || formData.content_type === 'video') && (
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-6 animate-fade-in">
          {formData.content_type === 'image' && (
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-4">
                Hikoya rasmi
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 theme-border border-dashed rounded-lg cursor-pointer theme-bg-tertiary hover:theme-bg-quaternary transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 theme-text-muted" />
                    <p className="mb-2 text-sm theme-text-secondary">
                      <span className="font-semibold">Yuklash uchun bosing</span> yoki sudrab tashlang
                    </p>
                    <p className="text-xs theme-text-muted">
                      PNG, JPG, WEBP (max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onImageUpload}
                  />
                </label>
              )}
            </div>
          )}

          {formData.content_type === 'video' && (
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtube_url || ''}
                onChange={(e) => onInputChange('youtube_url', e.target.value)}
                className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
              />
            </div>
          )}
        </div>
      )}

      {/* Medical Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Symptoms */}
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
          <h3 className="text-lg font-semibold theme-text mb-4 flex items-center space-x-2">
            <Activity size={20} className="text-orange-600" />
            <span>Kasallik Belgilari</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Yangi belgi qo'shish"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
              />
              <button
                type="button"
                onClick={addSymptom}
                className="px-3 py-2 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.symptoms.map((symptom, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-lg text-sm"
                >
                  <span>{symptom}</span>
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom)}
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Treatment Methods */}
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
          <h3 className="text-lg font-semibold theme-text mb-4 flex items-center space-x-2">
            <Stethoscope size={20} className="text-blue-600" />
            <span>Davolash Usullari</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Davolash usuli qo'shish"
                value={newTreatment}
                onChange={(e) => setNewTreatment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTreatment())}
                className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
              />
              <button
                type="button"
                onClick={addTreatment}
                className="px-3 py-2 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.treatment_methods.map((treatment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm"
                >
                  <span>{treatment}</span>
                  <button
                    type="button"
                    onClick={() => removeTreatment(treatment)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
          <h3 className="text-lg font-semibold theme-text mb-4 flex items-center space-x-2">
            <Pill size={20} className="text-green-600" />
            <span>Dorilar</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Dori qo'shish"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
              />
              <button
                type="button"
                onClick={addMedication}
                className="px-3 py-2 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.medications.map((medication, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm"
                >
                  <span>{medication}</span>
                  <button
                    type="button"
                    onClick={() => removeMedication(medication)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">SEO Sozlamalari</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Meta sarlavha {activeLanguage !== 'uz' && <span className="theme-text-muted">({activeLanguage.toUpperCase()})</span>}
            </label>
            <input
              type="text"
              value={getLocalizedValue('meta_title')}
              onChange={(e) => handleLocalizedChange('meta_title', e.target.value)}
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
              placeholder="SEO uchun sarlavha"
            />
            <div className="text-xs theme-text-muted mt-1">
              {(getLocalizedValue('meta_title') as string).length}/60 belgi
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Meta tavsif {activeLanguage !== 'uz' && <span className="theme-text-muted">({activeLanguage.toUpperCase()})</span>}
            </label>
            <textarea
              value={getLocalizedValue('meta_description')}
              onChange={(e) => handleLocalizedChange('meta_description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
              placeholder="SEO uchun qisqacha tavsif"
            />
            <div className="text-xs theme-text-muted mt-1">
              {(getLocalizedValue('meta_description') as string).length}/160 belgi
            </div>
          </div>
        </div>
      </div>

      {/* Publish Settings */}
      <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">Nashr Sozlamalari</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => onInputChange('published', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="published" className="text-sm font-medium theme-text-secondary">
              Darhol nashr etish
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => onInputChange('featured', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-sm font-medium theme-text-secondary">
              Asosiy hikoya
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Tartib raqami
            </label>
            <div className="w-full px-3 py-2 theme-border border rounded-lg theme-bg theme-text text-sm">
              Avtomatik belgilanadi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientStoryForm;
