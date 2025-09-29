import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Calendar, User, Eye, Play, ArrowRight, FileText, Clock, MessageSquare, ThumbsUp } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { getPosts, searchPosts } from '../lib/posts';
import { getCategories } from '../lib/categories';
import { getPostComments } from '../lib/comments';
import type { Post } from '../types';

const Posts: React.FC = () => {
  const { t, i18n } = useTranslation();

  const postTypeLabel = (post: Post) => {
    if (post.youtube_url) return i18n.language === 'ru' ? 'Видео' : i18n.language === 'en' ? 'Video' : 'Video';
    if (post.featured_image_url) return i18n.language === 'ru' ? 'Изображение' : i18n.language === 'en' ? 'Image' : 'Rasm';
    return i18n.language === 'ru' ? 'Текст' : i18n.language === 'en' ? 'Text' : 'Matn';
  };
  const fallbackTextLabel = i18n.language === 'ru' ? 'Текстовая статья' : i18n.language === 'en' ? 'Text Article' : 'Matn Maqolasi';
  const minutesLabel = i18n.language === 'ru' ? 'мин' : i18n.language === 'en' ? 'min' : 'daqiqа';
  const readMoreLabel = i18n.language === 'ru' ? 'Читать подробнее' : i18n.language === 'en' ? 'Read more' : "Batafsil o'qish";
  const commentsLabel = (n: number) => i18n.language === 'ru' ? `${n} комментариев` : i18n.language === 'en' ? `${n} comments` : `${n} sharh`;
  const likesLabel = (n: number) => i18n.language === 'ru' ? `${n} нравится` : i18n.language === 'en' ? `${n} likes` : `${n} yoqdi`;
  const readLabel = i18n.language === 'ru' ? 'Читать' : i18n.language === 'en' ? 'Read' : "O'qish";
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [postComments, setPostComments] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Reload data every time language changes to fetch proper translations
    setDataLoaded(false);
    setCommentsLoaded(false);
    setPostComments({});
    loadData();
  }, [i18n.language]);

  useEffect(() => {
    if (posts.length > 0 && !commentsLoaded) {
      loadCommentsCount();
    }
  }, [posts, commentsLoaded]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📝 Loading posts and categories for language:', i18n.language);
      
      // Check cache first
      const cacheKey = `posts_page_${i18n.language}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      // Use cache if less than 3 minutes old
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < 3 * 60 * 1000) {
          const parsed = JSON.parse(cachedData);
          setPosts(parsed.posts);
          setCategories(parsed.categories);
          setDataLoaded(true);
          setLoading(false);
          console.log('📦 Using cached posts page data');
          return;
        }
      }
      
      const [postsResult, categoriesResult] = await Promise.all([
        getPosts(i18n.language, { published: true, allowMock: false }),
        getCategories()
      ]);

      if (postsResult.data) {
        setPosts(postsResult.data);
        console.log('✅ Posts loaded:', postsResult.data.length);
      }

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
        console.log('✅ Categories loaded:', categoriesResult.data.length);
      }
      
      // Cache the results
      const cacheData = {
        posts: postsResult.data || [],
        categories: categoriesResult.data || []
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentsCount = async () => {
    try {
      const commentsCount: Record<string, number> = {};
      
      // Load comments count for each post
      await Promise.all(
        posts.map(async (post) => {
          try {
            const result = await getPostComments(post.id);
            commentsCount[post.id] = result.data?.length || 0;
          } catch (error) {
            console.error(`Error loading comments for post ${post.id}:`, error);
            commentsCount[post.id] = 0;
          }
        })
      );
      
      setPostComments(commentsCount);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error loading comments count:', error);
    }
  };

  // Mock categories
  const getMockCategories = () => [
    { id: '1', name: 'Artrit', slug: 'artrit', color: '#3B82F6', created_at: '2024-01-01' },
    { id: '2', name: 'Artroz', slug: 'artroz', color: '#10B981', created_at: '2024-01-01' },
    { id: '3', name: 'Jismoniy tarbiya', slug: 'jismoniy-tarbiya', color: '#F59E0B', created_at: '2024-01-01' },
    { id: '4', name: 'Dorilar', slug: 'dorilar', color: '#EC4899', created_at: '2024-01-01' }
  ];

  // Mock posts
  const getMockPosts = () => [
    {
      id: '1',
      title: 'Revmatoid artrit: belgilar va davolash usullari',
      excerpt: 'Revmatoid artrit haqida bilishingiz kerak bo\'lgan barcha ma\'lumotlar: belgilar, diagnostika va zamonaviy davolash usullari.',
      slug: 'revmatoid-artrit-belgilar-davolash',
      featured_image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800',
      author_id: '1',
      author: {
        id: '1',
        email: 'doctor@example.com',
        full_name: 'Dr. Aziza Karimova',
        role: 'doctor' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      category_id: '1',
      category: {
        id: '1',
        name: 'Artrit',
        slug: 'artrit',
        color: '#3B82F6',
        created_at: '2024-01-01'
      },
      tags: ['artrit', 'revmatik kasallik', 'davolash'],
      published: true,
      published_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      views_count: 1250,
      content: 'Revmatoid artrit - bu autoimmun kasallik...',
      meta_title: 'Revmatoid artrit belgilari va davolash usullari',
      meta_description: 'Revmatoid artrit haqida to\'liq ma\'lumot'
    },
    {
      id: '2',
      title: 'Osteoartroz: erta belgilarni qanday aniqlash mumkin',
      excerpt: 'Osteoartroz kasalligining erta belgilari va oldini olish choralari haqida batafsil ma\'lumot.',
      slug: 'osteoartroz-erta-belgilar',
      featured_image_url: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      author_id: '2',
      author: {
        id: '2',
        email: 'doctor2@example.com',
        full_name: 'Dr. Bobur Toshmatov',
        role: 'doctor' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      category_id: '2',
      category: {
        id: '2',
        name: 'Artroz',
        slug: 'artroz',
        color: '#10B981',
        created_at: '2024-01-01'
      },
      tags: ['artroz', 'belgilar', 'profilaktika'],
      published: true,
      published_at: '2024-01-12T14:30:00Z',
      created_at: '2024-01-12T14:30:00Z',
      updated_at: '2024-01-12T14:30:00Z',
      views_count: 890,
      content: 'Osteoartroz - bu qo\'shma kasalligi...',
      meta_title: 'Osteoartroz erta belgilari',
      meta_description: 'Osteoartroz belgilarini erta aniqlash'
    },
    {
      id: '3',
      title: 'Qo\'shma og\'riqlarini kamaytirish uchun mashqlar',
      excerpt: 'Revmatik kasalliklardan aziyat chekayotgan bemorlar uchun maxsus jismoniy mashqlar kompleksi.',
      slug: 'qoshma-ogriqlarini-kamaytirish-mashqlar',
      featured_image_url: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=800',
      author_id: '3',
      author: {
        id: '3',
        email: 'doctor3@example.com',
        full_name: 'Dr. Nilufar Abdullayeva',
        role: 'doctor' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      category_id: '3',
      category: {
        id: '3',
        name: 'Jismoniy tarbiya',
        slug: 'jismoniy-tarbiya',
        color: '#F59E0B',
        created_at: '2024-01-01'
      },
      tags: ['mashqlar', 'og\'riq', 'reabilitatsiya'],
      published: true,
      published_at: '2024-01-10T09:15:00Z',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-10T09:15:00Z',
      views_count: 2100,
      content: 'Qo\'shma og\'riqlari uchun mashqlar...',
      meta_title: 'Qo\'shma og\'riqlari uchun mashqlar',
      meta_description: 'Og\'riqni kamaytirish uchun mashqlar'
    }
  ];

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Maqolalar"
        description="Revmatik kasalliklar bo'yicha eng so'nggi maqolalar, maslahatlar va tibbiy ma'lumotlar. Professional shifokorlar tomonidan yozilgan."
        keywords="tibbiy maqolalar, revmatik kasalliklar, artrit, artroz, shifokor maslahatlari"
        url="https://revmohelp.uz/posts"
      />

      <div className="min-h-screen theme-bg pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold theme-text mb-4">
              {t('posts')}
            </h1>
            <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
              {t('postsSubtitle')}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white dark:bg-[#3E433B] rounded-2xl theme-shadow-lg ring-1 ring-[#CAD8D6] p-6 mb-8 animate-slide-up" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                  <input style={{ backgroundColor: '#ffffff' }}
                    type="text"
                   placeholder={t('searchPosts')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 ring-1 ring-[#CAD8D6] border-transparent rounded-lg focus:ring-2 focus:ring-[#90978C] focus:border-[#90978C] transition-colors duration-200 bg-white dark:bg-[#3E433B] theme-text"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                  <select style={{ backgroundColor: '#ffffff' }}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 ring-1 ring-[#CAD8D6] border-transparent rounded-lg focus:ring-2 focus:ring-[#90978C] focus:border-[#90978C] transition-colors duration-200 appearance-none bg-white dark:bg-[#3E433B] theme-text"
                  >
                   <option value="all">{t('allCategories')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="theme-text-secondary">
             <span className="font-semibold theme-text">{filteredPosts.length}</span> {t('postsFound')}
            </p>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 items-stretch">
            {filteredPosts.map((post, index) => (
              <Link
                to={`/posts/${post.slug}`}
                key={post.id}
                className="group block h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <article className="bg-white dark:bg-[#3E433B] rounded-3xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-500 hover:-translate-y-2 ring-1 ring-[#CAD8D6] hover:ring-[#94ABA3] border-0 overflow-hidden animate-fade-in group-hover:scale-[1.02] h-full flex flex-col" style={{ backgroundColor: '#ffffff' }}>
                  {/* Post Media */}
                  <div className="relative overflow-hidden aspect-[16/9]">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : post.youtube_url ? (
                      <div className="relative w-full h-full">
                        <img
                          src={`https://img.youtube.com/vi/${post.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://img.youtube.com/vi/${post.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-300">
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl animate-pulse group-hover:scale-110 transition-transform duration-300">
                            <Play size={28} className="text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#CAD8D6] to-[#B8C9C5] dark:from-[#4D544A] dark:to-[#3E433B] flex items-center justify-center group-hover:from-[#B8C9C5] group-hover:to-[#A6BAB4] dark:group-hover:from-[#5C6359] dark:group-hover:to-[#4D544A] transition-all duration-500">
                        <div className="text-center">
                          <FileText size={56} className="theme-text-muted mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 opacity-60" />
                          <p className="theme-text-muted text-lg font-medium">{fallbackTextLabel}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category Badge */}
                    {post.category && (
                      <div className="absolute top-4 left-4">
                        <span
                          className="px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg backdrop-blur-sm"
                          style={{ backgroundColor: post.category.color }}
                        >
                          {post.category.name}
                        </span>
                      </div>
                    )}

                    {/* Post Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                        post.youtube_url ? 'bg-red-500 text-white' :
                        post.featured_image_url ? 'bg-green-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {postTypeLabel(post)}
                      </span>
                    </div>

                    {/* Reading Time Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <Clock size={12} className="text-gray-600" />
                        <span className="text-xs font-medium text-gray-900">
                          {Math.ceil(post.content.length / 1000)} {minutesLabel}
                        </span>
                      </div>
                    </div>

                    {/* Views Badge */}
                    <div className="absolute bottom-4 right-4">
                      <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <Eye size={12} className="text-gray-600" />
                        <span className="text-xs font-bold text-gray-900">
                          {(post.views_count || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Hover Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-gray-900 font-semibold flex items-center space-x-2">
                          <ArrowRight size={16} />
                          <span>{readMoreLabel}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6 space-y-4 flex flex-col flex-1">
                    {/* Author Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center">
                        <User size={16} className="theme-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold theme-text text-sm">{post.author?.full_name}</span>
                          {post.author?.role === 'doctor' && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-bold">
                              Dr
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs theme-text-muted">
                          <Calendar size={10} />
                          <span>{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold theme-text mb-3 line-clamp-2 group-hover:theme-accent transition-colors duration-300 leading-tight">
                      {post.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="theme-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[#CAD8D6] text-[#3E433B] dark:bg-[#5C6359] dark:text-white text-xs rounded-full font-medium border-0 hover:opacity-90 transition-colors duration-200"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-3 py-1 bg-[#CAD8D6] text-[#3E433B] dark:bg-[#5C6359] dark:text-white text-xs rounded-full font-medium border-0">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Post Stats */}
                    <div className="flex items-center justify-between pt-4 border-t theme-border mt-auto">
                      <div className="flex items-center space-x-4 text-sm theme-text-muted">
                        <div className="flex items-center space-x-1">
                          <Eye size={14} />
                          <span className="font-medium">{(post.views_count || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare size={14} />
                          <span className="font-medium">{commentsLabel(Math.floor(Math.random() * 20))}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp size={14} />
                          <span className="font-medium">{likesLabel(Math.floor(Math.random() * 50))}</span>
                        </div>
                      </div>
                      
                      {/* Read More Indicator */}
                      <div className="flex items-center space-x-1 theme-accent font-medium transition-colors duration-200">
                        <span className="text-sm">{readLabel}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="theme-text-muted mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold theme-text-secondary mb-2">
                Maqola topilmadi
              </h3>
              <p className="theme-text-muted">
                Qidiruv so'zini o'zgartiring yoki filtrlarni qayta sozlang
              </p>
            </div>
          )}

          {/* Load More */}
          {filteredPosts.length > 0 && (
            <div className="text-center">
              <button className="theme-accent-bg text-white px-8 py-4 rounded-xl font-semibold hover:opacity-95 transition-colors duration-200 transform hover:scale-105 shadow-lg">
                Ko'proq maqolalarni ko'rish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;
