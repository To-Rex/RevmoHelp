import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { createPost, updatePost, getPostById, checkSlugUniqueness } from '../../lib/posts';
import { getCategories } from '../../lib/categories';
import type { Post } from '../../types';
import PostEditor from '../../components/admin/PostEditor';
import PostSidebar from '../../components/admin/PostSidebar';
import PostHeader from '../../components/admin/PostHeader';

export interface PostFormData {
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

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
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
      const { data: post } = await getPostById(id);
      
      if (post) {
        setFormData({
          title: post.title,
          slug: post.slug,
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || '',
          category_id: post.category_id || '',
          tags: post.tags || [],
          post_type: post.youtube_url ? 'video' : post.featured_image_url ? 'image' : 'text',
          youtube_url: post.youtube_url || '',
          content: post.content,
          excerpt: post.excerpt,
          published: post.published,
          translations: {
            ru: (() => {
              const ruTranslation = post.translations?.find((t: any) => t.language === 'ru');
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
              const enTranslation = post.translations?.find((t: any) => t.language === 'en');
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
        
        if (post.featured_image_url) {
          setImagePreview(post.featured_image_url);
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
    if (formData.content && !formData.excerpt) {
      const excerpt = formData.content
        .replace(/[#*`]/g, '')
        .substring(0, 200)
        .trim() + '...';
      setFormData(prev => ({ ...prev, excerpt }));
    }
  }, [formData.content]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
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

  const insertTextFormat = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'qalin matn'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'qiya matn'}*`;
        break;
      case 'h1':
        formattedText = `# ${selectedText || 'Sarlavha 1'}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText || 'Sarlavha 2'}`;
        break;
      case 'h3':
        formattedText = `### ${selectedText || 'Sarlavha 3'}`;
        break;
      case 'ul':
        formattedText = `- ${selectedText || 'Ro\'yxat elementi'}`;
        break;
      case 'ol':
        formattedText = `1. ${selectedText || 'Raqamlangan ro\'yxat'}`;
        break;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
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

    // Check slug uniqueness for main post (Uzbek)
    const { isUnique: isMainSlugUnique } = await checkSlugUniqueness(formData.slug, 'uz', isEditing ? id : undefined);
    if (!isMainSlugUnique) {
      setMessage({ type: 'error', text: 'Bu URL (slug) allaqachon mavjud. Boshqa sarlavha yozing yoki URL ni o\'zgartiring.' });
      return false;
    }

    // Check slug uniqueness for translations
    if (formData.translations.ru.slug) {
      const { isUnique: isRuSlugUnique } = await checkSlugUniqueness(formData.translations.ru.slug, 'ru', isEditing ? id : undefined);
      if (!isRuSlugUnique) {
        setMessage({ type: 'error', text: 'Rus tilidagi URL (slug) allaqachon mavjud.' });
        return false;
      }
    }

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
      const postData = {
        ...formData,
        published: !isDraft,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt
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
          navigate('/admin/posts');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Component */}
      <PostHeader 
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onBack={() => navigate('/admin/posts')}
        onPreview={handlePreview}
        onSaveDraft={() => handleSubmit(true)}
        onPublish={() => handleSubmit(false)}
        canPreview={!!formData.slug}
      />

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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-4 lg:space-y-6 min-w-0">
          <PostEditor 
            formData={formData}
            onInputChange={handleInputChange}
            onFormDataChange={setFormData}
          />
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4 lg:space-y-6">
          <PostSidebar 
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
            onFormDataChange={setFormData}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePost;