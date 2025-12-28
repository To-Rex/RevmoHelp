import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Shield,
  ChevronDown
} from 'lucide-react';
import {
  getDiseases,
  getDiseasesAdmin,
  createDisease,
  updateDisease,
  deleteDisease,
  uploadDiseaseImage,
  checkDiseaseSlugUniqueness
} from '../../lib/diseases';
import type { Disease, CreateDiseaseData } from '../../lib/diseases';

const DiseasesManagement: React.FC = () => {
  const { t } = useTranslation();
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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

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

  // New item states per language
  const [newSymptomUz, setNewSymptomUz] = useState('');
  const [newSymptomRu, setNewSymptomRu] = useState('');
  const [newSymptomEn, setNewSymptomEn] = useState('');
  const [newTreatmentUz, setNewTreatmentUz] = useState('');
  const [newTreatmentRu, setNewTreatmentRu] = useState('');
  const [newTreatmentEn, setNewTreatmentEn] = useState('');
  const [newPreventionUz, setNewPreventionUz] = useState('');
  const [newPreventionRu, setNewPreventionRu] = useState('');
  const [newPreventionEn, setNewPreventionEn] = useState('');

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
      const { data } = await getDiseasesAdmin({});
      if (data) {
        setDiseases(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('diseasesErrorLoading') });
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
        setMessage({ type: 'error', text: t('diseasesImageSizeError') });
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

  // Auto-generate slug from name (same for all languages)
  useEffect(() => {
    if (formData.name && (!editingDisease || !formData.slug)) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Set the same slug for all languages
      setFormData(prev => ({
        ...prev,
        slug,
        translations: {
          ...prev.translations!,
          ru: {
            ...prev.translations!.ru,
            slug
          },
          en: {
            ...prev.translations!.en,
            slug
          }
        }
      }));
    }
  }, [formData.name, editingDisease, formData.slug]);

  // Auto-generate meta title from name
  useEffect(() => {
    if (formData.name && (!editingDisease || !formData.meta_title)) {
      const metaTitle = formData.name.length > 60
        ? formData.name.substring(0, 57) + '...'
        : formData.name;
      setFormData(prev => ({ ...prev, meta_title: metaTitle }));
    }
  }, [formData.name, editingDisease, formData.meta_title]);

  // Auto-generate Russian meta title from Uzbek name
  useEffect(() => {
    if (formData.name && (!editingDisease || !formData.translations?.ru?.meta_title)) {
      // Keep the Uzbek name as Russian meta title for now (can be manually edited later)
      const ruMetaTitle = formData.name.length > 60
        ? formData.name.substring(0, 57) + '...'
        : formData.name;
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations!,
          ru: {
            ...prev.translations!.ru,
            meta_title: ruMetaTitle
          }
        }
      }));
    }
  }, [formData.name, editingDisease, formData.translations?.ru?.meta_title]);

  // Auto-generate English meta title from Uzbek name
  useEffect(() => {
    if (formData.name && (!editingDisease || !formData.translations?.en?.meta_title)) {
      // Keep the Uzbek name as English meta title for now (can be manually edited later)
      const enMetaTitle = formData.name.length > 60
        ? formData.name.substring(0, 57) + '...'
        : formData.name;
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations!,
          en: {
            ...prev.translations!.en,
            meta_title: enMetaTitle
          }
        }
      }));
    }
  }, [formData.name, editingDisease, formData.translations?.en?.meta_title]);

  // Auto-generate meta description from description
  useEffect(() => {
    if (formData.description && (!editingDisease || !formData.meta_description)) {
      const metaDesc = formData.description.length > 160
        ? formData.description.substring(0, 157) + '...'
        : formData.description;
      setFormData(prev => ({ ...prev, meta_description: metaDesc }));
    }
  }, [formData.description, editingDisease, formData.meta_description]);

  // Auto-generate Russian meta description from Uzbek description
  useEffect(() => {
    if (formData.description && (!editingDisease || !formData.translations?.ru?.meta_description)) {
      // Keep the Uzbek description as Russian meta description for now (can be manually edited later)
      const ruMetaDesc = formData.description.length > 160
        ? formData.description.substring(0, 157) + '...'
        : formData.description;
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations!,
          ru: {
            ...prev.translations!.ru,
            meta_description: ruMetaDesc
          }
        }
      }));
    }
  }, [formData.description, editingDisease, formData.translations?.ru?.meta_description]);

  // Auto-generate English meta description from Uzbek description
  useEffect(() => {
    if (formData.description && (!editingDisease || !formData.translations?.en?.meta_description)) {
      // Keep the Uzbek description as English meta description for now (can be manually edited later)
      const enMetaDesc = formData.description.length > 160
        ? formData.description.substring(0, 157) + '...'
        : formData.description;
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations!,
          en: {
            ...prev.translations!.en,
            meta_description: enMetaDesc
          }
        }
      }));
    }
  }, [formData.description, editingDisease, formData.translations?.en?.meta_description]);

  const addSymptom = () => {
    const newItem = activeLanguageTab === 'uz' ? newSymptomUz : activeLanguageTab === 'ru' ? newSymptomRu : newSymptomEn;
    if (newItem.trim()) {
      // Split by comma and process each item
      const itemsToAdd = newItem.split(',').map(item => item.trim()).filter(item => item.length > 0);
      const currentSymptoms = activeLanguageTab === 'uz' ? formData.symptoms : formData.translations?.[activeLanguageTab]?.symptoms || [];

      // Filter out items that are already in the list
      const uniqueItemsToAdd = itemsToAdd.filter(item => !currentSymptoms.includes(item));

      if (uniqueItemsToAdd.length > 0) {
        if (activeLanguageTab === 'uz') {
          handleInputChange('symptoms', [...currentSymptoms, ...uniqueItemsToAdd]);
        } else {
          setFormData(prev => ({
            ...prev,
            translations: {
              ...prev.translations!,
              [activeLanguageTab]: {
                ...prev.translations![activeLanguageTab],
                symptoms: [...currentSymptoms, ...uniqueItemsToAdd]
              }
            }
          }));
        }
        // Clear the input
        if (activeLanguageTab === 'uz') setNewSymptomUz('');
        else if (activeLanguageTab === 'ru') setNewSymptomRu('');
        else setNewSymptomEn('');
      }
    }
  };

  const removeSymptom = (symptom: string) => {
    if (activeLanguageTab === 'uz') {
      handleInputChange('symptoms', formData.symptoms.filter(s => s !== symptom));
    } else {
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations!,
          [activeLanguageTab]: {
            ...prev.translations![activeLanguageTab],
            symptoms: (prev.translations![activeLanguageTab].symptoms || []).filter(s => s !== symptom)
          }
        }
      }));
    }
  };

  const addTreatment = () => {
    const newItem = activeLanguageTab === 'uz' ? newTreatmentUz : activeLanguageTab === 'ru' ? newTreatmentRu : newTreatmentEn;
    if (newItem.trim()) {
      // Split by comma and process each item
      const itemsToAdd = newItem.split(',').map(item => item.trim()).filter(item => item.length > 0);
      const currentTreatments = activeLanguageTab === 'uz' ? formData.treatment_methods : formData.translations?.[activeLanguageTab]?.treatment_methods || [];

      // Filter out items that are already in the list
      const uniqueItemsToAdd = itemsToAdd.filter(item => !currentTreatments.includes(item));

      if (uniqueItemsToAdd.length > 0) {
        if (activeLanguageTab === 'uz') {
          handleInputChange('treatment_methods', [...currentTreatments, ...uniqueItemsToAdd]);
        } else {
          setFormData(prev => ({
            ...prev,
            translations: {
              ...prev.translations!,
              [activeLanguageTab]: {
                ...prev.translations![activeLanguageTab],
                treatment_methods: [...currentTreatments, ...uniqueItemsToAdd]
              }
            }
          }));
        }
        // Clear the input
        if (activeLanguageTab === 'uz') setNewTreatmentUz('');
        else if (activeLanguageTab === 'ru') setNewTreatmentRu('');
        else setNewTreatmentEn('');
      }
    }
  };

  const removeTreatment = (treatment: string) => {
    if (activeLanguageTab === 'uz') {
      handleInputChange('treatment_methods', formData.treatment_methods.filter(t => t !== treatment));
    } else {
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations!,
          [activeLanguageTab]: {
            ...prev.translations![activeLanguageTab],
            treatment_methods: (prev.translations![activeLanguageTab].treatment_methods || []).filter(t => t !== treatment)
          }
        }
      }));
    }
  };

  const addPrevention = () => {
    const newItem = activeLanguageTab === 'uz' ? newPreventionUz : activeLanguageTab === 'ru' ? newPreventionRu : newPreventionEn;
    if (newItem.trim()) {
      // Split by comma and process each item
      const itemsToAdd = newItem.split(',').map(item => item.trim()).filter(item => item.length > 0);
      const currentPreventions = activeLanguageTab === 'uz' ? formData.prevention_tips : formData.translations?.[activeLanguageTab]?.prevention_tips || [];

      // Filter out items that are already in the list
      const uniqueItemsToAdd = itemsToAdd.filter(item => !currentPreventions.includes(item));

      if (uniqueItemsToAdd.length > 0) {
        if (activeLanguageTab === 'uz') {
          handleInputChange('prevention_tips', [...currentPreventions, ...uniqueItemsToAdd]);
        } else {
          setFormData(prev => ({
            ...prev,
            translations: {
              ...prev.translations!,
              [activeLanguageTab]: {
                ...prev.translations![activeLanguageTab],
                prevention_tips: [...currentPreventions, ...uniqueItemsToAdd]
              }
            }
          }));
        }
        // Clear the input
        if (activeLanguageTab === 'uz') setNewPreventionUz('');
        else if (activeLanguageTab === 'ru') setNewPreventionRu('');
        else setNewPreventionEn('');
      }
    }
  };

  const removePrevention = (prevention: string) => {
    if (activeLanguageTab === 'uz') {
      handleInputChange('prevention_tips', formData.prevention_tips.filter(p => p !== prevention));
    } else {
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations!,
          [activeLanguageTab]: {
            ...prev.translations![activeLanguageTab],
            prevention_tips: (prev.translations![activeLanguageTab].prevention_tips || []).filter(p => p !== prevention)
          }
        }
      }));
    }
  };

  const resetForm = () => {
    // Calculate next order index
    const maxOrderIndex = diseases.length > 0 ? Math.max(...diseases.map(d => d.order_index)) : 0;
    const nextOrderIndex = maxOrderIndex + 1;

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
      order_index: nextOrderIndex,
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
    setNewSymptomUz('');
    setNewSymptomRu('');
    setNewSymptomEn('');
    setNewTreatmentUz('');
    setNewTreatmentRu('');
    setNewTreatmentEn('');
    setNewPreventionUz('');
    setNewPreventionRu('');
    setNewPreventionEn('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (disease: Disease) => {
    // Reset form first to ensure clean state
    resetForm();

    // Convert translations array to object format
    const translations: { [key: string]: any } = {
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
    };

    // Track which languages have translations in the database
    // Supabase returns translations as 'disease_translations' property
    const diseaseTranslations = (disease as any).disease_translations;
    const hasRuTranslation = diseaseTranslations?.some((t: any) => t.language === 'ru');
    const hasEnTranslation = diseaseTranslations?.some((t: any) => t.language === 'en');

    // Populate translations from disease.disease_translations array
    if (diseaseTranslations && Array.isArray(diseaseTranslations)) {
      diseaseTranslations.forEach((translation: any) => {
        if (translation.language === 'ru' || translation.language === 'en') {
          translations[translation.language] = {
            name: translation.name || '',
            description: translation.description || '',
            symptoms: Array.isArray(translation.symptoms) ? translation.symptoms : [],
            treatment_methods: Array.isArray(translation.treatment_methods) ? translation.treatment_methods : [],
            prevention_tips: Array.isArray(translation.prevention_tips) ? translation.prevention_tips : [],
            meta_title: translation.meta_title || '',
            meta_description: translation.meta_description || '',
            slug: translation.slug || ''
          };
        }
      });
    }

    // Only auto-generate translations if they don't exist in the database at all
    // This ensures existing translations are preserved and only missing ones are filled
    if (!hasRuTranslation && disease.name) {
      // Generate Russian translation from Uzbek name (simple placeholder)
      translations.ru.name = disease.name; // Keep Uzbek name as placeholder
      translations.ru.description = disease.description || '';
      translations.ru.symptoms = Array.isArray(disease.symptoms) ? disease.symptoms : [];
      translations.ru.treatment_methods = Array.isArray(disease.treatment_methods) ? disease.treatment_methods : [];
      translations.ru.prevention_tips = Array.isArray(disease.prevention_tips) ? disease.prevention_tips : [];
      translations.ru.meta_title = disease.meta_title || '';
      translations.ru.meta_description = disease.meta_description || '';
      translations.ru.slug = disease.slug || ''; // Use the same slug for all languages
    }

    if (!hasEnTranslation && disease.name) {
      // Generate English translation from Uzbek name (simple placeholder)
      translations.en.name = disease.name; // Keep Uzbek name as placeholder
      translations.en.description = disease.description || '';
      translations.en.symptoms = Array.isArray(disease.symptoms) ? disease.symptoms : [];
      translations.en.treatment_methods = Array.isArray(disease.treatment_methods) ? disease.treatment_methods : [];
      translations.en.prevention_tips = Array.isArray(disease.prevention_tips) ? disease.prevention_tips : [];
      translations.en.meta_title = disease.meta_title || '';
      translations.en.meta_description = disease.meta_description || '';
      translations.en.slug = disease.slug || ''; // Use the same slug for all languages
    }

    setFormData({
      name: disease.name || '',
      slug: disease.slug || '',
      description: disease.description || '',
      symptoms: Array.isArray(disease.symptoms) ? disease.symptoms : [],
      treatment_methods: Array.isArray(disease.treatment_methods) ? disease.treatment_methods : [],
      prevention_tips: Array.isArray(disease.prevention_tips) ? disease.prevention_tips : [],
      youtube_url: disease.youtube_url || '',
      meta_title: disease.meta_title || '',
      meta_description: disease.meta_description || '',
      active: disease.active ?? true,
      featured: disease.featured ?? false,
      order_index: disease.order_index ?? 0,
      translations: translations // Use the translations object with auto-generated data
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
      setMessage({ type: 'error', text: t('diseasesNameRequired') });
      return false;
    }
    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: t('diseasesDescriptionRequired') });
      return false;
    }
    if (formData.symptoms.length === 0) {
      setMessage({ type: 'error', text: t('diseasesAtLeastOneSymptom') });
      return false;
    }

    // Check slug uniqueness
    const { isUnique } = await checkDiseaseSlugUniqueness(formData.slug, 'uz', editingDisease?.id);
    if (!isUnique) {
      setMessage({ type: 'error', text: t('diseasesSlugExists') });
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
        setMessage({ type: 'success', text: t('diseasesCreated') });
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
        setMessage({ type: 'success', text: t('diseasesUpdated') });
        await loadDiseases();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('diseasesError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (diseaseId: string, diseaseName: string) => {
    if (!confirm(`${diseaseName} ${t('diseasesConfirmDelete')}`)) return;

    setDeleteLoading(diseaseId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deleteDisease(diseaseId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('diseasesDeleted') });
        await loadDiseases();
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('diseasesError') });
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
          <p className="theme-text-muted">{t('diseasesLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">{t('diseasesManagementTitle')}</h1>
          <p className="theme-text-secondary">{t('diseasesManagementDesc')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>{t('diseasesNewDisease')}</span>
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
          <div className="text-sm theme-text-secondary">{t('diseasesTotal')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{diseases.filter(d => d.active).length}</div>
          <div className="text-sm theme-text-secondary">{t('diseasesActive')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-yellow-600">{diseases.filter(d => d.featured).length}</div>
          <div className="text-sm theme-text-secondary">{t('diseasesFeatured')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-blue-600">{diseases.filter(d => d.youtube_url).length}</div>
          <div className="text-sm theme-text-secondary">{t('diseasesWithVideo')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={18} />
              <input
                type="text"
                placeholder={t('diseasesSearch')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48 relative">
            <button
              onClick={(e) => { e.stopPropagation(); setStatusDropdownOpen(!statusDropdownOpen); }}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm text-left flex items-center justify-between"
            >
              <span>{selectedStatus === 'all' ? t('diseasesAllStatuses') :
                    selectedStatus === 'active' ? t('diseasesActiveStatus') :
                    selectedStatus === 'inactive' ? t('diseasesInactiveStatus') :
                    t('diseasesFeaturedStatus')}</span>
              <ChevronDown className={`theme-text-muted transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            {statusDropdownOpen && (
              <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div
                  onClick={() => { setSelectedStatus('all'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('diseasesAllStatuses')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('active'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('diseasesActiveStatus')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('inactive'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('diseasesInactiveStatus')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('featured'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('diseasesFeaturedStatus')}
                </div>
              </div>
            )}
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
                    <p className="theme-text-muted text-sm font-medium">{t('diseasesData')}</p>
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
                  {disease.active ? t('diseasesActive') : t('diseasesInactiveStatus')}
                </span>
                {disease.featured && (
                  <span className="px-3 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-full flex items-center space-x-1">
                    <Star size={12} />
                    <span>{t('diseasesFeatured')}</span>
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
                  <span>{disease.symptoms?.length || 0} {t('diseasesSymptomsCount')}</span>
                  <span>{disease.treatment_methods?.length || 0} {t('diseasesMethodsCount')}</span>
                  <span>{disease.prevention_tips?.length || 0} {t('diseasesTipsCount')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t theme-border">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(disease)}
                    className="flex items-center space-x-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 transform hover:scale-105"
                    title={t('diseasesEditBtn')}
                  >
                    <Edit size={16} />
                    <span className="text-xs font-medium hidden sm:inline">{t('diseasesEditBtn')}</span>
                  </button>
                  <a
                    href={`/diseases/${disease.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 transform hover:scale-105"
                    title={t('diseasesView')}
                  >
                    <Eye size={16} />
                    <span className="text-xs font-medium hidden sm:inline">{t('diseasesView')}</span>
                  </a>
                  <button
                    onClick={() => handleDelete(disease.id, disease.name)}
                    disabled={deleteLoading === disease.id}
                    className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    title={t('diseasesDelete')}
                  >
                    {deleteLoading === disease.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span className="text-xs font-medium hidden sm:inline">{t('diseasesDelete')}</span>
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
            {t('diseasesNotFound')}
          </h3>
          <p className="theme-text-muted mb-6">
            {t('diseasesChangeSearchOrAdd')}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>{t('diseasesAddFirst')}</span>
          </button>
        </div>
      )}

      {/* Create Disease Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-4xl w-full max-h-[90vh]">
            <div style={{ maxHeight: 'calc(90vh - 4rem)', overflowY: 'auto' }}>
              <style dangerouslySetInnerHTML={{
                __html: `
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `
              }} />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold theme-text">{t('diseasesAddNew')}</h3>
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
                <h4 className="text-lg font-semibold theme-text">{t('diseasesInformation')}</h4>
                <div className="flex space-x-1 bg-gray-50 rounded-lg p-1 overflow-x-auto">
                  {[
                    { code: 'uz', label: 'O\'zbek', flag: '🇺🇿', bgClass: 'bg-nav-500', textClass: 'text-white' },
                    { code: 'ru', label: 'Русский', flag: '🇷🇺', bgClass: 'bg-primary-500', textClass: 'text-white' },
                    { code: 'en', label: 'English', flag: '🇺🇸', bgClass: 'bg-highlight-500', textClass: 'text-gray-800' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveLanguageTab(lang.code as 'uz' | 'ru' | 'en')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                        activeLanguageTab === lang.code
                          ? lang.bgClass + ' ' + lang.textClass + ' shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="hidden sm:inline">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  {t('diseasesName')} ({languages.find(l => l.code === activeLanguageTab)?.label}) *
                </label>
                {activeLanguageTab === 'uz' ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                    placeholder={t('diseasesName')}
                  />
                ) : (
                  <input
                    type="text"
                    name="name"
                    value={formData.translations?.[activeLanguageTab]?.name || ''}
                    onChange={handleTranslationChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                    placeholder="Kasallik nomi"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  {t('diseasesDescription')} ({languages.find(l => l.code === activeLanguageTab)?.label}) *
                </label>
                {activeLanguageTab === 'uz' ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-vertical"
                    placeholder={t('diseasesDetailedInfo')}
                  />
                ) : (
                  <textarea
                    name="description"
                    value={formData.translations?.[activeLanguageTab]?.description || ''}
                    onChange={handleTranslationChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-vertical"
                    placeholder="Kasallik haqida batafsil ma'lumot"
                  />
                )}
              </div>


              {/* SEO Settings - Only show when editing */}
              {editingDisease && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Meta Title ({languages.find(l => l.code === activeLanguageTab)?.label})
                      </label>
                      {activeLanguageTab === 'uz' ? (
                        <input
                          type="text"
                          value={formData.meta_title || ''}
                          onChange={(e) => handleInputChange('meta_title', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                          placeholder="SEO uchun sarlavha"
                          maxLength={60}
                        />
                      ) : (
                        <input
                          type="text"
                          name="meta_title"
                          value={formData.translations?.[activeLanguageTab]?.meta_title || ''}
                          onChange={handleTranslationChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                          placeholder="SEO uchun sarlavha"
                          maxLength={60}
                        />
                      )}
                      <p className="text-xs theme-text-muted mt-1">
                        {activeLanguageTab === 'uz'
                          ? (formData.meta_title?.length || 0)
                          : (formData.translations?.[activeLanguageTab]?.meta_title?.length || 0)
                        }/60 belgidan iborat
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        URL Slug ({languages.find(l => l.code === activeLanguageTab)?.label})
                      </label>
                      {activeLanguageTab === 'uz' ? (
                        <input
                          type="text"
                          value={formData.slug || ''}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                          placeholder="url-uchun-slug"
                        />
                      ) : (
                        <input
                          type="text"
                          name="slug"
                          value={formData.translations?.[activeLanguageTab]?.slug || ''}
                          onChange={handleTranslationChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                          placeholder="url-uchun-slug"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Meta Description ({languages.find(l => l.code === activeLanguageTab)?.label})
                    </label>
                    {activeLanguageTab === 'uz' ? (
                      <textarea
                        value={formData.meta_description || ''}
                        onChange={(e) => handleInputChange('meta_description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-vertical"
                        placeholder="SEO uchun tavsif"
                        maxLength={160}
                      />
                    ) : (
                      <textarea
                        name="meta_description"
                        value={formData.translations?.[activeLanguageTab]?.meta_description || ''}
                        onChange={handleTranslationChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-vertical"
                        placeholder="SEO uchun tavsif"
                        maxLength={160}
                      />
                    )}
                    <p className="text-xs theme-text-muted mt-1">
                      {activeLanguageTab === 'uz'
                        ? (formData.meta_description?.length || 0)
                        : (formData.translations?.[activeLanguageTab]?.meta_description?.length || 0)
                      }/160 belgidan iborat
                    </p>
                  </div>
                </>
              )}


              {/* Media Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    {t('diseasesImage')}
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
                      <p className="text-xs theme-text-secondary">{t('diseasesUploadImage')}</p>
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
                    {t('diseasesYoutubeUrl')}
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtube_url || ''}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Medical Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    {t('diseasesSymptoms')}
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder={t('diseasesNewSymptom')}
                        value={activeLanguageTab === 'uz' ? newSymptomUz : activeLanguageTab === 'ru' ? newSymptomRu : newSymptomEn}
                        onChange={(e) => {
                          if (activeLanguageTab === 'uz') setNewSymptomUz(e.target.value);
                          else if (activeLanguageTab === 'ru') setNewSymptomRu(e.target.value);
                          else setNewSymptomEn(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 text-sm"
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
                      {(activeLanguageTab === 'uz' ? formData.symptoms : formData.translations?.[activeLanguageTab]?.symptoms || []).map((symptom, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg text-sm border border-blue-600 dark:border-blue-500"
                        >
                          <span>{symptom}</span>
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom)}
                            className="text-white hover:text-blue-100 transition-colors duration-200"
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
                    {t('diseasesTreatmentMethods')}
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder={t('diseasesNewTreatment')}
                        value={activeLanguageTab === 'uz' ? newTreatmentUz : activeLanguageTab === 'ru' ? newTreatmentRu : newTreatmentEn}
                        onChange={(e) => {
                          if (activeLanguageTab === 'uz') setNewTreatmentUz(e.target.value);
                          else if (activeLanguageTab === 'ru') setNewTreatmentRu(e.target.value);
                          else setNewTreatmentEn(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTreatment())}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 text-sm"
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
                      {(activeLanguageTab === 'uz' ? formData.treatment_methods : formData.translations?.[activeLanguageTab]?.treatment_methods || []).map((treatment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg text-sm border border-blue-600 dark:border-blue-500"
                        >
                          <span>{treatment}</span>
                          <button
                            type="button"
                            onClick={() => removeTreatment(treatment)}
                            className="text-white hover:text-blue-100 transition-colors duration-200"
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
                    {t('diseasesPreventionTips')}
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder={t('diseasesNewPrevention')}
                        value={activeLanguageTab === 'uz' ? newPreventionUz : activeLanguageTab === 'ru' ? newPreventionRu : newPreventionEn}
                        onChange={(e) => {
                          if (activeLanguageTab === 'uz') setNewPreventionUz(e.target.value);
                          else if (activeLanguageTab === 'ru') setNewPreventionRu(e.target.value);
                          else setNewPreventionEn(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrevention())}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 text-sm"
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
                      {(activeLanguageTab === 'uz' ? formData.prevention_tips : formData.translations?.[activeLanguageTab]?.prevention_tips || []).map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg text-sm border border-blue-600 dark:border-blue-500"
                        >
                          <span>{tip}</span>
                          <button
                            type="button"
                            onClick={() => removePrevention(tip)}
                            className="text-white hover:text-blue-100 transition-colors duration-200"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  <span className="text-sm theme-text-secondary">{t('diseasesActiveCheckbox')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">{t('diseasesFeaturedCheckbox')}</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  {t('diseasesCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? t('diseasesCreating') : t('diseasesCreate')}</span>
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Disease Modal */}
      {showEditModal && editingDisease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">{t('diseasesEdit')}</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text p-1 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
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
                <div className="flex space-x-1 bg-gray-50 rounded-lg p-1 overflow-x-auto">
                  {[
                    { code: 'uz', label: 'O\'zbek', flag: '🇺🇿', bgClass: 'bg-nav-500', textClass: 'text-white' },
                    { code: 'ru', label: 'Русский', flag: '🇷🇺', bgClass: 'bg-primary-500', textClass: 'text-white' },
                    { code: 'en', label: 'English', flag: '🇺🇸', bgClass: 'bg-highlight-500', textClass: 'text-gray-800' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveLanguageTab(lang.code as 'uz' | 'ru' | 'en')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
                        activeLanguageTab === lang.code
                          ? lang.bgClass + ' ' + lang.textClass + ' shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="hidden sm:inline">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                    placeholder="Kasallik nomi"
                  />
                ) : (
                  <input
                    type="text"
                    name="name"
                    value={formData.translations?.[activeLanguageTab]?.name || ''}
                    onChange={handleTranslationChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                    placeholder="Kasallik nomi"
                  />
                )}
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-vertical"
                    placeholder="Kasallik haqida batafsil ma'lumot"
                  />
                ) : (
                  <textarea
                    name="description"
                    value={formData.translations?.[activeLanguageTab]?.description || ''}
                    onChange={handleTranslationChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-vertical"
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
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
                        placeholder="Yangi belgi (vergul bilan ajrating)"
                        value={activeLanguageTab === 'uz' ? newSymptomUz : activeLanguageTab === 'ru' ? newSymptomRu : newSymptomEn}
                        onChange={(e) => {
                          if (activeLanguageTab === 'uz') setNewSymptomUz(e.target.value);
                          else if (activeLanguageTab === 'ru') setNewSymptomRu(e.target.value);
                          else setNewSymptomEn(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 text-sm"
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
                      {(activeLanguageTab === 'uz' ? formData.symptoms : formData.translations?.[activeLanguageTab]?.symptoms || []).map((symptom, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg text-sm border border-blue-600 dark:border-blue-500"
                        >
                          <span>{symptom}</span>
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom)}
                            className="text-white hover:text-blue-100 transition-colors duration-200"
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
                        placeholder="Davolash usuli (vergul bilan ajrating)"
                        value={activeLanguageTab === 'uz' ? newTreatmentUz : activeLanguageTab === 'ru' ? newTreatmentRu : newTreatmentEn}
                        onChange={(e) => {
                          if (activeLanguageTab === 'uz') setNewTreatmentUz(e.target.value);
                          else if (activeLanguageTab === 'ru') setNewTreatmentRu(e.target.value);
                          else setNewTreatmentEn(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTreatment())}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 text-sm"
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
                      {(activeLanguageTab === 'uz' ? formData.treatment_methods : formData.translations?.[activeLanguageTab]?.treatment_methods || []).map((treatment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg text-sm border border-blue-600 dark:border-blue-500"
                        >
                          <span>{treatment}</span>
                          <button
                            type="button"
                            onClick={() => removeTreatment(treatment)}
                            className="text-white hover:text-blue-100 transition-colors duration-200"
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
                        placeholder="Profilaktika maslahati (vergul bilan ajrating)"
                        value={activeLanguageTab === 'uz' ? newPreventionUz : activeLanguageTab === 'ru' ? newPreventionRu : newPreventionEn}
                        onChange={(e) => {
                          if (activeLanguageTab === 'uz') setNewPreventionUz(e.target.value);
                          else if (activeLanguageTab === 'ru') setNewPreventionRu(e.target.value);
                          else setNewPreventionEn(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrevention())}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 text-sm"
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
                      {(activeLanguageTab === 'uz' ? formData.prevention_tips : formData.translations?.[activeLanguageTab]?.prevention_tips || []).map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg text-sm border border-blue-600 dark:border-blue-500"
                        >
                          <span>{tip}</span>
                          <button
                            type="button"
                            onClick={() => removePrevention(tip)}
                            className="text-white hover:text-blue-100 transition-colors duration-200"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  <span>{isSubmitting ? t('diseasesSaving') : t('diseasesSave')}</span>
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
