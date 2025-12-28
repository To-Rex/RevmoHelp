import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, CreditCard as Edit, Trash2, Heart, Upload, Eye, Star, User, Calendar, Clock, CheckCircle, AlertCircle, X, Save, Play, FileText, Image as ImageIcon, Video, Award, Stethoscope, Pill, Target, Quote, Filter, TrendingUp, ChevronDown } from 'lucide-react';
import { 
  getPatientStories, 
  createPatientStory, 
  updatePatientStory, 
  deletePatientStory,
  uploadStoryImage
} from '../../lib/patientStories';
import { getDoctors } from '../../lib/doctors';
import { getContentTypeIcon, getContentTypeLabel, getContentTypeColor } from '../../utils/patientStoryHelpers';
import type { PatientStory, CreatePatientStoryData } from '../../lib/patientStories';
import type { Doctor } from '../../lib/doctors';
import PatientStoryForm from '../../components/admin/PatientStoryForm';

const PatientStoriesManagement: React.FC = () => {
  const { t } = useTranslation();
  const [stories, setStories] = useState<PatientStory[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStory, setEditingStory] = useState<PatientStory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [formData, setFormData] = useState<CreatePatientStoryData>({
    patient_name: '',
    age: 25,
    diagnosis: '',
    story_content: '',
    treatment_duration: '',
    outcome: '',
    doctor_name: '',
    content_type: 'text',
    symptoms: [],
    treatment_methods: [],
    medications: [],
    lifestyle_changes: '',
    rating: 5,
    featured: false,
    published: false,
    order_index: 0,
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storiesResult, doctorsResult] = await Promise.all([
        getPatientStories(),
        getDoctors('uz', { active: true, verified: true })
      ]);

      if (storiesResult.data) {
        setStories(storiesResult.data);
      }

      if (doctorsResult.data) {
        setDoctors(doctorsResult.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('psmErrorLoading') });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: t('psmImageSizeError') });
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

  const resetForm = () => {
    setFormData({
      patient_name: '',
      age: 25,
      diagnosis: '',
      story_content: '',
      treatment_duration: '',
      outcome: '',
      doctor_name: '',
      content_type: 'text',
      symptoms: [],
      treatment_methods: [],
      medications: [],
      lifestyle_changes: '',
      rating: 5,
      featured: false,
      published: false,
      order_index: 0,
      meta_title: '',
      meta_description: ''
    });
    setEditingStory(null);
    setImagePreview(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (story: PatientStory) => {
    const translations = (story.translations || []).reduce((acc: any, t: any) => {
      if (t.language === 'ru' || t.language === 'en') {
        acc[t.language] = {
          patient_name: t.patient_name || '',
          diagnosis: t.diagnosis || '',
          story_content: t.story_content || '',
          treatment_duration: t.treatment_duration || '',
          outcome: t.outcome || '',
          doctor_name: t.doctor_name || '',
          symptoms: t.symptoms || story.symptoms || [],
          treatment_methods: t.treatment_methods || story.treatment_methods || [],
          medications: t.medications || story.medications || [],
          lifestyle_changes: t.lifestyle_changes || story.lifestyle_changes || '',
          meta_title: t.meta_title || '',
          meta_description: t.meta_description || ''
        };
      }
      return acc;
    }, {} as Record<string, any>);

    setFormData({
      patient_name: story.patient_name,
      age: story.age,
      diagnosis: story.diagnosis,
      story_content: story.story_content,
      treatment_duration: story.treatment_duration,
      outcome: story.outcome,
      doctor_name: story.doctor_name,
      content_type: story.content_type,
      youtube_url: story.youtube_url,
      symptoms: story.symptoms || [],
      treatment_methods: story.treatment_methods || [],
      medications: story.medications || [],
      lifestyle_changes: story.lifestyle_changes || '',
      rating: story.rating || 5,
      featured: story.featured || false,
      published: story.published || false,
      order_index: story.order_index || 0,
      meta_title: story.meta_title || '',
      meta_description: story.meta_description || '',
      translations
    });
    
    if (story.featured_image_url) {
      setImagePreview(story.featured_image_url);
    }
    
    setEditingStory(story);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!formData.patient_name.trim()) {
      setMessage({ type: 'error', text: t('psmNameRequired') });
      return false;
    }
    if (!formData.diagnosis.trim()) {
      setMessage({ type: 'error', text: t('psmDiagnosisRequired') });
      return false;
    }
    if (!formData.story_content.trim()) {
      setMessage({ type: 'error', text: t('psmContentRequired') });
      return false;
    }
    if (!formData.doctor_name.trim()) {
      setMessage({ type: 'error', text: t('psmDoctorRequired') });
      return false;
    }
    if (formData.content_type === 'video' && !formData.youtube_url) {
      setMessage({ type: 'error', text: t('psmYoutubeRequired') });
      return false;
    }
    return true;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const nextOrderIndex = stories.length > 0
        ? Math.max(...stories.map(s => typeof s.order_index === 'number' ? s.order_index : 0)) + 1
        : 1;

      const payload: CreatePatientStoryData = { ...formData, order_index: nextOrderIndex };

      const { data, error } = await createPatientStory(payload);

      if (error) {
        setMessage({ type: 'error', text: t('psmError') + ': ' + error.message });
      } else {
        setMessage({ type: 'success', text: t('psmCreated') });
        await loadData();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('psmGeneralError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStory || !validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await updatePatientStory({
        id: editingStory.id,
        ...formData
      });

      if (error) {
        setMessage({ type: 'error', text: t('psmError') + ': ' + error.message });
      } else {
        setMessage({ type: 'success', text: t('psmUpdated') });
        await loadData();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('psmGeneralError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (storyId: string, patientName: string) => {
    if (!confirm(`${patientName}${t('psmConfirmDelete')}`)) return;

    setDeleteLoading(storyId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deletePatientStory(storyId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('psmDeleted') });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('psmErrorOccurred') });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.doctor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || story.content_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'published' && story.published) ||
                         (selectedStatus === 'draft' && !story.published) ||
                         (selectedStatus === 'featured' && story.featured);
    return matchesSearch && matchesType && matchesStatus;
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
          <p className="theme-text-muted">{t('psmLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">{t('psmTitle')}</h1>
          <p className="theme-text-secondary">{t('psmDesc')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>{t('psmNewStory')}</span>
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold theme-text">{stories.length}</div>
          <div className="text-sm theme-text-secondary">{t('psmTotalStories')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{stories.filter(s => s.published).length}</div>
          <div className="text-sm theme-text-secondary">{t('psmPublished')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-yellow-600">{stories.filter(s => s.featured).length}</div>
          <div className="text-sm theme-text-secondary">{t('psmFeatured')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-blue-600">{stories.filter(s => s.content_type === 'video').length}</div>
          <div className="text-sm theme-text-secondary">{t('psmVideo')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-purple-600">{stories.filter(s => s.content_type === 'image').length}</div>
          <div className="text-sm theme-text-secondary">{t('psmImage')}</div>
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
                placeholder={t('psmSearch')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
            >
              <option value="all">{t('psmAllTypes')}</option>
              <option value="text">{t('psmText')}</option>
              <option value="image">{t('psmImage')}</option>
              <option value="video">{t('psmVideo')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48 relative">
            <button
              onClick={(e) => { e.stopPropagation(); setStatusDropdownOpen(!statusDropdownOpen); }}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm text-left flex items-center justify-between"
            >
              <span>{selectedStatus === 'all' ? t('psmAllStatuses') :
                    selectedStatus === 'published' ? t('psmPublished') :
                    selectedStatus === 'draft' ? t('psmDraft') :
                    t('psmFeatured')}</span>
              <ChevronDown className={`theme-text-muted transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            {statusDropdownOpen && (
              <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div
                  onClick={() => { setSelectedStatus('all'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('psmAllStatuses')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('published'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('psmPublished')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('draft'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('psmDraft')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('featured'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('psmFeatured')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => {
          const ContentIcon = getContentTypeIcon(story.content_type);
          return (
            <div
              key={story.id}
              className="theme-bg rounded-2xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-2 theme-border border overflow-hidden group"
            >
              {/* Story Media */}
              <div className="relative h-48 overflow-hidden">
                {story.featured_image_url ? (
                  <img
                    src={story.featured_image_url}
                    alt={story.patient_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : story.youtube_url ? (
                  <div className="relative w-full h-full">
                    <img
                      src={`https://img.youtube.com/vi/${story.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                      alt={story.patient_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${story.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
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
                      <ContentIcon size={48} className="theme-text-muted mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                      <p className="theme-text-muted text-sm font-medium">{t('psmTextStory')}</p>
                    </div>
                  </div>
                )}
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getContentTypeColor(story.content_type)}`}>
                    {getContentTypeLabel(story.content_type)}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      story.published
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}
                  >
                    {story.published ? t('psmPublished') : t('psmDraft')}
                  </span>
                  {story.featured && (
                    <span className="px-3 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-full flex items-center space-x-1">
                      <Star size={12} />
                      <span>{t('psmFeatured')}</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 right-4">
                  <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={12} className={`${star <= (story.rating || 5) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold theme-text group-hover:theme-accent transition-colors duration-300">
                    {story.patient_name}
                  </h3>
                  <span className="text-sm theme-text-muted">{story.age} {t('psmYearsOld')}</span>
                </div>
                
                <p className="text-red-600 dark:text-red-400 font-semibold text-sm mb-3">
                  {story.diagnosis}
                </p>

                <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                  {story.story_content}
                </p>

                {/* Story Meta */}
                <div className="flex items-center justify-between text-sm theme-text-muted mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span className="truncate max-w-20">{story.treatment_duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Stethoscope size={14} />
                      <span className="truncate max-w-24">{story.doctor_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{formatDate(story.created_at)}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-between text-xs theme-text-muted mb-4 p-3 theme-bg-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span>{story.symptoms?.length || 0} {t('psmSymptoms')}</span>
                    <span>{story.medications?.length || 0} {t('psmMedications')}</span>
                    <span>{story.treatment_methods?.length || 0} {t('psmMethods')}</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {t('psmSuccessful')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t theme-border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(story)}
                      className="flex items-center space-x-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 transform hover:scale-105"
                      title={t('psmEdit')}
                    >
                      <Edit size={16} />
                      <span className="text-xs font-medium hidden sm:inline">{t('psmEdit')}</span>
                    </button>
                    <a
                      href={`/patient-stories/${story.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 transform hover:scale-105"
                      title={t('psmView')}
                    >
                      <Eye size={16} />
                      <span className="text-xs font-medium hidden sm:inline">{t('psmView')}</span>
                    </a>
                    <button
                      onClick={() => handleDelete(story.id, story.patient_name)}
                      disabled={deleteLoading === story.id}
                      className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      title={t('psmDelete')}
                    >
                      {deleteLoading === story.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          <span className="text-xs font-medium hidden sm:inline">{t('psmDelete')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="flex items-center space-x-2 text-xs theme-text-muted">
                    <Award size={12} />
                    <span>{story.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredStories.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            {t('psmNotFound')}
          </h3>
          <p className="theme-text-muted mb-6">
            {t('psmChangeSearchOrCreate')}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>{t('psmCreateFirst')}</span>
          </button>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">{t('psmNewModal')}</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text p-1 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <PatientStoryForm
                formData={formData}
                doctors={doctors}
                onInputChange={handleInputChange}
                onFormDataChange={setFormData}
                imagePreview={imagePreview}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
              />

              <div className="flex space-x-3 pt-6 mt-6 border-t theme-border">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  {t('psmCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? t('psmCreating') : t('psmCreate')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Story Modal */}
      {showEditModal && editingStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">{t('psmEditModal')}</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text p-1 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <PatientStoryForm
                formData={formData}
                doctors={doctors}
                onInputChange={handleInputChange}
                onFormDataChange={setFormData}
                imagePreview={imagePreview}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
              />

              <div className="flex space-x-3 pt-6 mt-6 border-t theme-border">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  {t('psmCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>{isSubmitting ? t('psmSaving') : t('psmSave')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientStoriesManagement;
