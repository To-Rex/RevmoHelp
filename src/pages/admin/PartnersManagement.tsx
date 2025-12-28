import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  ExternalLink,
  Upload,
  Eye,
  Star,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  ArrowUpDown,
  Filter,
  Award,
  Users,
  Briefcase,
  GraduationCap,
  Cpu,
  Heart,
  ChevronDown
} from 'lucide-react';
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  checkPartnerSlugUniqueness
} from '../../lib/partners';
import type { Partner, CreatePartnerData } from '../../lib/partners';

const PartnersManagement: React.FC = () => {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [formData, setFormData] = useState<CreatePartnerData>({
    name: '',
    slug: '',
    logo_url: '',
    website_url: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    partnership_type: 'general',
    active: true,
    featured: false,
    order_index: 0
  });

  const partnershipTypes = [
    { value: 'all', label: t('allTypes'), icon: Building2, color: 'bg-gray-100 text-gray-600' },
    { value: 'medical', label: t('medicalType'), icon: Heart, color: 'bg-red-100 text-red-600' },
    { value: 'education', label: t('educationType'), icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
    { value: 'technology', label: t('technologyType'), icon: Cpu, color: 'bg-purple-100 text-purple-600' },
    { value: 'association', label: t('associationType'), icon: Users, color: 'bg-green-100 text-green-600' },
    { value: 'general', label: t('generalType'), icon: Briefcase, color: 'bg-orange-100 text-orange-600' }
  ];

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const { data } = await getPartners();
      if (data) {
        setPartners(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('errorLoadingPartners') });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (message.text) setMessage({ type: '', text: '' });
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !editingPartner) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, editingPartner]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      logo_url: '',
      website_url: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      partnership_type: 'general',
      active: true,
      featured: false,
      order_index: 0
    });
    setEditingPartner(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (partner: Partner) => {
    setFormData({
      name: partner.name,
      slug: partner.slug,
      logo_url: partner.logo_url || '',
      website_url: partner.website_url || '',
      description: partner.description || '',
      contact_email: partner.contact_email || '',
      contact_phone: partner.contact_phone || '',
      address: partner.address || '',
      partnership_type: partner.partnership_type,
      active: partner.active,
      featured: partner.featured,
      order_index: partner.order_index
    });
    setEditingPartner(partner);
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
      setMessage({ type: 'error', text: t('nameRequired') });
      return false;
    }
    if (!formData.slug.trim()) {
      setMessage({ type: 'error', text: t('slugRequired') });
      return false;
    }

    // Slug noyobligini tekshirish
    const { isUnique } = await checkPartnerSlugUniqueness(
      formData.slug,
      editingPartner?.id
    );

    if (!isUnique) {
      setMessage({ type: 'error', text: t('slugExists') });
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
      const { data, error } = await createPartner(formData);

      if (error) {
        setMessage({ type: 'error', text: t('partnersError') + ': ' + error.message });
      } else {
        setMessage({ type: 'success', text: t('partnerCreated') });
        await loadPartners();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('generalError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPartner || !(await validateForm())) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await updatePartner({
        id: editingPartner.id,
        ...formData
      });

      if (error) {
        setMessage({ type: 'error', text: t('partnersError') + ': ' + error.message });
      } else {
        setMessage({ type: 'success', text: t('partnerUpdated') });
        await loadPartners();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('generalError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (partnerId: string, partnerName: string) => {
    if (!confirm(`${partnerName} ${t('confirmDelete')}`)) return;

    setDeleteLoading(partnerId);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await deletePartner(partnerId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('partnerDeleted') });
        await loadPartners();
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('partnersError') });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (partner.description && partner.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || partner.partnership_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && partner.active) ||
                         (selectedStatus === 'inactive' && !partner.active) ||
                         (selectedStatus === 'featured' && partner.featured);
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    const typeData = partnershipTypes.find(t => t.value === type);
    return typeData?.icon || Building2;
  };

  const getTypeColor = (type: string) => {
    const typeData = partnershipTypes.find(t => t.value === type);
    return typeData?.color || 'bg-gray-100 text-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const typeData = partnershipTypes.find(t => t.value === type);
    return typeData?.label || t('general');
  };

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
          <p className="theme-text-muted">{t('loadingPartners')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">{t('partnersManagementTitle')}</h1>
          <p className="theme-text-secondary">{t('partnersManagementDesc')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>{t('newPartner')}</span>
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
          <div className="text-2xl font-bold theme-text">{partners.length}</div>
          <div className="text-sm theme-text-secondary">{t('totalPartners')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-green-600">{partners.filter(p => p.active).length}</div>
          <div className="text-sm theme-text-secondary">{t('activePartners')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-yellow-600">{partners.filter(p => p.featured).length}</div>
          <div className="text-sm theme-text-secondary">{t('featuredPartners')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-blue-600">{partners.filter(p => p.website_url).length}</div>
          <div className="text-sm theme-text-secondary">{t('partnersWithWebsite')}</div>
        </div>
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-4">
          <div className="text-2xl font-bold text-red-600">{partners.filter(p => !p.active).length}</div>
          <div className="text-sm theme-text-secondary">{t('inactivePartners')}</div>
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
                placeholder={t('searchPartners')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="lg:w-56">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm"
            >
              {partnershipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48 relative">
            <button
              onClick={(e) => { e.stopPropagation(); setStatusDropdownOpen(!statusDropdownOpen); }}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 theme-text text-sm text-left flex items-center justify-between"
            >
              <span>{selectedStatus === 'all' ? t('allStatuses') :
                    selectedStatus === 'active' ? t('activeStatus') :
                    selectedStatus === 'inactive' ? t('inactiveStatus') :
                    t('featuredStatus')}</span>
              <ChevronDown className={`theme-text-muted transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            {statusDropdownOpen && (
              <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div
                  onClick={() => { setSelectedStatus('all'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('allStatuses')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('active'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('activeStatus')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('inactive'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('inactiveStatus')}
                </div>
                <div
                  onClick={() => { setSelectedStatus('featured'); setStatusDropdownOpen(false); }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer theme-text"
                >
                  {t('featuredStatus')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => {
          const TypeIcon = getTypeIcon(partner.partnership_type);
          return (
            <div
              key={partner.id}
              className="theme-bg rounded-2xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-2 theme-border border overflow-hidden group"
            >
              {/* Partner Logo */}
              <div className="relative h-40 theme-bg-tertiary flex items-center justify-center overflow-hidden">
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-h-24 max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center">
                    <Building2 size={48} className="theme-text-muted mx-auto mb-2 opacity-50" />
                    <p className="theme-text-muted text-sm">{t('noLogo')}</p>
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(partner.partnership_type)}`}>
                    {getTypeLabel(partner.partnership_type)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    partner.active
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {partner.active ? t('partnersActive') : t('inactivePartners')}
                  </span>
                  {partner.featured && (
                    <span className="px-3 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-full flex items-center space-x-1">
                      <Star size={12} />
                      <span>{t('featuredPartners')}</span>
                    </span>
                  )}
                </div>

                {/* Order Index */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    #{partner.order_index}
                  </span>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Partner Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold theme-text mb-3 line-clamp-2 group-hover:theme-accent transition-colors duration-300">
                  {partner.name}
                </h3>
                
                {partner.description && (
                  <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                    {partner.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-4 text-sm">
                  {partner.website_url && (
                    <div className="flex items-center space-x-2 theme-text-muted">
                      <Globe size={14} />
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="theme-accent hover:text-blue-800 dark:hover:text-blue-300 truncate"
                      >
                        {partner.website_url.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {partner.contact_email && (
                    <div className="flex items-center space-x-2 theme-text-muted">
                      <Mail size={14} />
                      <span className="truncate">{partner.contact_email}</span>
                    </div>
                  )}
                  {partner.contact_phone && (
                    <div className="flex items-center space-x-2 theme-text-muted">
                      <Phone size={14} />
                      <span>{partner.contact_phone}</span>
                    </div>
                  )}
                  {partner.address && (
                    <div className="flex items-center space-x-2 theme-text-muted">
                      <MapPin size={14} />
                      <span className="truncate">{partner.address}</span>
                    </div>
                  )}
                </div>

                {/* Partner Meta */}
                <div className="text-xs theme-text-muted mb-6 p-3 theme-bg-secondary rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>{t('partnersCreated')}: {formatDate(partner.created_at)}</span>
                    <span>{t('partnersUpdated')}: {formatDate(partner.updated_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t theme-border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(partner)}
                      className="flex items-center space-x-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 transform hover:scale-105"
                      title={t('partnersEdit')}
                    >
                      <Edit size={16} />
                      <span className="text-xs font-medium hidden sm:inline">{t('partnersEdit')}</span>
                    </button>
                    {partner.website_url && (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 transform hover:scale-105"
                        title={t('partnersOpen')}
                      >
                        <ExternalLink size={16} />
                        <span className="text-xs font-medium hidden sm:inline">{t('partnersOpen')}</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(partner.id, partner.name)}
                      disabled={deleteLoading === partner.id}
                      className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      title={t('partnersDelete')}
                    >
                      {deleteLoading === partner.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          <span className="text-xs font-medium hidden sm:inline">{t('partnersDelete')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="flex items-center space-x-3 text-xs theme-text-muted">
                    <TypeIcon size={14} />
                    <span className="truncate max-w-20">{getTypeLabel(partner.partnership_type)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredPartners.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="theme-text-muted mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold theme-text-secondary mb-2">
            {t('partnerNotFound')}
          </h3>
          <p className="theme-text-muted mb-6">
            {t('changeSearchOrAdd')}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>{t('addFirstPartner')}</span>
          </button>
        </div>
      )}

      {/* Create Partner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">{t('addNewPartner')}</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('partnerName')} *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder={t('partnerNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('urlSlug')} *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder={t('slugPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('logoUrl')}</label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder={t('logoPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('website')}</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder={t('websitePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('email')}</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('phone')}</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                    placeholder={t('phonePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('partnershipType')}</label>
                  <select
                    name="partnership_type"
                    value={formData.partnership_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  >
                    {partnershipTypes.slice(1).map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('orderIndex')}</label>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium theme-text-secondary mb-2">{t('address')}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  placeholder={t('addressPlaceholder')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium theme-text-secondary mb-2">{t('description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">{t('partnersActive')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">{t('featuredPartner')}</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  {t('partnersCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? t('creating') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {showEditModal && editingPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">{t('editPartner')}</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('partnerName')} *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">{t('urlSlug')} *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Logo URL</label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Veb-sayt</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Telefon</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Hamkorlik turi</label>
                  <select
                    name="partnership_type"
                    value={formData.partnership_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  >
                    {partnershipTypes.slice(1).map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
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

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Manzil</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Tavsif</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">{t('partnersActive')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm theme-text-secondary">{t('featuredPartner')}</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  {t('partnersCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? t('saving') : t('partnersSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersManagement;