import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { getCategories } from '../../lib/categories';
import type { PostFormData } from '../../pages/admin/CreatePost';

interface PostSidebarProps {
  formData: PostFormData;
  categories: any[];
  onInputChange: (field: string, value: any) => void;
  onFormDataChange: (updater: (prev: PostFormData) => PostFormData) => void;
}

const PostSidebar: React.FC<PostSidebarProps> = ({
  formData,
  categories,
  onInputChange,
  onFormDataChange
}) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      onInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Publish Settings */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">Nashr Sozlamalari</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => onInputChange('published', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium theme-text-secondary">
              Darhol nashr etish
            </span>
          </label>
        </div>
      </div>

      {/* Category */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <label className="block text-sm font-medium theme-text-secondary mb-3">
          Kategoriya
        </label>
        <select
          value={formData.category_id}
          onChange={(e) => onInputChange('category_id', e.target.value)}
          className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
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
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
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
            className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text min-w-0"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 theme-accent-bg text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex-shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full animate-fade-in"
            >
              <span className="truncate max-w-20">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="theme-accent hover:text-blue-800 dark:hover:text-blue-200 flex-shrink-0"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Quick Translation Helper */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border p-4 lg:p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">Tarjima Yordamchisi</h3>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              // Auto-fill Russian translation with basic translation
              if (formData.title && !formData.translations.ru.title) {
                onFormDataChange(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    ru: {
                      ...prev.translations.ru,
                      title: `[RU] ${formData.title}`,
                      content: `[Русский перевод]\n\n${formData.content}`,
                      excerpt: `[RU] ${formData.excerpt}`,
                      slug: formData.slug + '-ru'
                    }
                  }
                }));
              }
            }}
            className="w-full text-left p-3 theme-bg-tertiary rounded-lg hover:theme-bg-quaternary transition-colors duration-200 text-sm"
          >
            🇷🇺 Rus tiliga shablon yaratish
          </button>
          <button
            type="button"
            onClick={() => {
              // Auto-fill English translation with basic translation
              if (formData.title && !formData.translations.en.title) {
                onFormDataChange(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: {
                      ...prev.translations.en,
                      title: `[EN] ${formData.title}`,
                      content: `[English translation]\n\n${formData.content}`,
                      excerpt: `[EN] ${formData.excerpt}`,
                      slug: formData.slug + '-en'
                    }
                  }
                }));
              }
            }}
            className="w-full text-left p-3 theme-bg-tertiary rounded-lg hover:theme-bg-quaternary transition-colors duration-200 text-sm"
          >
            🇺🇸 Ingliz tiliga shablon yaratish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSidebar;