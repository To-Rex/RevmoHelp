import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Upload, 
  X, 
  Plus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Image as ImageIcon,
  Video,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { createPost, updatePost, getPostById, checkSlugUniqueness } from '../lib/posts';
import { getCategories } from '../lib/categories';
import type { CreatePostData } from '../lib/posts';

interface PostFormData {
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  category_id: string;
  tags: string[];
  post_type: 'text' | 'image' | 'video';
  featured_image?: File;
  youtube_url?: string;
  content: string;
  excerpt: string;
  published: boolean;
  translations: {
    ru: {
      title: string;
      content: string;
      excerpt: string;
      meta_title: string;
      meta_description: string;
      slug: string;
    };
    en: {
      title: string;
      content: string;
      excerpt: string;
      meta_title: string;
      meta_description: string;
      slug: string;
    };
  };
}

const DoctorCreatePost: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [categories, setCategories] = useState<any[]>([]);
  const [activeLanguageTab, setActiveLanguageTab] = useState<'uz' | 'ru' | 'en'>('uz');
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    category_id: '',
    tags: [],
    post_type: 'text',
    content: '',
    excerpt: '',
    published: false,
    translations: {
      ru: {
        title: '',
        content: '',
        excerpt: '',
        meta_title: '',
        meta_description: '',
        slug: ''
      },
      en: {
        title: '',
        content: '',
        excerpt: '',
        meta_title: '',
        meta_description: '',
        slug: ''
      }
    }
  });

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadPost();
    }
  }, [isEditing, id]);

  const loadCategories = async () => {
    try {
      const { data } = await getCategories();
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPost = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data } = await getPostById(id);
      
      if (data) {
        setFormData({
          title: data.title,
          slug: data.slug,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          category_id: data.category_id || '',
          tags: data.tags || [],
          post_type: data.youtube_url ? 'video' : data.featured_image_url ? 'image' : 'text',
          youtube_url: data.youtube_url || '',
          content: data.content,
          excerpt: data.excerpt,
          published: data.published,
          translations: {
            ru: (() => {
              const ruTranslation = data.translations?.find((t: any) => t.language === 'ru');
              return ruTranslation ? {
                title: ruTranslation.title || '',
                content: ruTranslation.content || '',
                excerpt: ruTranslation.excerpt || '',
                meta_title: ruTranslation.meta_title || '',
                meta_description: ruTranslation.meta_description || '',
                slug: ruTranslation.slug || ''
              } : {
                title: '',
                content: '',
                excerpt: '',
                meta_title: '',
                meta_description: '',
                slug: ''
              };
            })(),
            en: (() => {
              const enTranslation = data.translations?.find((t: any) => t.language === 'en');
              return enTranslation ? {
                title: enTranslation.title || '',
                content: enTranslation.content || '',
                excerpt: enTranslation.excerpt || '',
                meta_title: enTranslation.meta_title || '',
                meta_description: enTranslation.meta_description || '',
                slug: enTranslation.slug || ''
              } : {
                title: '',
                content: '',
                excerpt: '',
                meta_title: '',
                meta_description: '',
                slug: ''
              };
            })()
          }
        });
        
        if (data.featured_image_url) {
          setImagePreview(data.featured_image_url);
        }
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setMessage({ type: 'error', text: 'Maqolani yuklashda xatolik yuz berdi' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (formData.content && !formData.excerpt && activeLanguageTab === 'uz') {
      const excerpt = formData.content
        .replace(/[#*`]/g, '')
        .substring(0, 200)
        .trim() + '...';
      setFormData(prev => ({ ...prev, excerpt }));
    }
  }, [formData.content, activeLanguageTab]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLanguageTab]: {
          ...prev.translations[activeLanguageTab],
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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Sarlavha kiritilishi shart' });
      return false;
    }
    if (!formData.content.trim()) {
      setMessage({ type: 'error', text: 'Maqola matni kiritilishi shart' });
      return false;
    }
    if (!formData.category_id) {
      setMessage({ type: 'error', text: 'Kategoriya tanlanishi shart' });
      return false;
    }
    if (formData.post_type === 'video' && !formData.youtube_url) {
      setMessage({ type: 'error', text: 'Video turi uchun YouTube URL kiritilishi shart' });
      return false;
    }

    // Check slug uniqueness
    const { isUnique } = await checkSlugUniqueness(formData.slug, 'uz', isEditing ? id : undefined);
    if (!isUnique) {
      setMessage({ type: 'error', text: 'Bu URL (slug) allaqachon mavjud. Boshqa sarlavha yozing yoki URL ni o\'zgartiring.' });
      return false;
    }

    // Check Russian slug uniqueness if provided
    if (formData.translations.ru.slug) {
      const { isUnique: isRuSlugUnique } = await checkSlugUniqueness(formData.translations.ru.slug, 'ru', isEditing ? id : undefined);
      if (!isRuSlugUnique) {
        setMessage({ type: 'error', text: 'Rus tilidagi URL (slug) allaqachon mavjud.' });
        return false;
      }
    }

    // Check English slug uniqueness if provided
    if (formData.translations.en.slug) {
      const { isUnique: isEnSlugUnique } = await checkSlugUniqueness(formData.translations.en.slug, 'en', isEditing ? id : undefined);
      if (!isEnSlugUnique) {
        setMessage({ type: 'error', text: 'Ingliz tilidagi URL (slug) allaqachon mavjud.' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!(await validateForm())) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const postData: CreatePostData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...',
        slug: formData.slug,
        featured_image: formData.featured_image,
        youtube_url: formData.youtube_url,
        category_id: formData.category_id,
        tags: formData.tags,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        published: !isDraft,
        translations: formData.translations
      };

      let result;
      if (isEditing) {
        result = await updatePost({ id: id!, ...postData });
      } else {
        result = await createPost(postData);
      }

      if (result.error) {
        setMessage({ type: 'error', text: 'Xatolik: ' + result.error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: isEditing 
            ? 'Maqola muvaffaqiyatli yangilandi!' 
            : isDraft 
              ? 'Qoralama saqlandi!' 
              : 'Maqola nashr etildi!'
        });
        
        setTimeout(() => {
          navigate('/doctor/posts');
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/posts/${formData.slug}`, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">Kirish Talab Etiladi</h1>
          <p className="theme-text-secondary mb-6">Maqola yaratish uchun tizimga kirishingiz kerak.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'doctor') {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">Ruxsat Yo'q</h1>
          <p className="theme-text-secondary mb-6">Bu sahifa faqat shifokorlar uchun.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Maqola yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <SEOHead
        title={isEditing ? "Maqolani Tahrirlash" : "Yangi Maqola Yaratish"}
        description="Shifokor uchun maqola yaratish va tahrirlash"
        keywords="maqola yaratish, tibbiy yozuv, shifokor"
        url={`https://revmohelp.uz/doctor/posts/${isEditing ? 'edit/' + id : 'create'}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/doctor/posts"
              className="p-2 theme-text-secondary hover:theme-text rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold theme-text">
                {isEditing ? 'Maqolani Tahrirlash' : 'Yangi Maqola Yaratish'}
              </h1>
              <p className="theme-text-secondary">
                {isEditing ? 'Mavjud maqolani tahrirlang' : 'Yangi tibbiy maqola yozing'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreview}
              disabled={!formData.slug}
              className="flex items-center space-x-2 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200 disabled:opacity-50"
            >
              <Eye size={16} />
              <span>Ko'rish</span>
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex items-center space-x-2 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200 disabled:opacity-50"
            >
              <Save size={16} />
              <span>Qoralama</span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Saqlanmoqda...' : 'Nashr etish'}</span>
            </button>
          </div>
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <label className="block text-sm font-medium theme-text-secondary mb-3">
                Maqola Sarlavhasi
              </label>
              <input
                type="text"
                placeholder="Maqola sarlavhasini kiriting"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text text-lg font-medium"
              />
            </div>

            {/* Slug */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                URL Slug
              </label>
              <div className="flex items-center space-x-2">
                <span className="theme-text-muted text-sm">revmoinfo.uz/posts/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                />
              </div>
            </div>

            {/* Post Type */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <label className="block text-sm font-medium theme-text-secondary mb-4">
                Maqola Turi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { type: 'text', icon: FileText, label: 'Matn Maqolasi' },
                  { type: 'image', icon: ImageIcon, label: 'Rasm Maqolasi' },
                  { type: 'video', icon: Video, label: 'Video Maqolasi' },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('post_type', type)}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      formData.post_type === type
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
            {(formData.post_type === 'image' || formData.post_type === 'video') && (
              <div className="bg-white rounded-lg theme-shadow theme-border border p-6 animate-fade-in">
                {formData.post_type === 'image' && (
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-4">
                      Asosiy Rasm
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
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 theme-border border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200">
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
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                )}

                {formData.post_type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.youtube_url || ''}
                      onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                      className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Content Editor */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              {/* Language Tabs */}
              <div className="flex items-center justify-between mb-6">
                <label className="block text-sm font-medium theme-text-secondary">
                  Maqola Matni
                </label>
                <div className="flex space-x-1 bg-white theme-border border rounded-lg p-1">
                  {[
                    { code: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
                    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                    { code: 'en', label: 'English', flag: '🇺🇸' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveLanguageTab(lang.code as 'uz' | 'ru' | 'en')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                        activeLanguageTab === lang.code
                          ? 'bg-blue-50 dark:bg-blue-900/20 theme-text shadow-sm'
                          : 'theme-text-secondary hover:theme-text'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Content for each language */}
              {activeLanguageTab === 'uz' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Maqola sarlavhasi (O'zbek)"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text font-semibold"
                  />
                  <textarea
                    rows={12}
                    placeholder="Tibbiy maqola matnini shu yerga yozing... (O'zbek tilida)"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                  />
                  <div className="text-sm theme-text-muted">
                    {formData.content.length} belgi
                  </div>
                </div>
              )}

              {activeLanguageTab === 'ru' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Заголовок статьи (Русский)"
                    value={formData.translations.ru.title}
                    onChange={handleTranslationChange}
                    name="title"
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text font-semibold"
                  />
                  <textarea
                    rows={12}
                    placeholder="Текст медицинской статьи... (на русском языке)"
                    value={formData.translations.ru.content}
                    onChange={handleTranslationChange}
                    name="content"
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                  />
                  <div className="text-sm theme-text-muted">
                    {formData.translations.ru.content.length} символов
                  </div>
                </div>
              )}

              {activeLanguageTab === 'en' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Article title (English)"
                    value={formData.translations.en.title}
                    onChange={handleTranslationChange}
                    name="title"
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text font-semibold"
                  />
                  <textarea
                    rows={12}
                    placeholder="Medical article content... (in English)"
                    value={formData.translations.en.content}
                    onChange={handleTranslationChange}
                    name="content"
                    className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                  />
                  <div className="text-sm theme-text-muted">
                    {formData.translations.en.content.length} characters
                  </div>
                </div>
              )}
            </div>

            {/* Translation Excerpts */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <label className="block text-sm font-medium theme-text-secondary mb-4">
                Qisqacha Mazmun ({activeLanguageTab === 'uz' ? "O'zbek" : activeLanguageTab === 'ru' ? 'Русский' : 'English'})
              </label>
              
              {activeLanguageTab === 'uz' && (
                <textarea
                  rows={3}
                  placeholder="Maqolaning qisqacha mazmuni (avtomatik yaratiladi)"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                />
              )}

              {activeLanguageTab === 'ru' && (
                <textarea
                  rows={3}
                  placeholder="Краткое содержание статьи"
                  value={formData.translations.ru.excerpt}
                  onChange={handleTranslationChange}
                  name="excerpt"
                  className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                />
              )}

              {activeLanguageTab === 'en' && (
                <textarea
                  rows={3}
                  placeholder="Article excerpt"
                  value={formData.translations.en.excerpt}
                  onChange={handleTranslationChange}
                  name="excerpt"
                  className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                />
              )}
            </div>

            {/* SEO for each language */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <h3 className="text-lg font-semibold theme-text mb-4">
                SEO Sozlamalari ({activeLanguageTab === 'uz' ? "O'zbek" : activeLanguageTab === 'ru' ? 'Русский' : 'English'})
              </h3>
              
              {activeLanguageTab === 'uz' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Meta Sarlavha
                    </label>
                    <input
                      type="text"
                      placeholder="Qidiruv tizimlari uchun sarlavha"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                    />
                    <div className="mt-1 text-xs theme-text-muted">
                      {formData.meta_title.length}/60 belgi
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Meta Tavsif
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Qidiruv tizimlari uchun qisqacha tavsif"
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                    />
                    <div className="mt-1 text-xs theme-text-muted">
                      {formData.meta_description.length}/160 belgi
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      URL Slug
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="theme-text-muted text-sm">revmoinfo.uz/posts/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeLanguageTab === 'ru' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Meta заголовок
                    </label>
                    <input
                      type="text"
                      placeholder="Заголовок для поисковых систем"
                      value={formData.translations.ru.meta_title}
                      onChange={handleTranslationChange}
                      name="meta_title"
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                    />
                    <div className="mt-1 text-xs theme-text-muted">
                      {formData.translations.ru.meta_title.length}/60 символов
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Meta описание
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Краткое описание для поисковых систем"
                      value={formData.translations.ru.meta_description}
                      onChange={handleTranslationChange}
                      name="meta_description"
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                    />
                    <div className="mt-1 text-xs theme-text-muted">
                      {formData.translations.ru.meta_description.length}/160 символов
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      URL Slug
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="theme-text-muted text-sm">revmohelp.uz/ru/posts/</span>
                      <input
                        type="text"
                        value={formData.translations.ru.slug}
                        onChange={handleTranslationChange}
                        name="slug"
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeLanguageTab === 'en' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      placeholder="Title for search engines"
                      value={formData.translations.en.meta_title}
                      onChange={handleTranslationChange}
                      name="meta_title"
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                    />
                    <div className="mt-1 text-xs theme-text-muted">
                      {formData.translations.en.meta_title.length}/60 characters
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief description for search engines"
                      value={formData.translations.en.meta_description}
                      onChange={handleTranslationChange}
                      name="meta_description"
                      className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text resize-none"
                    />
                    <div className="mt-1 text-xs theme-text-muted">
                      {formData.translations.en.meta_description.length}/160 characters
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      URL Slug
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="theme-text-muted text-sm">revmohelp.uz/en/posts/</span>
                      <input
                        type="text"
                        value={formData.translations.en.slug}
                        onChange={handleTranslationChange}
                        name="slug"
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Translation Progress */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <h3 className="text-lg font-semibold theme-text mb-4">Tarjima Holati</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl theme-border border">
                  <div className="text-2xl mb-2">🇺🇿</div>
                  <div className="text-sm font-medium theme-text">O'zbek</div>
                  <div className={`text-xs mt-1 ${formData.title && formData.content ? 'text-green-600' : 'theme-text-muted'}`}>
                    {formData.title && formData.content ? 'Tayyor' : 'To\'ldirilmagan'}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl theme-border border">
                  <div className="text-2xl mb-2">🇷🇺</div>
                  <div className="text-sm font-medium theme-text">Русский</div>
                  <div className={`text-xs mt-1 ${formData.translations.ru.title && formData.translations.ru.content ? 'text-green-600' : 'theme-text-muted'}`}>
                    {formData.translations.ru.title && formData.translations.ru.content ? 'Готово' : 'Не заполнено'}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl theme-border border">
                  <div className="text-2xl mb-2">🇺🇸</div>
                  <div className="text-sm font-medium theme-text">English</div>
                  <div className={`text-xs mt-1 ${formData.translations.en.title && formData.translations.en.content ? 'text-green-600' : 'theme-text-muted'}`}>
                    {formData.translations.en.title && formData.translations.en.content ? 'Ready' : 'Not filled'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Publish Settings */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <h3 className="text-lg font-semibold theme-text mb-4">Nashr Sozlamalari</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => handleInputChange('published', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium theme-text-secondary">
                    Darhol nashr etish
                  </span>
                </label>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <label className="block text-sm font-medium theme-text-secondary mb-3">
                Kategoriya
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
              >
                <option value="">Kategoriya tanlang</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg theme-shadow theme-border border p-6">
              <label className="block text-sm font-medium theme-text-secondary mb-3">
                Teglar
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Teg qo'shish"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white theme-text"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="theme-accent hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCreatePost;