import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowRight, Play, FileText, Clock, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPostComments } from '../../lib/comments';
import { getPostTypeIcon, getPostTypeLabel, getPostTypeColor } from '../../utils/postHelpers';
import type { Post } from '../../types';

interface LatestPostsProps {
  posts?: Post[];
}

const LatestPosts: React.FC<LatestPostsProps> = ({ posts = [] }) => {
  const { t, i18n } = useTranslation();
  const [postComments, setPostComments] = useState<Record<string, number>>({});
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  useEffect(() => {
    if (posts.length > 0 && !commentsLoaded) {
      loadCommentsCount();
    }
  }, [posts]);

  const loadCommentsCount = async () => {
    try {
      // Check cache first
      const cacheKey = `post_comments_count_${posts.map(p => p.id).join(',')}`;
      const cachedComments = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

      // Use cache if less than 2 minutes old
      if (cachedComments && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < 2 * 60 * 1000) {
          setPostComments(JSON.parse(cachedComments));
          setCommentsLoaded(true);
          console.log('📦 Using cached post comments count');
          return;
        }
      }

      const commentsPromises = posts.map(async (post) => {
        const { data: comments } = await getPostComments(post.id);
        return { postId: post.id, count: comments?.length || 0 };
      });

      const commentsResults = await Promise.all(commentsPromises);
      const commentsMap = commentsResults.reduce((acc, { postId, count }) => {
        acc[postId] = count;
        return acc;
      }, {} as Record<string, number>);

      setPostComments(commentsMap);

      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify(commentsMap));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

      setCommentsLoaded(true);
    } catch (error) {
      console.error('Error loading comments count:', error);
    }
  };

  
  // Mock data for demonstration
  const mockPosts: Post[] = [];

  const displayPosts = posts.length > 0 ? posts : mockPosts;

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
    const locale = localeMap[i18n.language] || 'uz-UZ';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-20 theme-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold theme-text mb-4">
            {t('latestPosts')}
          </h2>
          <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
            Revmatik kasalliklar bo'yicha eng so'nggi maqolalar va maslahatlar
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayPosts.slice(0, 3).map((post, index) => (
            <Link
              to={`/posts/${post.slug}`}
              key={post.id}
              className="group block"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <article className="bg-white rounded-3xl theme-shadow-lg theme-border border overflow-hidden animate-fade-in group-hover:scale-[1.02] h-full flex flex-col hover:theme-shadow-lg transition-all duration-500 hover:-translate-y-2 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
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
                          target.src = `https://img.youtube.com/vi/${post.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full theme-bg-secondary dark:from-blue-900/20 dark:to-teal-900/20 flex items-center justify-center group-hover:from-blue-100 group-hover:to-teal-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-teal-900/30 transition-all duration-500">
                      <div className="text-center">
                        <FileText size={56} className="theme-text-muted mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 opacity-60" />
                        <p className="theme-text-muted text-lg font-medium">Matn Maqolasi</p>
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
                      {post.youtube_url ? 'Video' : post.featured_image_url ? 'Rasm' : 'Matn'}
                    </span>
                  </div>

                  {/* Reading Time Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center space-x-1 theme-bg-secondary/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                      <Clock size={12} className="text-gray-600" />
                      <span className="text-xs font-medium theme-text">
                        {Math.ceil(post.content.length / 1000)} daqiqa
                      </span>
                    </div>
                  </div>

                  {/* Views Badge */}
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center space-x-1 theme-bg-secondary/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                      <Eye size={12} className="text-gray-600" />
                      <span className="text-xs font-bold theme-text">
                        {(post.views_count || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="theme-bg-secondary/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="theme-text font-semibold flex items-center space-x-2">
                        <ArrowRight size={16} />
                        <span>Batafsil o'qish</span>
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
                        <span className="font-medium">{Math.floor(Math.random() * 20)} sharh</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp size={14} />
                        <span className="font-medium">{Math.floor(Math.random() * 50)} yoqdi</span>
                      </div>
                    </div>


                    {/* Read More Indicator */}
                    <div className="flex items-center space-x-1 theme-accent group-hover:theme-accent-secondary font-medium transition-colors duration-200">
                      <span className="text-sm">O'qish</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/posts"
            className="inline-flex items-center space-x-2 bg-[#62B6CB] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#5FA8D3] transition-colors duration-300 transform hover:scale-105"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestPosts;
