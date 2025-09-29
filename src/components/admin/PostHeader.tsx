import React from 'react';
import { Save, Eye, ArrowLeft } from 'lucide-react';

interface PostHeaderProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  canPreview: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  isEditing,
  isSubmitting,
  onBack,
  onPreview,
  onSaveDraft,
  onPublish,
  canPreview
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 theme-text-secondary hover:theme-text rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold theme-text">
            {isEditing ? 'Maqolani Tahrirlash' : 'Yangi Maqola Yaratish'}
          </h1>
          <p className="theme-text-secondary text-sm lg:text-base">
            {isEditing ? 'Mavjud maqolani tahrirlang' : 'Yangi tibbiy maqola yoki kontent qo\'shing'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        <button
          onClick={onPreview}
          disabled={!canPreview}
          className="flex items-center space-x-2 theme-border border theme-text-secondary px-3 lg:px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200 disabled:opacity-50 text-sm lg:text-base"
        >
          <Eye size={16} />
          <span className="hidden sm:inline">Ko'rish</span>
        </button>
        <button
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="flex items-center space-x-2 bg-gray-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 text-sm lg:text-base"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Qoralama</span>
        </button>
        <button
          onClick={onPublish}
          disabled={isSubmitting}
          className="flex items-center space-x-2 theme-accent-bg text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 text-sm lg:text-base"
        >
          <Save size={16} />
          <span>{isSubmitting ? 'Saqlanmoqda...' : 'Nashr etish'}</span>
        </button>
      </div>
    </div>
  );
};

export default PostHeader;