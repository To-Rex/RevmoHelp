import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Stethoscope, 
  Award, 
  Eye, 
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Upload,
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  Shield,
  Globe
} from 'lucide-react';
import { 
  getDoctors, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor, 
  checkDoctorEmailUniqueness 
} from '../../lib/doctors';
import type { Doctor, CreateDoctorData } from '../../lib/doctors';

import { supabase } from '../../lib/supabase';
const DoctorsManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeLanguageTab, setActiveLanguageTab] = useState<'uz' | 'ru' | 'en'>('uz');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<CreateDoctorData>({
    full_name: '',
    email: '',
    phone: '',
    specialization: '',
    experience_years: 0,
    bio: '',
    avatar_url: '',
    certificates: [],
    verified: false,
    active: true,
    order_index: 0,
    translations: {
      ru: { bio: '', specialization: '' },
      en: { bio: '', specialization: '' }
    }
  });

  const [newCertificate, setNewCertificate] = useState('');

  const languages = [
    { code: 'uz' as const, label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru' as const, label: 'Русский', flag: '🇷🇺' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' }
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    console.log('🔄 Loading doctors in DoctorsManagement component');
    setLoading(true);
    try {
      const { data } = await getDoctors();
      console.log('📋 Doctors received in component:', data?.length || 0, data?.map(d => ({ id: d.id, name: d.full_name, email: d.email })));
      if (data) {
        setDoctors(data);
      }
    } catch (error) {
      console.log('❌ Error loading doctors in component:', error);
      setMessage({ type: 'error', text: 'Shifokorlarni yuklashda xatolik' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [parent]: {
            ...prev.translations![parent],
            [child]: value
          }
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

  const addCertificate = () => {
    if (newCertificate.trim() && !formData.certificates.includes(newCertificate.trim())) {
      setFormData(prev => ({
        ...prev,
        certificates: [...prev.certificates, newCertificate.trim()]
      }));
      setNewCertificate('');
    }
  };

  const removeCertificate = (certToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(cert => cert !== certToRemove)
    }));
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      specialization: '',
      experience_years: 0,
      bio: '',
      avatar_url: '',
      certificates: [],
      verified: false,
      active: true,
      order_index: 0,
      translations: {
        ru: { bio: '', specialization: '' },
        en: { bio: '', specialization: '' }
      }
    });
    setNewCertificate('');
    setEditingDoctor(null);
    setImagePreview(null);
    setSelectedFile(null);
    setActiveLanguageTab('uz');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setFormData({
      full_name: doctor.full_name,
      email: doctor.email,
      phone: doctor.phone || '',
      specialization: doctor.specialization,
      experience_years: doctor.experience_years,
      bio: doctor.bio || '',
      avatar_url: doctor.avatar_url || '',
      certificates: doctor.certificates || [],
      verified: doctor.verified,
      active: doctor.active,
      order_index: doctor.order_index,
      translations: {
        ru: {
          bio: doctor.translations?.find(t => t.language === 'ru')?.bio || '',
          specialization: doctor.translations?.find(t => t.language === 'ru')?.specialization || ''
        },
        en: {
          bio: doctor.translations?.find(t => t.language === 'en')?.bio || '',
          specialization: doctor.translations?.find(t => t.language === 'en')?.specialization || ''
        }
      }
    });
    setEditingDoctor(doctor);
    setImagePreview(doctor.avatar_url || null);
    setSelectedFile(null);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
    setMessage({ type: '', text: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Rasm hajmi 5MB dan kichik bo\'lishi kerak' });
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, avatar_url: '' }));
  };

  const validateForm = async () => {
    if (!formData.full_name.trim()) {
      setMessage({ type: 'error', text: 'Shifokor ismi kiritilishi shart' });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email kiritilishi shart' });
      return false;
    }
    if (!formData.specialization.trim()) {
      setMessage({ type: 'error', text: 'Mutaxassislik kiritilishi shart' });
      return false;
    }

    // Email noyobligini tekshirish
    const { isUnique } = await checkDoctorEmailUniqueness(
      formData.email, 
      editingDoctor?.id
    );
    
    if (!isUnique) {
      setMessage({ type: 'error', text: 'Bu email allaqachon mavjud. Boshqa email kiriting.' });
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
      let finalFormData = { ...formData };

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`doctors/${fileName}`, selectedFile);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(`doctors/${fileName}`);

        finalFormData.avatar_url = urlData.publicUrl;
      }

      const { data, error } = await createDoctor(finalFormData);

      if (error) {
        setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'Shifokor muvaffaqiyatli yaratildi!' });
        await loadDoctors();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Xatolik yuz berdi: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDoctor || !(await validateForm())) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let finalFormData = { ...formData };

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`doctors/${fileName}`, selectedFile);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(`doctors/${fileName}`);

        finalFormData.avatar_url = urlData.publicUrl;
      }

      const { data, error } = await updateDoctor({
        id: editingDoctor.id,
        ...finalFormData
      });

      if (error) {
        setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'Shifokor muvaffaqiyatli yangilandi!' });
        await loadDoctors();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Xatolik yuz berdi: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doctorId: string, doctorName: string) => {
    if (!confirm(`${doctorName} shifokorni o'chirishni xohlaysizmi?`)) return;

    setDeleteLoading(doctorId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deleteDoctor(doctorId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Shifokor muvaffaqiyatli o\'chirildi!' });
        await loadDoctors();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && doctor.active) ||
                         (selectedStatus === 'inactive' && !doctor.active) ||
                         (selectedStatus === 'verified' && doctor.verified) ||
                         (selectedStatus === 'unverified' && !doctor.verified);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCompletionStatus = (lang: string) => {
    if (lang === 'uz') {
      const hasBasic = !!(formData.full_name && formData.specialization && formData.bio);
      return hasBasic ? 'complete' : 'partial';
    }
    
    const translation = formData.translations?.[lang as keyof typeof formData.translations];
    const hasTranslation = !!(translation?.bio && translation?.specialization);
    return hasTranslation ? 'complete' : 'empty';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Shifokorlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">Shifokorlar Boshqaruvi</h1>
          <p className="theme-text-secondary">Revmoinfo shifokorlarini boshqarish</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Yangi Shifokor</span>
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
          <div className="text-2xl font-bold theme-text">{doctors.length}</div>
          <div className="text-sm theme-text-secondary">Jami shifokorlar</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{doctors.filter(d => d.active).length}</div>
          <div className="text-sm theme-text-secondary">Faol</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-blue-600">{doctors.filter(d => d.verified).length}</div>
          <div className="text-sm theme-text-secondary">Tasdiqlangan</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-purple-600">{doctors.reduce((sum, d) => sum + d.experience_years, 0)}</div>
          <div className="text-sm theme-text-secondary">Jami tajriba (yil)</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-orange-600">{doctors.reduce((sum, d) => sum + d.certificates.length, 0)}</div>
          <div className="text-sm theme-text-secondary">Jami sertifikatlar</div>
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
                placeholder="Shifokorlarni qidiring..."
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
              <option value="all">Barcha shifokorlar</option>
              <option value="active">Faol</option>
              <option value="inactive">Faol emas</option>
              <option value="verified">Tasdiqlangan</option>
              <option value="unverified">Tasdiqlanmagan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="theme-bg rounded-2xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-2 theme-border border overflow-hidden group"
          >
            {/* Doctor Photo */}
            <div className="relative h-48 overflow-hidden">
              {doctor.avatar_url ? (
                <img
                  src={doctor.avatar_url}
                  alt={doctor.full_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full theme-bg-tertiary flex items-center justify-center">
                  <User size={48} className="theme-text-muted opacity-50" />
                </div>
              )}
              
              {/* Status Badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  doctor.active
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {doctor.active ? 'Faol' : 'Faol emas'}
                </span>
                {doctor.verified && (
                  <span className="px-3 py-1 text-xs font-semibold bg-blue-500 text-white rounded-full flex items-center space-x-1">
                    <Award size={12} />
                    <span>Tasdiqlangan</span>
                  </span>
                )}
              </div>

              {/* Order Index */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-gray-800 rounded-full">
                  #{doctor.order_index}
                </span>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold theme-text mb-2 group-hover:theme-accent transition-colors duration-300">
                {doctor.full_name}
              </h3>
              
              <p className="theme-accent font-medium mb-3">
                {doctor.specialization}
              </p>

              {doctor.bio && (
                <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                  {doctor.bio}
                </p>
              )}

              {/* Experience & Contact */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center space-x-2 theme-text-muted">
                  <Calendar size={14} />
                  <span>{doctor.experience_years} yil tajriba</span>
                </div>
                {doctor.email && (
                  <div className="flex items-center space-x-2 theme-text-muted">
                    <Mail size={14} />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center space-x-2 theme-text-muted">
                    <Phone size={14} />
                    <span>{doctor.phone}</span>
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {doctor.certificates.slice(0, 2).map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                  {doctor.certificates.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      +{doctor.certificates.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Doctor Meta */}
              <div className="text-xs theme-text-muted mb-6 p-3 theme-bg-secondary rounded-lg">
                <div>Yaratilgan: {formatDate(doctor.created_at)}</div>
                <div>Yangilangan: {formatDate(doctor.updated_at)}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t theme-border">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(doctor)}
                    className="flex items-center space-x-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 transform hover:scale-105"
                    title="Tahrirlash"
                  >
                    <Edit size={16} />
                    <span className="text-xs font-medium hidden sm:inline">Tahrirlash</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id, doctor.full_name)}
                    disabled={deleteLoading === doctor.id}
                    className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    title="O'chirish"
                  >
                    {deleteLoading === doctor.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span className="text-xs font-medium hidden sm:inline">O'chirish</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Quick Info */}
                <div className="flex items-center space-x-3 text-xs theme-text-muted">
                  <div className="flex items-center space-x-1">
                    <Star size={12} />
                    <span>{doctor.certificates.length} sertifikat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            Shifokor topilmadi
          </h3>
          <p className="theme-text-muted mb-6">
            Qidiruv so'zini o'zgartiring yoki yangi shifokor qo'shing
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Birinchi shifokorni qo'shish</span>
          </button>
        </div>
      )}

      {/* Create Doctor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">Yangi Shifokor Qo'shish</h3>
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

              {/* Language Progress */}
              <div className="theme-bg-secondary rounded-xl p-4">
                <h4 className="text-sm font-semibold theme-text mb-3">Tillar bo'yicha holat</h4>
                <div className="grid grid-cols-3 gap-3">
                  {languages.map((lang) => {
                    const status = getCompletionStatus(lang.code);
                    return (
                      <div
                        key={lang.code}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          activeLanguageTab === lang.code
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'theme-border hover:border-blue-300'
                        }`}
                        onClick={() => setActiveLanguageTab(lang.code)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium theme-text text-sm">{lang.label}</span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
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

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">To'liq ism *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="Dr. Ism Familiya"
                  />
                </div>

                {/* Avatar Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Shifokor Surati
                  </label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 theme-border border-dashed rounded-full cursor-pointer theme-bg-tertiary hover:theme-bg-quaternary transition-colors duration-200">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 mb-2 theme-text-muted" />
                        <p className="text-xs theme-text-secondary text-center">
                          Surat yuklash
                        </p>
                      </div>
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
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="doctor@revmoinfo.uz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Tajriba (yil) *</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Avatar URL</label>
                  <input
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Tartib raqami</label>
                  <input
                    type="number"
                    name="order_index"
                    value={formData.order_index}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>
              </div>

              {/* Language-specific Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold theme-text">
                    Kontent ({languages.find(l => l.code === activeLanguageTab)?.label})
                  </h4>
                  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLanguageTab(lang.code)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-1 ${
                          activeLanguageTab === lang.code
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

                {activeLanguageTab === 'uz' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Mutaxassislik (O'zbek) *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                        placeholder="Revmatologiya"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Biografiya (O'zbek)</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                        placeholder="Shifokor haqida batafsil ma'lumot..."
                      />
                    </div>
                  </div>
                )}

                {activeLanguageTab === 'ru' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Специализация (Русский)</label>
                      <input
                        type="text"
                        name="ru.specialization"
                        value={formData.translations?.ru.specialization || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                        placeholder="Ревматология"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Биография (Русский)</label>
                      <textarea
                        name="ru.bio"
                        value={formData.translations?.ru.bio || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                        placeholder="Подробная информация о враче..."
                      />
                    </div>
                  </div>
                )}

                {activeLanguageTab === 'en' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Specialization (English)</label>
                      <input
                        type="text"
                        name="en.specialization"
                        value={formData.translations?.en.specialization || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                        placeholder="Rheumatology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Biography (English)</label>
                      <textarea
                        name="en.bio"
                        value={formData.translations?.en.bio || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                        placeholder="Detailed information about the doctor..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-3">Sertifikatlar</label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    placeholder="Sertifikat qo'shish"
                    value={newCertificate}
                    onChange={(e) => setNewCertificate(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertificate())}
                    className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                  <button
                    type="button"
                    onClick={addCertificate}
                    className="px-3 py-2 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certificates.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      <span>{cert}</span>
                      <button
                        type="button"
                        onClick={() => removeCertificate(cert)}
                        className="theme-accent hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">Faol</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="verified"
                    checked={formData.verified}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">Tasdiqlangan</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">Shifokorni Tahrirlash</h3>
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

              {/* Language Progress */}
              <div className="theme-bg-secondary rounded-xl p-4">
                <h4 className="text-sm font-semibold theme-text mb-3">Tillar bo'yicha holat</h4>
                <div className="grid grid-cols-3 gap-3">
                  {languages.map((lang) => {
                    const status = getCompletionStatus(lang.code);
                    return (
                      <div
                        key={lang.code}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          activeLanguageTab === lang.code
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'theme-border hover:border-blue-300'
                        }`}
                        onClick={() => setActiveLanguageTab(lang.code)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium theme-text text-sm">{lang.label}</span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
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

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">To'liq ism *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                {/* Avatar Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Shifokor Surati
                  </label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 theme-border border-dashed rounded-full cursor-pointer theme-bg-tertiary hover:theme-bg-quaternary transition-colors duration-200">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 mb-2 theme-text-muted" />
                        <p className="text-xs theme-text-secondary text-center">
                          Surat yuklash
                        </p>
                      </div>
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
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Tajriba (yil) *</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Avatar URL</label>
                  <input
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Tartib raqami</label>
                  <input
                    type="number"
                    name="order_index"
                    value={formData.order_index}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>
              </div>

              {/* Language-specific Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold theme-text">
                    Kontent ({languages.find(l => l.code === activeLanguageTab)?.label})
                  </h4>
                  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLanguageTab(lang.code)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-1 ${
                          activeLanguageTab === lang.code
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

                {activeLanguageTab === 'uz' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Mutaxassislik (O'zbek) *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Biografiya (O'zbek)</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                      />
                    </div>
                  </div>
                )}

                {activeLanguageTab === 'ru' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Специализация (Русский)</label>
                      <input
                        type="text"
                        name="ru.specialization"
                        value={formData.translations?.ru.specialization || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Биография (Русский)</label>
                      <textarea
                        name="ru.bio"
                        value={formData.translations?.ru.bio || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                      />
                    </div>
                  </div>
                )}

                {activeLanguageTab === 'en' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Specialization (English)</label>
                      <input
                        type="text"
                        name="en.specialization"
                        value={formData.translations?.en.specialization || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">Biography (English)</label>
                      <textarea
                        name="en.bio"
                        value={formData.translations?.en.bio || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">Faol</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="verified"
                    checked={formData.verified}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">Tasdiqlangan</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsManagement;