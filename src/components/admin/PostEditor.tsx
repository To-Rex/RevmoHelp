import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  FileText,
  Image as ImageIcon,
  Video,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import type { PostFormData } from '../../pages/admin/CreatePost';

interface PostEditorProps {
  formData: PostFormData;
  onInputChange: (field: string, value: any) => void;
  onFormDataChange: (updater: (prev: PostFormData) => PostFormData) => void;
}

const PostEditor: React.FC<PostEditorProps> = ({
  formData,
  onInputChange,
  onFormDataChange
}) => {
  const [activeLanguageTab, setActiveLanguageTab] = useState<'uz' | 'ru' | 'en'>('uz');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Rasm hajmi 5MB dan kichik bo\'lishi kerak');
        return;
      }

      onInputChange('featured_image', file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onInputChange('featured_image', undefined);
    setImagePreview(null);
  };

  const insertTextFormat = (format: string) => {
    const textarea = document.getElementById(`content-editor-${activeLanguageTab}`) as HTMLTextAreaElement;
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

    const currentContent = activeLanguageTab === 'uz' 
      ? formData.content 
      : formData.translations[activeLanguageTab].content;

    const newContent = 
      currentContent.substring(0, start) + 
      formattedText + 
      currentContent.substring(end);
    
    if (activeLanguageTab === 'uz') {
      onInputChange('content', newContent);
    } else {
      onFormDataChange(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [activeLanguageTab]: {
            ...prev.translations[activeLanguageTab],
            content: newContent
          }
        }
      }));
    }
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Title */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <label className="block text-sm font-medium theme-text-secondary mb-3">
          Maqola Sarlavhasi
        </label>
        <input
          type="text"
          placeholder="Maqola sarlavhasini kiriting"
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-lg font-medium"
        />
      </div>

      {/* Slug */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <label className="block text-sm font-medium theme-text-secondary mb-2">
          URL Slug
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <span className="theme-text-muted text-sm whitespace-nowrap">revmohelp.uz/posts/</span>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => onInputChange('slug', e.target.value)}
            className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text min-w-0"
          />
        </div>
      </div>

      {/* Post Type */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
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
              onClick={() => onInputChange('post_type', type)}
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
        <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6 animate-fade-in">
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
                    onClick={removeImage}
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
                onChange={(e) => onInputChange('youtube_url', e.target.value)}
                className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
              />
            </div>
          )}
        </div>
      )}

      {/* Content Editor */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        {/* Language Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <label className="block text-sm font-medium theme-text-secondary">
            Maqola Matni
          </label>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
            {[
              { code: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
              { code: 'ru', label: 'Русский', flag: '🇷🇺' },
              { code: 'en', label: 'English', flag: '🇺🇸' }
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLanguageTab(lang.code as 'uz' | 'ru' | 'en')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${
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
        
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 lg:gap-2 mb-4 p-3 theme-bg-tertiary rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => insertTextFormat('bold')}
            className="p-2 theme-text-secondary hover:theme-text hover:theme-bg-quaternary rounded transition-colors duration-200 flex-shrink-0"
            title="Qalin"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => insertTextFormat('italic')}
            className="p-2 theme-text-secondary hover:theme-text hover:theme-bg-quaternary rounded transition-colors duration-200 flex-shrink-0"
            title="Qiya"
          >
            <Italic size={16} />
          </button>
          <div className="w-px h-6 theme-border"></div>
          <button
            type="button"
            onClick={() => insertTextFormat('h1')}
            className="p-2 theme-text-secondary hover:theme-text hover:theme-bg-quaternary rounded transition-colors duration-200 flex-shrink-0"
            title="Sarlavha 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            onClick={() => insertTextFormat('h2')}
            className="p-2 theme-text-secondary hover:theme-text hover:theme-bg-quaternary rounded transition-colors duration-200 flex-shrink-0"
            title="Sarlavha 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => insertTextFormat('h3')}
            className="p-2 theme-text-secondary hover:theme-text hover:theme-bg-quaternary rounded transition-colors duration-200 flex-shrink-0"
            title="Sarlavha 3"
          >
            <Heading3 size={16} />
          </button>
          <div className="w-px h-6 theme-border"></div>
          <button
            type="button"
            onClick={() => insertTextFormat('ul')}
            className="p-2 theme-text-secondary hover:theme-text hover:theme-bg-quaternary rounded transition-colors duration-200 flex-shrink-0"
            title="Ro'yxat"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => insertTextFormat('ol')}
            className="p-2 theme-text-secondary hover:theme-text hover:theme-bg-quaternary rounded transition-colors duration-200 flex-shrink-0"
            title="Raqamlangan ro'yxat"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        {/* Content for each language */}
        {activeLanguageTab === 'uz' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Maqola sarlavhasi (O'zbek)"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text font-semibold"
            />
            <textarea
              id="content-editor-uz"
              rows={12}
              placeholder="Tibbiy maqola matnini shu yerga yozing... (O'zbek tilida)"
              value={formData.content}
              onChange={(e) => onInputChange('content', e.target.value)}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
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
              onChange={(e) => onFormDataChange(prev => ({
                ...prev,
                translations: {
                  ...prev.translations,
                  ru: { ...prev.translations.ru, title: e.target.value }
                }
              }))}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text font-semibold"
            />
            <textarea
              id="content-editor-ru"
              rows={12}
              placeholder="Текст медицинской статьи... (на русском языке)"
              value={formData.translations.ru.content}
              onChange={(e) => onFormDataChange(prev => ({
                ...prev,
                translations: {
                  ...prev.translations,
                  ru: { ...prev.translations.ru, content: e.target.value }
                }
              }))}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
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
              onChange={(e) => onFormDataChange(prev => ({
                ...prev,
                translations: {
                  ...prev.translations,
                  en: { ...prev.translations.en, title: e.target.value }
                }
              }))}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text font-semibold"
            />
            <textarea
              id="content-editor-en"
              rows={12}
              placeholder="Medical article content... (in English)"
              value={formData.translations.en.content}
              onChange={(e) => onFormDataChange(prev => ({
                ...prev,
                translations: {
                  ...prev.translations,
                  en: { ...prev.translations.en, content: e.target.value }
                }
              }))}
              className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
            />
            <div className="text-sm theme-text-muted">
              {formData.translations.en.content.length} characters
            </div>
          </div>
        )}
      </div>

      {/* Translation Excerpts */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <label className="block text-sm font-medium theme-text-secondary mb-4">
          Qisqacha Mazmun ({activeLanguageTab === 'uz' ? "O'zbek" : activeLanguageTab === 'ru' ? 'Русский' : 'English'})
        </label>
        
        {activeLanguageTab === 'uz' && (
          <textarea
            rows={3}
            placeholder="Maqolaning qisqacha mazmuni (avtomatik yaratiladi)"
            value={formData.excerpt}
            onChange={(e) => onInputChange('excerpt', e.target.value)}
            className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
          />
        )}

        {activeLanguageTab === 'ru' && (
          <textarea
            rows={3}
            placeholder="Краткое содержание статьи"
            value={formData.translations.ru.excerpt}
            onChange={(e) => onFormDataChange(prev => ({
              ...prev,
              translations: {
                ...prev.translations,
                ru: { ...prev.translations.ru, excerpt: e.target.value }
              }
            }))}
            className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
          />
        )}

        {activeLanguageTab === 'en' && (
          <textarea
            rows={3}
            placeholder="Article excerpt"
            value={formData.translations.en.excerpt}
            onChange={(e) => onFormDataChange(prev => ({
              ...prev,
              translations: {
                ...prev.translations,
                en: { ...prev.translations.en, excerpt: e.target.value }
              }
            }))}
            className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
          />
        )}
      </div>

      {/* SEO for each language */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">
          SEO Sozlamalari ({activeLanguageTab === 'uz' ? "O'zbek" : activeLanguageTab === 'ru' ? 'Русский' : 'English'})
        </h3>
        
        {activeLanguageTab === 'uz' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Meta Sarlavha
              </label>
              <input
                type="text"
                placeholder="Qidiruv tizimlari uchun sarlavha"
                value={formData.meta_title}
                onChange={(e) => onInputChange('meta_title', e.target.value)}
                className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
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
                onChange={(e) => onInputChange('meta_description', e.target.value)}
                className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
              />
              <div className="mt-1 text-xs theme-text-muted">
                {formData.meta_description.length}/160 belgi
              </div>
            </div>
          </div>
        )}

        {activeLanguageTab === 'ru' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Meta заголовок
              </label>
              <input
                type="text"
                placeholder="Заголовок для поисковых систем"
                value={formData.translations.ru.meta_title}
                onChange={(e) => onFormDataChange(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    ru: { ...prev.translations.ru, meta_title: e.target.value }
                  }
                }))}
                className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
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
                onChange={(e) => onFormDataChange(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    ru: { ...prev.translations.ru, meta_description: e.target.value }
                  }
                }))}
                className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
              />
              <div className="mt-1 text-xs theme-text-muted">
                {formData.translations.ru.meta_description.length}/160 символов
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                URL Slug
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="theme-text-muted text-sm whitespace-nowrap">revmohelp.uz/ru/posts/</span>
                <input
                  type="text"
                  value={formData.translations.ru.slug}
                  onChange={(e) => onFormDataChange(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      ru: { ...prev.translations.ru, slug: e.target.value }
                    }
                  }))}
                  className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text min-w-0"
                />
              </div>
            </div>
          </div>
        )}

        {activeLanguageTab === 'en' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Meta Title
              </label>
              <input
                type="text"
                placeholder="Title for search engines"
                value={formData.translations.en.meta_title}
                onChange={(e) => onFormDataChange(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, meta_title: e.target.value }
                  }
                }))}
                className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
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
                onChange={(e) => onFormDataChange(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, meta_description: e.target.value }
                  }
                }))}
                className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
              />
              <div className="mt-1 text-xs theme-text-muted">
                {formData.translations.en.meta_description.length}/160 characters
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                URL Slug
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="theme-text-muted text-sm whitespace-nowrap">revmohelp.uz/en/posts/</span>
                <input
                  type="text"
                  value={formData.translations.en.slug}
                  onChange={(e) => onFormDataChange(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      en: { ...prev.translations.en, slug: e.target.value }
                    }
                  }))}
                  className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text min-w-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Translation Progress */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">Tarjima Holati</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 theme-bg-secondary rounded-xl">
            <div className="text-2xl mb-2">🇺🇿</div>
            <div className="text-sm font-medium theme-text">O'zbek</div>
            <div className={`text-xs mt-1 ${formData.title && formData.content ? 'text-green-600' : 'theme-text-muted'}`}>
              {formData.title && formData.content ? 'Tayyor' : 'To\'ldirilmagan'}
            </div>
          </div>
          <div className="text-center p-4 theme-bg-secondary rounded-xl">
            <div className="text-2xl mb-2">🇷🇺</div>
            <div className="text-sm font-medium theme-text">Русский</div>
            <div className={`text-xs mt-1 ${formData.translations.ru.title && formData.translations.ru.content ? 'text-green-600' : 'theme-text-muted'}`}>
              {formData.translations.ru.title && formData.translations.ru.content ? 'Готово' : 'Не заполнено'}
            </div>
          </div>
          <div className="text-center p-4 theme-bg-secondary rounded-xl">
            <div className="text-2xl mb-2">🇺🇸</div>
            <div className="text-sm font-medium theme-text">English</div>
            <div className={`text-xs mt-1 ${formData.translations.en.title && formData.translations.en.content ? 'text-green-600' : 'theme-text-muted'}`}>
              {formData.translations.en.title && formData.translations.en.content ? 'Ready' : 'Not filled'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;