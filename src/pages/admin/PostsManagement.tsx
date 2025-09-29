import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, CreditCard as Edit, Trash2, Eye, Calendar, User, Image, Video, FileText, Play, TrendingUp, Clock, Tag, Globe, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { Ban, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPosts, deletePost, updatePost } from '../../lib/posts';
import { getCategories } from '../../lib/categories';
import { getPostTypeIcon, getPostTypeLabel, getPostTypeColor } from '../../utils/postHelpers';
import type { Post } from '../../types';
import CategoriesManagement from '../../components/admin/CategoriesManagement';

const PostsManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedBlockStatus, setSelectedBlockStatus] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [blockLoading, setBlockLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsResult, categoriesResult] = await Promise.all([
        getPosts(),
        getCategories()
      ]);

      if (postsResult.data) {
        setPosts(postsResult.data);
        
        // Extract unique authors from posts
        const uniqueAuthors = postsResult.data
          .filter(post => post.author)
          .reduce((acc, post) => {
            if (post.author && !acc.find(a => a.id === post.author.id)) {
              acc.push(post.author);
            }
            return acc;
          }, [] as any[]);
        setAuthors(uniqueAuthors);
      }

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriesChange = () => {
    loadData(); // Reload data when categories change
  };

  const tabs = [
    { id: 'posts', label: 'Maqolalar', icon: FileText },
    { id: 'categories', label: 'Kategoriyalar', icon: Tag }
  ];

  const handleDelete = async (postId: string) => {
    if (!confirm('Bu maqolani o\'chirishni xohlaysizmi?')) return;

    setDeleteLoading(postId);
    try {
      const { error } = await deletePost(postId);
      if (error) {
        alert('Xatolik: ' + error.message);
      } else {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (error) {
      alert('Xatolik yuz berdi');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBlockToggle = async (postId: string, title: string, isCurrentlyBlocked: boolean) => {
    const action = isCurrentlyBlocked ? 'blokdan chiqarish' : 'bloklash';
    if (!confirm(`"${title}" maqolasini ${action}ni xohlaysizmi?`)) return;

    setBlockLoading(postId);
    setMessage({ type: '', text: '' });
    
    try {
      // Toggle published status to simulate block/unblock
      const { error } = await updatePost({
        id: postId,
        published: isCurrentlyBlocked // If currently blocked (unpublished), unblock by publishing
      });
      
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: `Maqola muvaffaqiyatli ${isCurrentlyBlocked ? 'blokdan chiqarildi va nashr etildi' : 'bloklandi'}!` 
        });
        await loadData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setBlockLoading(null);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category_id === selectedCategory;
    const matchesAuthor = selectedAuthor === 'all' || post.author_id === selectedAuthor;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'published' && post.published) ||
                         (selectedStatus === 'draft' && !post.published);
    const matchesBlockStatus = selectedBlockStatus === 'all' ||
                              (selectedBlockStatus === 'blocked' && !post.published) ||
                              (selectedBlockStatus === 'active' && post.published);
    return matchesSearch && matchesCategory && matchesAuthor && matchesStatus && matchesBlockStatus;
  });

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 xl:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold theme-text">Maqolalar Boshqaruvi</h1>
          <p className="theme-text-secondary text-sm lg:text-base">Maqolalarni yaratish va boshqarish</p>
        </div>
        
        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
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
        
        {activeTab === 'posts' && (
          <Link
            to="/admin/posts/create"
            className="flex items-center space-x-2 theme-accent-bg text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            <Plus size={18} />
            <span>Yangi Maqola</span>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 lg:px-6 py-3 font-semibold transition-colors duration-200 whitespace-nowrap border-b-2 text-sm ${
                  activeTab === tab.id
                    ? 'theme-accent border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'theme-text-secondary hover:theme-accent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'categories' && (
          <CategoriesManagement onCategoriesChange={handleCategoriesChange} />
        )}
        
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
                <div className="text-xl lg:text-2xl font-bold theme-text">{posts.length}</div>
                <div className="text-xs lg:text-sm theme-text-secondary">Jami maqolalar</div>
              </div>
              <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
                <div className="text-xl lg:text-2xl font-bold text-green-600">{posts.filter(p => p.published).length}</div>
                <div className="text-xs lg:text-sm theme-text-secondary">Nashr etilgan</div>
              </div>
              <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
                <div className="text-xl lg:text-2xl font-bold text-yellow-600">{posts.filter(p => !p.published).length}</div>
                <div className="text-xs lg:text-sm theme-text-secondary">Qoralama</div>
              </div>
              <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
                <div className="text-xl lg:text-2xl font-bold text-blue-600">{posts.reduce((sum, p) => sum + (p.views_count || 0), 0).toLocaleString()}</div>
                <div className="text-xs lg:text-sm theme-text-secondary">Jami ko'rishlar</div>
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
                      placeholder="Maqolalarni qidiring..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 lg:py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="lg:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
                  >
                    <option value="all">Barcha kategoriyalar</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author Filter */}
                <div className="lg:w-56">
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
                  >
                    <option value="all">Barcha mualliflar</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.full_name} ({author.role === 'doctor' ? 'Shifokor' : 'Admin'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="lg:w-48">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
                  >
                    <option value="all">Barcha holatlar</option>
                    <option value="published">Nashr etilgan</option>
                    <option value="draft">Qoralama</option>
                  </select>
                </div>

                {/* Block Status Filter */}
                <div className="lg:w-48">
                  <select
                    value={selectedBlockStatus}
                    onChange={(e) => setSelectedBlockStatus(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text text-sm"
                  >
                    <option value="all">Barcha maqolalar</option>
                    <option value="active">Faol maqolalar</option>
                    <option value="blocked">Bloklangan maqolalar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {filteredPosts.map((post) => {
                const PostTypeIcon = getPostTypeIcon(post);
                const isBlocked = !post.published; // Unpublished posts are considered "blocked"
                return (
                  <div
                    key={post.id}
                    className={`theme-bg rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-2 group ${
                      isBlocked ? 'opacity-75 border-red-300 dark:border-red-600' : ''
                    }`}
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
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://img.youtube.com/vi/${post.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
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
                      
                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {post.category && (
                          <span
                            className="px-3 py-1 text-xs font-semibold text-white rounded-full shadow-lg backdrop-blur-sm"
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
                            isBlocked
                              ? 'bg-red-500 text-white'
                              : post.published
                              ? 'bg-green-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {isBlocked ? 'Bloklangan' : 'Faol'}
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-4 lg:p-5">
                      <h3 className="text-lg font-bold theme-text mb-3 line-clamp-2 group-hover:theme-accent transition-colors duration-300">
                        {post.title}
                      </h3>
                      
                      <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Post Meta */}
                      <div className="flex items-center justify-between text-xs theme-text-muted mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User size={12} />
                            <span className="truncate max-w-28 font-medium">
                              {post.author?.full_name}
                              {post.author?.role === 'doctor' && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded font-bold">
                                  Dr
                                </span>
                              )}
                              {post.author?.role === 'admin' && (
                                <span className="ml-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded font-bold">
                                  Admin
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye size={12} />
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

                      {/* SEO Info */}
                      <div className="flex items-center justify-between text-xs theme-text-muted mb-4 p-3 theme-bg-secondary rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Globe size={10} />
                            <span>SEO: {post.meta_title ? '✅' : '❌'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag size={10} />
                            <span className="truncate max-w-24">/{post.slug}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={10} />
                          <span>{Math.ceil(post.content.length / 1000)} min</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t theme-border">
                        <div className="flex space-x-1">
                          {/* Block/Unblock Button */}
                          <button
                            onClick={() => handleBlockToggle(post.id, post.title, isBlocked)}
                            disabled={blockLoading === post.id}
                            className={`flex items-center space-x-1 p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                              isBlocked
                                ? 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                            } disabled:opacity-50 disabled:transform-none`}
                            title={isBlocked ? 'Blokdan chiqarish va nashr etish' : 'Bloklash (nashrdan olib tashlash)'}
                          >
                            {blockLoading === post.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : (
                              <>
                                {isBlocked ? <Unlock size={14} /> : <Ban size={14} />}
                                <span className="text-xs font-medium hidden lg:inline">
                                  {isBlocked ? 'Faollashtirish' : 'Bloklash'}
                                </span>
                              </>
                            )}
                          </button>
                          <Link
                            to={`/admin/posts/edit/${post.id}`}
                            className="flex items-center space-x-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 transform hover:scale-105"
                            title="Tahrirlash"
                          >
                            <Edit size={14} />
                            <span className="text-xs font-medium hidden lg:inline">Tahrirlash</span>
                          </Link>
                          <Link
                            to={`/posts/${post.slug}`}
                            target="_blank"
                            className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 transform hover:scale-105"
                            title="Ko'rish"
                          >
                            <Eye size={14} />
                            <span className="text-xs font-medium hidden lg:inline">Ko'rish</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={deleteLoading === post.id}
                            className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                            title="O'chirish"
                          >
                            {deleteLoading === post.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                <span className="text-xs font-medium hidden lg:inline">O'chirish</span>
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

            {/* No Results */}
            {filteredPosts.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="theme-text-muted mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold theme-text-secondary mb-2">
                  Maqola topilmadi
                </h3>
                <p className="theme-text-muted mb-6">
                  Qidiruv so'zini o'zgartiring yoki yangi maqola yarating
                </p>
                <Link
                  to="/admin/posts/create"
                  className="inline-flex items-center space-x-2 theme-accent-bg text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                >
                  <Plus size={18} />
                  <span>Birinchi maqolani yaratish</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsManagement;