import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Activity, 
  Upload,
  Eye,
  Star,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Play,
  FileText,
  Image as ImageIcon,
  Video,
  Award,
  Stethoscope,
  Pill,
  Target,
  Filter,
  TrendingUp,
  Heart,
  Shield
} from 'lucide-react';
import { 
  getDiseases, 
  createDisease, 
  updateDisease, 
  deleteDisease,
  uploadDiseaseImage,
  checkDiseaseSlugUniqueness
} from '../../lib/diseases';
import type { Disease, CreateDiseaseData } from '../../lib/diseases';

const DiseasesManagement: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeLanguageTab, setActiveLanguageTab] = useState<'uz' | 'ru' | 'en'>('uz');

  const [formData, setFormData] = useState<CreateDiseaseData>({
    name: '',
    slug: '',
    description: '',
    symptoms: [],
    treatment_methods: [],
    prevention_tips: [],
    youtube_url: '',
    meta_title: '',
    meta_description: '',
    active: true,
    featured: false,
    order_index: 0,
    translations: {
      ru: {
        name: '',
        description: '',
        symptoms: [],
        treatment_methods: [],
        prevention_tips: [],
        meta_title: '',
        meta_description: '',
        slug: ''
      },
      en: {
        name: '',
        description: '',
        symptoms: [],
        treatment_methods: [],
        prevention_tips: [],
        meta_title: '',
        meta_description: '',
        slug: ''
      }
    }
  });

  const [newSymptom, setNewSymptom] = useState('');
  const [newTreatment, setNewTreatment] = useState('');
  const [newPrevention, setNewPrevention] = useState('');

  const languages = [
    { code: 'uz' as const, label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru' as const, label: 'Русский', flag: '🇷🇺' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' }
  ];

  useEffect(() => {
    loadDiseases();
  }, []);

  const loadDiseases = async () => {
    setLoading(true);
    try {
      const { data } = await getDiseases();
      if (data) {
        setDiseases(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Kasalliklarni yuklashda xatolik' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Rasm hajmi 5MB dan kichik bo\'lishi kerak' });
        return;
      }

      setFormData(prev => ({ ...prev, featured_image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, featured_image: undefined }));
    setImagePreview(null);
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !editingDisease) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, editingDisease]);

  const addSymptom = () => {
    if (newSymptom.trim() && !formData.symptoms.includes(newSymptom.trim())) {
      handleInputChange('symptoms', [...formData.symptoms, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    handleInputChange('symptoms', formData.symptoms.filter(s => s !== symptom));
  };

  const addTreatment = () => {
    if (newTreatment.trim() && !formData.treatment_methods.includes(newTreatment.trim())) {
      handleInputChange('treatment_methods', [...formData.treatment_methods, newTreatment.trim()]);
      setNewTreatment('');
    }
  };

  const removeTreatment = (treatment: string) => {
    handleInputChange('treatment_methods', formData.treatment_methods.filter(t => t !== treatment));
  };

  const addPrevention = () => {
    if (newPrevention.trim() && !formData.prevention_tips.includes(newPrevention.trim())) {
      handleInputChange('prevention_tips', [...formData.prevention_tips, newPrevention.trim()]);
      setNewPrevention('');
    }
  };

  const removePrevention = (prevention: string) => {
    handleInputChange('prevention_tips', formData.prevention_tips.filter(p => p !== prevention));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      symptoms: [],
      treatment_methods: [],
      prevention_tips: [],
      youtube_url: '',
      meta_title: '',
      meta_description: '',
      active: true,
      featured: false,
      order_index: 0,
      translations: {
        ru: {
          name: '',
          description: '',
          symptoms: [],
          treatment_methods: [],
          prevention_tips: [],
          meta_title: '',
          meta_description: '',
          slug: ''
        },
        en: {
          name: '',
          description: '',
          symptoms: [],
          treatment_methods: [],
          prevention_tips: [],
          meta_title: '',
          meta_description: '',
          slug: ''
        }
      }
    });
    setEditingDisease(null);
    setImagePreview(null);
    setActiveLanguageTab('uz');
    setNewSymptom('');
    setNewTreatment('');
    setNewPrevention('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (disease: Disease) => {
    setFormData({
      name: disease.name,
      slug: disease.slug,
      description: disease.description,
      symptoms: disease.symptoms || [],
      treatment_methods: disease.treatment_methods || [],
      prevention_tips: disease.prevention_tips || [],
      youtube_url: disease.youtube_url || '',
      meta_title: disease.meta_title || '',
      meta_description: disease.meta_description || '',
      active: disease.active,
      featured: disease.featured,
      order_index: disease.order_index,
      translations: {
        ru: {
          name: '',
          description: '',
          symptoms: [],
          treatment_methods: [],
          prevention_tips: [],
          meta_title: '',
          meta_description: '',
          slug: ''
        },
        en: {
          name: '',
          description: '',
          symptoms: [],
          treatment_methods: [],
          prevention_tips: [],
          meta_title: '',
          meta_description: '',
          slug: ''
        }
      }
    });
    
    if (disease.featured_image_url) {
      setImagePreview(disease.featured_image_url);
    }
    
    setEditingDisease(disease);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
    setMessage({ type: '', text: '' });
  };

  const validateForm = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Kasallik nomi kiritilishi shart' });
      return false;
    }
    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: 'Tavsif kiritilishi shart' });
      return false;
    }
    if (formData.symptoms.length === 0) {
      setMessage({ type: 'error', text: 'Kamida bitta belgi kiritilishi shart' });
      return false;
    }

    // Check slug uniqueness
    const { isUnique } = await checkDiseaseSlugUniqueness(formData.slug, 'uz', editingDisease?.id);
    if (!isUnique) {
      setMessage({ type: 'error', text: 'Bu URL (slug) allaqachon mavjud. Boshqa nom yozing yoki URL ni o\'zgartiring.' });
      return false;
    }

    return true;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await createDisease(formData);

      if (error) {
        setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'Kasallik muvaffaqiyatli yaratildi!' });
        await loadDiseases();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDisease || !(await validateForm())) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await updateDisease({
        id: editingDisease.id,
        ...formData
      });

      if (error) {
        setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'Kasallik muvaffaqiyatli yangilandi!' });
        await loadDiseases();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (diseaseId: string, diseaseName: string) => {
    if (!confirm(`${diseaseName} kasalligini o'chirishni xohlaysizmi?`)) return;

    setDeleteLoading(diseaseId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deleteDisease(diseaseId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Kasallik muvaffaqiyatli o\'chirildi!' });
        await loadDiseases();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredDiseases = diseases.filter(disease => {
    const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disease.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && disease.active) ||
                         (selectedStatus === 'inactive' && !disease.active) ||
                         (selectedStatus === 'featured' && disease.featured);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Kasalliklar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">Kasalliklar Boshqaruvi</h1>
          <p className="theme-text-secondary">Revmatik kasalliklar ma'lumotlarini boshqarish</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Yangi Kasallik</span>
        </button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold theme-text">{diseases.length}</div>
          <div className="text-sm theme-text-secondary">Jami kasalliklar</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{diseases.filter(d => d.active).length}</div>
          <div className="text-sm theme-text-secondary">Faol</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-yellow-600">{diseases.filter(d => d.featured).length}</div>
          <div className="text-sm theme-text-secondary">Asosiy</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-blue-600">{diseases.filter(d => d.youtube_url).length}</div>
          <div className="text-sm theme-text-secondary">Video bilan</div>
        </div>
      </div>

      {/* Filters */}
      <div className="theme-bg rounded-xl theme-shadow theme-border border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
              <input
                type="text"
                placeholder="Kasalliklarni qidiring..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
            >
              <option value="all">Barcha holatlar</option>
              <option value="active">Faol</option>
              <option value="inactive">Faol emas</option>
              <option value="featured">Asosiy kasalliklar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Diseases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiseases.map((disease) => (
          <div
            key={disease.id}
            className="theme-bg rounded-2xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-2 theme-border border overflow-hidden group"
          >
            {/* Disease Media */}
            <div className="relative h-48 overflow-hidden">
              {disease.featured_image_url ? (
                <img
                  src={disease.featured_image_url}
                  alt={disease.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : disease.youtube_url ? (
                <div className="relative w-full h-full">
                  <img
                    src={`https://img.youtube.com/vi/${disease.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                    alt={disease.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${disease.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-300">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl animate-pulse group-hover:scale-110 transition-transform duration-300">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full theme-bg-tertiary flex items-center justify-center group-hover:theme-bg-quaternary transition-colors duration-300">
                  <div className="text-center">
                    <Activity size={48} className="theme-text-muted mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <p className="theme-text-muted text-sm font-medium">Kasallik Ma'lumotlari</p>
                  </div>
                </div>
              )}
              
              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  disease.active
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {disease.active ? 'Faol' : 'Faol emas'}
                </span>
                {disease.featured && (
                  <span className="px-3 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-full flex items-center space-x-1">
                    <Star size={12} />
                    <span>Asosiy</span>
                  </span>
                )}
              </div>

              {/* Order Index */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  #{disease.order_index}
                </span>
              </div>
            </div>

            {/* Disease Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold theme-text mb-3 line-clamp-2 group-hover:theme-accent transition-colors duration-300">
                {disease.name}
              </h3>
              
              <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                {disease.description}
              </p>

              {/* Quick Stats */}
              <div className="flex items-center justify-between text-xs theme-text-muted mb-4 p-3 theme-bg-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <span>{disease.symptoms?.length || 0} belgi</span>
                  <span>{disease.treatment_methods?.length || 0} usul</span>
                  <span>{disease.prevention_tips?.length || 0} maslahat</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t theme-border">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(disease)}
                    className="flex items-center space-x-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 transform hover:scale-105"
                    title="Tahrirlash"
                  >
                    <Edit size={16} />
                    <span className="text-xs font-medium hidden sm:inline">Tahrirlash</span>
                  </button>
                  <a
                    href={`/diseases/${disease.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 transform hover:scale-105"
                    title="Ko'rish"
                  >
                    <Eye size={16} />
                    <span className="text-xs font-medium hidden sm:inline">Ko'rish</span>
                  </a>
                  <button
                    onClick={() => handleDelete(disease.id, disease.name)}
                    disabled={deleteLoading === disease.id}
                    className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    title="O'chirish"
                  >
                    {deleteLoading === disease.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span className="text-xs font-medium hidden sm:inline">O'chirish</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Date */}
                <div className="flex items-center space-x-1 text-xs theme-text-muted">
                  <Calendar size={12} />
                  <span>{formatDate(disease.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredDiseases.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            Kasallik topilmadi
          </h3>
          <p className="theme-text-muted mb-6">
            Qidiruv so'zini o'zgartiring yoki yangi kasallik qo'shing
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Birinchi kasallikni qo'shish</span>
          </button>
        </div>
      )}

      {/* Create Disease Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">Yangi Kasallik Qo'shish</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text p-1 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              {message.text && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm ${message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* Language Tabs */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold theme-text">Kasallik Ma'lumotlari</h4>
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveLanguageTab(lang.code)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                        activeLanguageTab === lang.code
                          ? 'bg-white dark:bg-gray-700 theme-text shadow-sm'
                          : 'theme-text-secondary hover:theme-text'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Kasallik nomi ({languages.find(l => l.code === activeLanguageTab)?.label}) *
                  </label>
                  {activeLanguageTab === 'uz' ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      placeholder="Kasallik nomi"
                    />
                  ) : (
                    <input
                      type="text"
                      name="name"
                      value={formData.translations?.[activeLanguageTab]?.name || ''}
                      onChange={handleTranslationChange}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      placeholder="Kasallik nomi"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    URL Slug ({languages.find(l => l.code === activeLanguageTab)?.label}) *
                  </label>
                  {activeLanguageTab === 'uz' ? (
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      required
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      placeholder="url-slug"
                    />
                  ) : (
                    <input
                      type="text"
                      name="slug"
                      value={formData.translations?.[activeLanguageTab]?.slug || ''}
                      onChange={handleTranslationChange}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      placeholder="url-slug"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Tavsif ({languages.find(l => l.code === activeLanguageTab)?.label}) *
                </label>
                {activeLanguageTab === 'uz' ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                    placeholder="Kasallik haqida batafsil ma'lumot"
                  />
                ) : (
                  <textarea
                    name="description"
                    value={formData.translations?.[activeLanguageTab]?.description || ''}
                    onChange={handleTranslationChange}
                    rows={4}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                    placeholder="Kasallik haqida batafsil ma'lumot"
                  />
                )}
              </div>

              {/* Media Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Kasallik rasmi
                  </label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 theme-border border-dashed rounded-lg cursor-pointer theme-bg-tertiary hover:theme-bg-quaternary transition-colors duration-200">
                      <Upload className="w-6 h-6 mb-2 theme-text-muted" />
                      <p className="text-xs theme-text-secondary">Rasm yuklash</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtube_url || ''}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>
              </div>

              {/* Medical Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Kasallik Belgilari
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Yangi belgi"
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
                    
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {formData.symptoms.map((symptom, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm"
                        >
                          <span>{symptom}</span>
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Treatment Methods */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Davolash Usullari
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Davolash usuli"
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
                    
                    <div className="space-y-1 max-h-32 overflow-y-auto">
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

                {/* Prevention Tips */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Profilaktika
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Profilaktika maslahati"
                        value={newPrevention}
                        onChange={(e) => setNewPrevention(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrevention())}
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
                      />
                      <button
                        type="button"
                        onClick={addPrevention}
                        className="px-3 py-2 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {formData.prevention_tips.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm"
                        >
                          <span>{tip}</span>
                          <button
                            type="button"
                            onClick={() => removePrevention(tip)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Meta sarlavha
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="SEO uchun sarlavha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Meta tavsif
                  </label>
                  <textarea
                    value={formData.meta_description || ''}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                    placeholder="SEO uchun qisqacha tavsif"
                  />
                </div>
              </div>

              {/* Publish Settings */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">Faol</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">Asosiy kasallik</span>
                </label>
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Tartib raqami
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-20 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? 'Yaratilmoqda...' : 'Yaratish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Disease Modal */}
      {showEditModal && editingDisease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">Kasallikni Tahrirlash</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text p-1 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              {/* Same form content as create modal */}
              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseasesManagement;