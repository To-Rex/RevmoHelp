import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, CreditCard as Edit, Trash2, Eye, Calendar, User, FileText, Image as ImageIcon, Video, Play, TrendingUp, Clock, Tag, Globe, ArrowLeft, Search, Filter, CheckCircle, AlertCircle, Ban, Unlock } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { getPosts, deletePost } from '../lib/posts';
import { getPostTypeIcon, getPostTypeLabel, getPostTypeColor } from '../utils/postHelpers';
import type { Post } from '../types';

const DoctorPosts: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await getPosts('uz', { author_id: user.id });
      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setMessage({ type: 'error', text: 'Maqolalarni yuklashda xatolik' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`"${title}" maqolasini o'chirishni xohlaysizmi?`)) return;

    setDeleteLoading(postId);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await deletePost(postId);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Maqola muvaffaqiyatli o\'chirildi!' });
        await loadPosts();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'published' && post.published) ||
                         (selectedStatus === 'draft' && !post.published);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">Kirish Talab Etiladi</h1>
          <p className="theme-text-secondary mb-6">Maqolalar sahifasiga kirish uchun tizimga kirishingiz kerak.</p>
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
          <p className="theme-text-muted">Maqolalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <SEOHead
        title="Mening Maqolalarim"
        description="Shifokor maqolalarini boshqarish paneli"
        keywords="shifokor maqolalar, tibbiy yozuvlar, maqola boshqaruvi"
        url="https://revmohelp.uz/doctor/posts"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/doctor-dashboard"
              className="p-2 theme-text-secondary hover:theme-text rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold theme-text">Mening Maqolalarim</h1>
              <p className="theme-text-secondary">Tibbiy maqolalarni yaratish va boshqarish</p>
            </div>
          </div>
          <Link
            to="/doctor/posts/create"
            className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Yangi Maqola</span>
          </Link>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="theme-bg rounded-xl theme-shadow theme-border border p-6 text-center">
            <div className="text-2xl font-bold theme-text mb-2">{posts.length}</div>
            <div className="text-sm theme-text-secondary">Jami maqolalar</div>
          </div>
          <div className="theme-bg rounded-xl theme-shadow theme-border border p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{posts.filter(p => p.published).length}</div>
            <div className="text-sm theme-text-secondary">Nashr etilgan</div>
          </div>
          <div className="theme-bg rounded-xl theme-shadow theme-border border p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{posts.filter(p => !p.published).length}</div>
            <div className="text-sm theme-text-secondary">Qoralama</div>
          </div>
          <div className="theme-bg rounded-xl theme-shadow theme-border border p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{posts.reduce((sum, p) => sum + (p.views_count || 0), 0).toLocaleString()}</div>
            <div className="text-sm theme-text-secondary">Jami ko'rishlar</div>
          </div>
        </div>

        {/* Filters */}
        <div className="theme-bg rounded-xl theme-shadow theme-border border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Maqolalarni qidiring..."
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
                <option value="all">Barcha holatlar</option>
                <option value="published">Nashr etilgan</option>
                <option value="draft">Qoralama</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const PostTypeIcon = getPostTypeIcon(post);
            return (
              <div
                key={post.id}
                className="theme-bg rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                {/* Post Media */}
                <div className="relative h-48 overflow-hidden">
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : post.youtube_url ? (
                    <div className="relative w-full h-full">
                      <img
                        src={`https://img.youtube.com/vi/${post.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://img.youtube.com/vi/${post.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
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
                        <PostTypeIcon size={48} className="theme-text-muted mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                        <p className="theme-text-muted text-sm font-medium">Matn Maqolasi</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {post.category && (
                      <span
                        className="px-3 py-1 text-xs font-semibold text-white rounded-full shadow-lg"
                        style={{ backgroundColor: post.category.color }}
                      >
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${getPostTypeColor(post)}`}>
                      {getPostTypeLabel(post)}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
                        post.published
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {post.published ? 'Nashr etilgan' : 'Qoralama'}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold theme-text mb-3 line-clamp-2 group-hover:theme-accent transition-colors duration-300">
                    {post.title}
                  </h3>
                  
                  <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Post Meta */}
                  <div className="flex items-center justify-between text-sm theme-text-muted mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye size={14} />
                      <span className="theme-accent font-medium">{(post.views_count || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t theme-border">
                    <div className="flex space-x-2">
                      <Link
                        to={`/doctor/posts/edit/${post.id}`}
                        className="flex items-center space-x-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 transform hover:scale-105"
                        title="Tahrirlash"
                      >
                        <Edit size={16} />
                        <span className="text-xs font-medium hidden sm:inline">Tahrirlash</span>
                      </Link>
                      <Link
                        to={`/posts/${post.slug}`}
                        target="_blank"
                        className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 transform hover:scale-105"
                        title="Ko'rish"
                      >
                        <Eye size={16} />
                        <span className="text-xs font-medium hidden sm:inline">Ko'rish</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deleteLoading === post.id}
                        className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                        title="O'chirish"
                      >
                        {deleteLoading === post.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            <span className="text-xs font-medium hidden sm:inline">O'chirish</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="flex items-center space-x-2 text-xs theme-text-muted">
                      <div className="flex items-center space-x-1">
                        <TrendingUp size={10} />
                        <span>{post.tags.length} teg</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText size={10} />
                        <span>{post.content.length > 1000 ? '1K+' : post.content.length} belgi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Posts */}
        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="theme-text-muted mb-4">
              <FileText size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold theme-text-secondary mb-2">
              {searchTerm || selectedStatus !== 'all' ? 'Maqola topilmadi' : 'Hozircha maqolalar yo\'q'}
            </h3>
            <p className="theme-text-muted mb-6">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Qidiruv so\'zini o\'zgartiring yoki filtrlarni qayta sozlang'
                : 'Birinchi tibbiy maqolangizni yozing'
              }
            </p>
            <Link
              to="/doctor/posts/create"
              className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={20} />
              <span>Yangi Maqola Yozish</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPosts;