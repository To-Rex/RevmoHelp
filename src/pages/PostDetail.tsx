import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Share2, 
  Heart,
  Tag,
  Clock,
  BookOpen,
  ThumbsUp,
  MessageSquare,
  Play,
  FileText,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { getPostBySlug, getPosts } from '../lib/posts';
import { getPostComments } from '../lib/comments';
import { getPostTypeIcon, getPostTypeLabel, getPostTypeColor } from '../utils/postHelpers';
import CommentsSection from '../components/common/CommentsSection';
import type { Post } from '../types';
import type { Comment } from '../lib/comments';

const PostDetail: React.FC = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      setDataLoaded(false);
      loadPost();
    }
  }, [slug, i18n.language]);

  useEffect(() => {
    if (post) {
      loadRelatedPosts();
      loadComments();
    }
  }, [post, i18n.language]);

  const loadPost = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      // Check cache first
      const cacheKey = `post_detail_${slug}_${i18n.language}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      // Use cache if less than 5 minutes old
      if (cachedData && cacheTimestamp && !dataLoaded) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < 5 * 60 * 1000) {
          const parsed = JSON.parse(cachedData);
          setPost(parsed);
          setDataLoaded(true);
          setLoading(false);
          console.log('📦 Using cached post detail data');
          return;
        }
      }
      
      const { data, error } = await getPostBySlug(slug, i18n.language);
      
      if (error) {
        setError('Maqola topilmadi');
      } else if (data) {
        setPost(data);
        
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        
        setDataLoaded(true);
      }
    } catch (error) {
      setError('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!post) return;
    
    setCommentsLoading(true);
    try {
      console.log('💬 Loading comments for post:', post.title);
      const { data } = await getPostComments(post.id);
      if (data) {
        setComments(data);
        console.log('✅ Comments loaded:', data.length);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadRelatedPosts = async () => {
    if (!post) return;
    
    setRelatedLoading(true);
    try {
      console.log('🔍 Loading related posts for:', post.title);
      
      // Get posts from same category or with similar tags
      const { data: categoryPosts } = await getPosts(i18n.language, { 
        published: true, 
        category_id: post.category_id,
        limit: 10
      });
      
      let related: Post[] = [];
      
      if (categoryPosts && categoryPosts.length > 0) {
        // Filter out current post and get posts from same category
        related = categoryPosts.filter(p => p.id !== post.id);
        console.log('✅ Found posts from same category:', related.length);
      }
      
      // If we don't have enough related posts, get posts with similar tags
      if (related.length < 3 && post.tags.length > 0) {
        const { data: tagPosts } = await getPosts(i18n.language, { 
          published: true,
          limit: 20
        });
        
        if (tagPosts) {
          const tagRelated = tagPosts.filter(p => {
            if (p.id === post.id) return false;
            if (related.find(r => r.id === p.id)) return false;
            
            // Check if post has any common tags
            const commonTags = p.tags.filter(tag => post.tags.includes(tag));
            return commonTags.length > 0;
          });
          
          related = [...related, ...tagRelated];
          console.log('✅ Added posts with similar tags:', tagRelated.length);
        }
      }
      
      // If still not enough, get latest posts from same author
      if (related.length < 3 && post.author_id) {
        const { data: authorPosts } = await getPosts(i18n.language, { 
          published: true,
          author_id: post.author_id,
          limit: 10
        });
        
        if (authorPosts) {
          const authorRelated = authorPosts.filter(p => {
            if (p.id === post.id) return false;
            if (related.find(r => r.id === p.id)) return false;
            return true;
          });
          
          related = [...related, ...authorRelated];
          console.log('✅ Added posts from same author:', authorRelated.length);
        }
      }
      
      // If still not enough, get latest published posts
      if (related.length < 3) {
        const { data: latestPosts } = await getPosts(i18n.language, { 
          published: true,
          limit: 10
        });
        
        if (latestPosts) {
          const latestRelated = latestPosts.filter(p => {
            if (p.id === post.id) return false;
            if (related.find(r => r.id === p.id)) return false;
            return true;
          });
          
          related = [...related, ...latestRelated];
          console.log('✅ Added latest posts:', latestRelated.length);
        }
      }
      
      // Limit to 6 posts and sort by relevance
      const finalRelated = related.slice(0, 6);
      setRelatedPosts(finalRelated);
      console.log('✅ Final related posts:', finalRelated.length);
    } catch (error) {
      console.error('Error loading related posts:', error);
      setRelatedPosts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPostTypeIcon = (post: Post) => {
    if (post.youtube_url) return Video;
    if (post.featured_image_url) return ImageIcon;
    return FileText;
  };

  const getPostTypeColor = (post: Post) => {
    if (post.youtube_url) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    if (post.featured_image_url) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
  };

  const getPostTypeLabel = (post: Post) => {
    if (post.youtube_url) return 'Video';
    if (post.featured_image_url) return 'Rasm';
    return 'Matn';
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert('Havola nusxalandi!');
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Havola nusxalandi!');
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold theme-text mb-4 mt-8">{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold theme-text mb-3 mt-6">{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold theme-text mb-2 mt-4">{line.substring(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return <li key={index} className="theme-text-secondary ml-4 mb-1">{line.substring(2)}</li>;
        } else if (line.trim() === '') {
          return <br key={index} />;
        } else {
          return <p key={index} className="theme-text-secondary mb-4 leading-relaxed">{line}</p>;
        }
      });
  };

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

  if (error || !post) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">Maqola topilmadi</h1>
          <p className="theme-text-secondary mb-6">Siz qidirayotgan maqola mavjud emas yoki o'chirilgan.</p>
          <Link
            to="/posts"
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Maqolalarga qaytish</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.tags.join(', ')}
        image={post.featured_image_url}
        url={`https://revmohelp.uz/posts/${post.slug}`}
        type="article"
        article={{
          author: post.author?.full_name,
          publishedTime: post.published_at || post.created_at,
          modifiedTime: post.updated_at,
          section: post.category?.name,
          tags: post.tags
        }}
      />

      <div className="min-h-screen theme-bg">
        {/* Header */}
        <div className="theme-bg theme-shadow theme-border border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              to="/posts"
              className="inline-flex items-center space-x-2 theme-text-secondary hover:theme-accent transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span>Maqolalarga qaytish</span>
            </Link>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Article Header */}
          <header className="mb-12 animate-fade-in">
            {/* Category */}
            {post.category && (
              <div className="mb-6">
                <span
                  className="inline-block px-4 py-2 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: post.category.color }}
                >
                  {post.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold theme-text mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-6 text-sm theme-text-muted">
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>{post.author?.full_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={16} />
                  <span>{(post.views_count || 0).toLocaleString()} ko'rishlar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{Math.ceil(post.content.length / 1000)} daqiqa o'qish</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} />
                  <span>{comments.length} kommentariya</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                      : 'theme-bg-tertiary theme-text-secondary hover:bg-red-50 dark:hover:bg-red-900/10'
                  }`}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  <span className="text-sm">Yoqdi</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 theme-bg-tertiary theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-quaternary transition-colors duration-200"
                >
                  <Share2 size={16} />
                  <span className="text-sm">Ulashish</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="mb-8 animate-zoom-in">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-2xl theme-shadow-lg"
                />
              </div>
            )}

            {/* YouTube Video */}
            {post.youtube_url && (
              <div className="mb-8 animate-zoom-in">
                <div className="relative w-full h-64 md:h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                  <iframe
                    src={post.youtube_url.replace('watch?v=', 'embed/')}
                    title={post.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none theme-text animate-slide-up">
            {renderContent(post.content)}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 theme-border border-t animate-fade-in">
              <div className="flex items-center space-x-2 mb-4">
                <Tag size={20} className="theme-text-muted" />
                <h3 className="text-lg font-semibold theme-text">Teglar</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 theme-bg-tertiary theme-text-secondary rounded-lg hover:theme-bg-quaternary transition-colors duration-200 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Info */}
          {post.author && (
            <div className="mt-12 pt-8 theme-border border-t animate-fade-in">
              <div className="flex items-center space-x-4 p-6 theme-bg-secondary rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center">
                  <User size={24} className="theme-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold theme-text">{post.author.full_name}</h4>
                  <p className="theme-text-secondary capitalize">{post.author.role}</p>
                  <p className="theme-text-muted text-sm mt-1">
                    Professional tibbiy ma'lumotlar va maslahatlar
                  </p>
                </div>
                <Link
                  to={`/doctors/${post.author.id}`}
                  className="theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Profil ko'rish
                </Link>
              </div>
            </div>
          )}

          {/* Related Posts */}
          <div className="mt-16 animate-fade-in">
            <h3 className="text-2xl font-bold theme-text mb-8">O'xshash Maqolalar</h3>
            
            {relatedLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="theme-text-muted">O'xshash maqolalar yuklanmoqda...</p>
              </div>
            ) : relatedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost, index) => {
                  const PostTypeIcon = getPostTypeIcon(relatedPost);
                  return (
                    <article
                      key={relatedPost.id}
                      className="theme-bg rounded-xl theme-shadow hover:theme-shadow-lg transition-all duration-300 theme-border border overflow-hidden transform hover:-translate-y-1 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Post Media */}
                      <div className="relative h-40 overflow-hidden">
                        {relatedPost.featured_image_url ? (
                          <img
                            src={relatedPost.featured_image_url}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            loading="lazy"
                          />
                        ) : relatedPost.youtube_url ? (
                          <div className="relative w-full h-full">
                            <img
                              src={`https://img.youtube.com/vi/${relatedPost.youtube_url.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/maxresdefault.jpg`}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://img.youtube.com/vi/${relatedPost.youtube_url?.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}/hqdefault.jpg`;
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                                <Play size={16} className="text-white ml-1" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full theme-bg-tertiary flex items-center justify-center">
                            <div className="text-center">
                              <PostTypeIcon size={32} className="theme-text-muted mx-auto mb-2 opacity-50" />
                              <p className="theme-text-muted text-sm">Matn Maqolasi</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Post Type Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(relatedPost)}`}>
                            {getPostTypeLabel(relatedPost)}
                          </span>
                        </div>

                        {/* Category Badge */}
                        {relatedPost.category && (
                          <div className="absolute top-3 left-3">
                            <span
                              className="px-2 py-1 text-xs font-medium text-white rounded-full"
                              style={{ backgroundColor: relatedPost.category.color }}
                            >
                              {relatedPost.category.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="p-4">
                        <h4 className="text-lg font-bold theme-text mb-2 line-clamp-2 hover:theme-accent transition-colors duration-200">
                          <Link to={`/posts/${relatedPost.slug}`}>
                            {relatedPost.title}
                          </Link>
                        </h4>
                        
                        <p className="theme-text-secondary text-sm mb-3 line-clamp-2 leading-relaxed">
                          {relatedPost.excerpt}
                        </p>

                        {/* Post Meta */}
                        <div className="flex items-center justify-between text-sm theme-text-muted mb-3">
                          <div className="flex items-center space-x-1">
                            <User size={12} />
                            <span className="truncate max-w-24">{relatedPost.author?.full_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye size={12} />
                            <span className="theme-accent font-medium">{(relatedPost.views_count || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {relatedPost.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {relatedPost.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{relatedPost.tags.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Read More */}
                        <Link
                          to={`/posts/${relatedPost.slug}`}
                          className="inline-flex items-center space-x-1 theme-accent hover:theme-accent-secondary font-medium transition-colors duration-200 text-sm"
                        >
                          <BookOpen size={14} />
                          <span>Batafsil o'qish</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={32} className="theme-text-muted mx-auto mb-2 opacity-50" />
                <p className="theme-text-secondary">O'xshash maqolalar topilmadi</p>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section - Before Related Posts */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <CommentsSection 
            postId={post.id} 
            postTitle={post.title}
            onCommentsChange={loadComments}
          />
        </div>

        {/* Related Posts */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;