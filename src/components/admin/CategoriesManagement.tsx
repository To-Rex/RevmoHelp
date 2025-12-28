import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Tag,
  Palette,
  Hash,
  FileText
} from 'lucide-react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  checkCategorySlugUniqueness
} from '../../lib/categories';
import type { Category, CreateCategoryData } from '../../lib/categories';

interface CategoriesManagementProps {
  onCategoriesChange?: () => void;
  triggerCreateModal?: boolean;
  onModalClosed?: () => void;
}

const CategoriesManagement: React.FC<CategoriesManagementProps> = ({ onCategoriesChange, triggerCreateModal, onModalClosed }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    slug: '',
    description: '',
    color: '#62B6CB'
  });

  const predefinedColors = [
    '#62B6CB', '#5FA8D3', '#1B4965', '#BEE9E8',
    '#CAE9FF', '#62B6CB', '#1B4965', '#BEE9E8',
    '#5FA8D3', '#CAE9FF', '#62B6CB', '#1B4965'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (triggerCreateModal) {
      setShowCreateModal(true);
      onModalClosed?.();
    }
  }, [triggerCreateModal, onModalClosed]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await getCategories();
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('categoriesLoadingError') });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !editingCategory) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, editingCategory]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#62B6CB'
    });
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color
    });
    setEditingCategory(category);
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
      setMessage({ type: 'error', text: t('categoryNameRequired') });
      return false;
    }
    if (!formData.slug.trim()) {
      setMessage({ type: 'error', text: t('categorySlugRequired') });
      return false;
    }

    // Check slug uniqueness
    const { isUnique } = await checkCategorySlugUniqueness(
      formData.slug,
      editingCategory?.id
    );

    if (!isUnique) {
      setMessage({ type: 'error', text: t('categorySlugExists') });
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
      const { data, error } = await createCategory(formData);

      if (error) {
        setMessage({ type: 'error', text: t('categoriesErrorOccurred') + ': ' + error.message });
      } else {
        setMessage({ type: 'success', text: t('categoryCreated') });
        await loadCategories();
        onCategoriesChange?.();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('categoriesErrorOccurred') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !(await validateForm())) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await updateCategory({
        id: editingCategory.id,
        ...formData
      });

      if (error) {
        setMessage({ type: 'error', text: t('categoriesErrorOccurred') + ': ' + error.message });
      } else {
        setMessage({ type: 'success', text: t('categoryUpdated') });
        await loadCategories();
        onCategoriesChange?.();
        setTimeout(() => {
          closeModals();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('categoriesErrorOccurred') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(t('confirmDeleteCategory', { categoryName }))) return;

    setDeleteLoading(categoryId);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await deleteCategory(categoryId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('categoryDeleted') });
        await loadCategories();
        onCategoriesChange?.();
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('categoriesErrorOccurred') });
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="theme-text-muted text-sm">{t('categoriesLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-lg flex items-center space-x-2 animate-slide-down ${
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="theme-bg rounded-xl theme-shadow hover:theme-shadow-lg transition-all duration-300 theme-border border p-4 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <Tag size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold theme-text">{category.name}</h4>
                  <p className="text-xs theme-text-muted">/{category.slug}</p>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 rounded"
                  title={t('editCategory')}
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  disabled={deleteLoading === category.id}
                  className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded disabled:opacity-50"
                  title={t('deleteCategory')}
                >
                  {deleteLoading === category.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
            {category.description && (
              <p className="theme-text-secondary text-sm line-clamp-2">{category.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">{t('newCategoryModal')}</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text p-1 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">{t('categoryNameLabel')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                  placeholder={t('categoryNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">{t('descriptionLabel')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">{t('colorLabel')}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                        formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-lg border theme-border cursor-pointer"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  {t('cancelButton')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? t('creatingCategory') : t('createCategory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold theme-text">{t('editCategoryModal')}</h3>
              <button
                onClick={closeModals}
                className="theme-text-secondary hover:theme-text p-1 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">{t('categoryNameLabel')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">{t('descriptionLabel')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">{t('colorLabel')}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                        formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-lg border theme-border cursor-pointer"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                >
                  {t('cancelButton')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? t('savingCategory') : t('saveCategory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;