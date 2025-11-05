import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Reply, 
  User, 
  Calendar, 
  ThumbsUp,
  Flag,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getPostComments, createComment } from '../../lib/comments';
import type { Comment, CreateCommentData } from '../../lib/comments';

interface CommentsSectionProps {
  postId: string;
  postTitle: string;
  onCommentsChange?: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, postTitle, onCommentsChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [commentData, setCommentData] = useState({
    content: '',
    author_name: ''
  });

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      console.log('💬 Loading comments for post ID:', postId);
      const { data } = await getPostComments(postId);
      if (data) {
        console.log('✅ Comments loaded successfully:', data.length);
        setComments(data);
      } else {
        console.log('⚠️ No comments data returned');
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!commentData.content.trim()) {
      setMessage({ type: 'error', text: 'Kommentariya matni kiritilishi shart' });
      return false;
    }
    if (!user && !commentData.author_name.trim()) {
      setMessage({ type: 'error', text: 'Ismingizni kiriting' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const newCommentData: CreateCommentData = {
        post_id: postId,
        content: commentData.content.trim(),
        author_name: user ? undefined : commentData.author_name.trim(),
        parent_id: replyingTo || undefined
      };

      const { data, error } = await createComment(newCommentData);

      if (error) {
        setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Kommentariya muvaffaqiyatli qo\'shildi va ko\'rsatildi!' 
        });
        setCommentData({ content: '', author_name: '' });
        setShowCommentForm(false);
        setReplyingTo(null);
        
        // Reload comments immediately and force refresh
        console.log('🔄 Reloading comments after successful creation...');
        await loadComments();
        onCommentsChange?.(); // Notify parent component
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} daqiqa oldin`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} soat oldin`;
    } else {
      return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-12 mt-4' : ''} animate-fade-in`}>
      <div className="theme-bg-secondary rounded-xl p-4 hover:theme-shadow-md transition-all duration-200">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {comment.author?.avatar_url ? (
              <img
                src={comment.author.avatar_url}
                alt={comment.author.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center">
                <User size={16} className="theme-accent" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold theme-text text-sm">
                  {comment.author?.full_name || comment.author_name || 'Anonim'}
                </span>
                {comment.author?.role === 'doctor' && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-bold">
                    Dr
                  </span>
                )}
                {comment.author?.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full font-bold">
                    Admin
                  </span>
                )}
                {!comment.author && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                    Anonim
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs theme-text-muted">
                <Calendar size={12} />
                <span>{formatDate(comment.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          <p className="theme-text-secondary leading-relaxed">{comment.content}</p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              <ThumbsUp size={14} />
              <span className="text-xs">Foydali</span>
            </button>
            {!isReply && (
              <button 
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
              >
                <Reply size={14} />
                <span className="text-xs">Javob berish</span>
              </button>
            )}
            <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200">
              <Flag size={14} />
              <span className="text-xs">Shikoyat</span>
            </button>
          </div>
          
          {comment.user_id === user?.id && (
            <div className="flex items-center space-x-2">
              <button className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                <Edit size={14} />
              </button>
              <button className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-4 p-4 theme-bg-tertiary rounded-lg animate-slide-down">
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                {!user && (
                  <input
                    type="text"
                    name="author_name"
                    value={commentData.author_name}
                    onChange={handleInputChange}
                    placeholder="Ismingiz"
                    required
                    className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
                  />
                )}
                <textarea
                  name="content"
                  value={commentData.content}
                  onChange={handleInputChange}
                  placeholder="Javobingizni yozing..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none text-sm"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 text-sm"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? 'Yuborilmoqda...' : 'Javob berish'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setCommentData({ content: '', author_name: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold theme-text flex items-center space-x-2">
          <MessageSquare size={24} className="theme-accent" />
          <span>Kommentariyalar ({comments.length})</span>
        </h3>
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <MessageSquare size={16} />
          <span>Kommentariya yozish</span>
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
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

      {/* Comment Form */}
      {showCommentForm && (
        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6 mb-8 animate-slide-down">
          <h4 className="text-lg font-semibold theme-text mb-4">
            {user ? 'Kommentariya qoldiring' : 'Anonim kommentariya'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!user && (
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Ismingiz *
                </label>
                <input
                  type="text"
                  name="author_name"
                  value={commentData.author_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                  placeholder="Ismingizni kiriting"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Kommentariya *
              </label>
              <textarea
                name="content"
                value={commentData.content}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                placeholder="Fikringizni bildiring..."
              />
              <div className="text-xs theme-text-muted mt-1">
                {commentData.content.length}/500 belgi
              </div>
            </div>

            {!user && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                  <Clock size={16} />
                  <span className="text-sm font-medium">
                    Anonim kommentariyalar admin tasdiqlashidan so'ng ko'rsatiladi
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCommentForm(false);
                  setCommentData({ content: '', author_name: '' });
                  setMessage({ type: '', text: '' });
                }}
                className="theme-border border theme-text-secondary px-6 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Kommentariyalar yuklanmoqda...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare size={48} className="theme-text-muted mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-semibold theme-text-secondary mb-2">
            Hozircha kommentariyalar yo'q
          </h4>
          <p className="theme-text-muted mb-6">
            Birinchi bo'lib fikringizni bildiring!
          </p>
          <button
            onClick={() => setShowCommentForm(true)}
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <MessageSquare size={16} />
            <span>Birinchi kommentariya</span>
          </button>
        </div>
      )}

      {/* Moderation Notice */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
          <Shield size={16} />
          <span className="text-sm font-medium">
            Kommentariyalar darhol ko'rsatiladi. Nomaqbul kommentariyalar admin tomonidan keyinchalik o'chirilishi mumkin.
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;