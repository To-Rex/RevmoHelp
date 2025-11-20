import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Star, 
  Award, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  CheckCircle,
  Users,
  Stethoscope,
  User,
  FileText,
  Eye,
  Play,
  Image as ImageIcon,
  Video,
  ArrowRight,
  BookOpen,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { getDoctorById } from '../lib/doctors';
import { getPosts } from '../lib/posts';
import { getDoctorReviews, createDoctorReview, getDoctorRatingStats } from '../lib/doctorReviews';
import { getPostTypeIcon, getPostTypeLabel, getPostTypeColor } from '../utils/postHelpers';
import type { DoctorReview, CreateDoctorReviewData } from '../lib/doctorReviews';
import type { Doctor } from '../lib/doctors';
import type { Post } from '../types';

const DoctorProfile: React.FC = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorPosts, setDoctorPosts] = useState<Post[]>([]);
  const [doctorReviews, setDoctorReviews] = useState<DoctorReview[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadDoctor();
    }
  }, [id, i18n.language]);

  useEffect(() => {
    if (doctor) {
      loadDoctorPosts();
      loadDoctorReviews();
      loadRatingStats();
    }
  }, [doctor]);
  
  const loadDoctor = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading doctor profile with ID:', id);
      
      const { data: doctorByIdData, error: doctorByIdError } = await getDoctorById(id, i18n.language);
      
      if (doctorByIdError && !doctorByIdData) {
        console.log('❌ Doctor not found via getDoctorById');
        setError(t('doctorNotFound'));
      } else if (doctorByIdData) {
        console.log('✅ Doctor found via getDoctorById');
        setDoctor(doctorByIdData);
      } else {
        setError(t('doctorDataNotLoaded'));
      }
    } catch (error) {
      console.error('❌ Error in loadDoctor:', error);
      setError(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorReviews = async () => {
    if (!doctor?.id) return;
    
    setReviewsLoading(true);
    try {
      console.log('💬 Loading reviews for doctor ID:', doctor.id);
      const { data } = await getDoctorReviews(doctor.id, { approved: true });
      if (data) {
        setDoctorReviews(data);
        console.log('✅ Doctor reviews loaded:', data.length);
      }
    } catch (error) {
      console.error('❌ Error loading doctor reviews:', error);
      setDoctorReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadRatingStats = async () => {
    if (!doctor?.id) return;
    
    try {
      const stats = await getDoctorRatingStats(doctor.id);
      setRatingStats(stats);
    } catch (error) {
      console.error('❌ Error loading rating stats:', error);
    }
  };

  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: '',
    anonymous: false,
    reviewer_name: ''
  });

  const handleReviewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setReviewFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (reviewMessage.text) setReviewMessage({ type: '', text: '' });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewFormData.comment.trim()) {
      setReviewMessage({ type: 'error', text: t('commentRequired') });
      return;
    }
    
    if (!user && !reviewFormData.reviewer_name.trim()) {
      setReviewMessage({ type: 'error', text: t('enterYourName') });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage({ type: '', text: '' });

    try {
      const reviewData: CreateDoctorReviewData = {
        doctor_id: doctor!.id,
        rating: reviewFormData.rating,
        comment: reviewFormData.comment.trim(),
        anonymous: reviewFormData.anonymous,
        reviewer_name: user ? undefined : reviewFormData.reviewer_name.trim()
      };

      const { data, error } = await createDoctorReview(reviewData);

      if (error) {
        setReviewMessage({ type: 'error', text: t('error') + ': ' + error.message });
      } else {
        setReviewMessage({ type: 'success', text: t('reviewAddedSuccessfully') });
        setReviewFormData({ rating: 5, comment: '', anonymous: false, reviewer_name: '' });
        setShowReviewForm(false);
        
        // Reload reviews and stats
        await loadDoctorReviews();
        await loadRatingStats();
      }
    } catch (error) {
      setReviewMessage({ type: 'error', text: t('errorOccurredTryAgain') });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const loadDoctorPosts = async () => {
    if (!doctor?.id) return;
    
    setPostsLoading(true);
    try {
      console.log('📝 Loading posts for doctor ID:', doctor.id);
      
      // Try to get posts by author_id (which could be user_id or doctor_id)
      const { data: posts, error } = await getPosts(i18n.language, { 
        author_id: doctor.id, 
        published: true 
      });
      
      if (posts && posts.length > 0) {
        setDoctorPosts(posts);
        console.log('✅ Doctor posts loaded:', posts.length);
      } else {
        console.log('⚠️ No posts found for this doctor');
        setDoctorPosts([]);
      }
    } catch (error) {
      console.error('❌ Error loading doctor posts:', error);
      setDoctorPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

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
          <p className="theme-text-muted">{t('loadingDoctor')}</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">{t('doctorNotFound')}</h1>
          <p className="theme-text-secondary mb-6">{t('doctorNotFoundDesc')}</p>
          <Link
            to="/doctors"
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>{t('backToDoctorsList')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title={`${doctor.full_name} - ${doctor.specialization}`}
        description={doctor.bio}
        keywords={`${doctor.full_name}, ${doctor.specialization}, shifokor, revmatolog`}
        url={`https://revmohelp.uz/doctors/${doctor.id}`}
      />

      <div className="min-h-screen theme-bg">
        {/* Header */}
        <div className="theme-bg theme-shadow theme-border border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              to="/doctors"
              className="inline-flex items-center space-x-2 theme-text-secondary hover:theme-accent transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span>{t('backToDoctorsList')}</span>
            </Link>
          </div>
        </div>

        {/* Doctor Profile Header */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-teal-600/5 dark:from-blue-400/3 dark:to-teal-400/3"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border overflow-hidden animate-fade-in" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Doctor Photo */}
                <div className="relative h-96 lg:h-full">
                  {doctor.avatar_url ? (
                    <img
                      src={doctor.avatar_url}
                      alt={doctor.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-50 to-highlight-50 dark:from-primary-900/20 dark:to-highlight-900/20 flex items-center justify-center">
                      <div className="text-center">
                        <User size={64} className="theme-text-muted opacity-60" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Verification Badge */}
                  {doctor.verified && (
                    <div className="absolute top-6 left-6">
                      <span className="bg-yellow-500 text-white rounded-full px-4 py-2 flex items-center space-x-2 text-sm font-bold shadow-lg">
                        <Award size={16} />
                        <span>{t('verified')}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="p-8 lg:p-12">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold theme-text mb-2">
                      {doctor.full_name}
                    </h1>
                    <p className="text-xl theme-accent font-semibold mb-4">
                      {doctor.specialization}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={18} className={`${star <= (ratingStats?.averageRating || 4.9) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="theme-text-secondary ml-2">
                          {ratingStats?.averageRating?.toFixed(1) || '0.0'} ({ratingStats?.totalReviews || 0} sharh)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 theme-text-secondary">
                        <Users size={16} />
                        <span>{t('patientsCount')}</span>
                      </div>
                    </div>
                  </div>

                  {doctor.bio && (
                    <p className="theme-text-secondary leading-relaxed mb-6">
                      {doctor.bio}
                    </p>
                  )}

                  {/* Quick Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center space-x-3 p-3 theme-bg-secondary rounded-xl">
                      <Calendar className="theme-accent" size={20} />
                      <div>
                        <p className="text-sm theme-text-secondary">{t('experience')}</p>
                        <p className="font-semibold theme-text">{doctor.experience_years} {t('years')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 theme-bg-secondary rounded-xl">
                      <CheckCircle className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm theme-text-secondary">{t('certificates')}</p>
                        <p className="font-semibold theme-text">{doctor.certificates?.length || 0} {t('count')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    {doctor.phone && (
                      <div className="flex items-center space-x-2 theme-text-secondary">
                        <Phone size={16} />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 theme-text-secondary">
                      <Mail size={16} />
                      <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 theme-text-secondary">
                      <MapPin size={16} />
                      <span>{t('location')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Doctor Details */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Doctor Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Specialization Areas */}
              <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 mt-8 animate-slide-up" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center">
                    <Stethoscope size={24} className="text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold theme-text">{t('specializationAreas')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                    <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">{doctor.specialization}</h4>
                    <p className="theme-text-secondary text-sm">{t('mainSpecialization')}</p>
                  </div>
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                    <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">{t('professionalExperience')}</h4>
                    <p className="theme-text-secondary text-sm">{doctor.experience_years} {t('yearsExperience')}</p>
                  </div>
                </div>
              </div>

              {/* Certificates */}
              {doctor.certificates && doctor.certificates.length > 0 && (
                <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-200" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center">
                      <Award size={24} className="text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold theme-text">{t('certificatesAndEducation')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctor.certificates.map((cert, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                        <Award className="text-primary-600" size={20} />
                        <span className="font-medium">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor's Posts */}
              {doctorPosts.length > 0 && (
                <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-400" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      <h3 className="text-2xl font-bold theme-text">{t('doctorArticles')}</h3>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium rounded-full">
                      {doctorPosts.length} {t('articles')}
                    </span>
                  </div>

                  {postsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="theme-text-muted">{t('loadingArticles')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {doctorPosts.map((post, index) => {
                        const PostTypeIcon = getPostTypeIcon(post);
                        return (
                          <article
                            key={post.id}
                            className="theme-bg-secondary rounded-xl theme-shadow hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1 theme-border border overflow-hidden group animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {/* Post Media */}
                            <div className="relative h-40 overflow-hidden">
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
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(post)}`}>
                                  {getPostTypeLabel(post)}
                                </span>
                              </div>

                              {/* Category Badge */}
                              {post.category && (
                                <div className="absolute top-3 left-3">
                                  <span
                                    className="px-2 py-1 text-xs font-medium text-white rounded-full"
                                    style={{ backgroundColor: post.category.color }}
                                  >
                                    {post.category.name}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Post Content */}
                            <div className="p-4">
                              <h4 className="text-lg font-bold theme-text mb-2 line-clamp-2 group-hover:theme-accent transition-colors duration-300">
                                <Link to={`/posts/${post.slug}`}>
                                  {post.title}
                                </Link>
                              </h4>

                              <p className="theme-text-secondary text-sm mb-3 line-clamp-2 leading-relaxed">
                                {post.excerpt}
                              </p>

                              {/* Post Meta */}
                              <div className="flex items-center justify-between text-sm theme-text-muted mb-3">
                                <div className="flex items-center space-x-1">
                                  <Calendar size={12} />
                                  <span>{formatDate(post.published_at || post.created_at)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye size={12} />
                                  <span className="theme-accent font-medium">{(post.views_count || 0).toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                    +{post.tags.length - 2}
                                </span>
                                )}
                              </div>

                              {/* Read More */}
                              <Link
                                to={`/posts/${post.slug}`}
                                className="inline-flex items-center space-x-1 theme-accent hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 text-sm"
                              >
                                <BookOpen size={14} />
                                <span>{t('readMore')}</span>
                                <ArrowRight size={12} />
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {/* View All Posts Link */}
                  {doctorPosts.length > 4 && (
                    <div className="text-center mt-6">
                      <Link
                        to={`/posts?author=${doctor.id}`}
                        className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                      >
                        <BookOpen size={18} />
                        <span>{t('viewAllArticles')}</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Reviews Section */}
              <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-8 animate-slide-up delay-600" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center">
                      <MessageSquare size={24} className="text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold theme-text">{t('patientReviews')} ({doctorReviews.length})</h3>
                  </div>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    <MessageSquare size={16} />
                    <span>{t('writeReview')}</span>
                  </button>
                </div>

                {/* Review Message */}
                {reviewMessage.text && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
                    reviewMessage.type === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    {reviewMessage.type === 'success' ? (
                      <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                    )}
                    <span className={reviewMessage.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      {reviewMessage.text}
                    </span>
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <div className="theme-bg-secondary rounded-xl p-6 mb-8 animate-slide-down">
                    <h4 className="text-lg font-semibold theme-text mb-4">
                      {t('leaveReviewAboutDoctor')}
                    </h4>
                    
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                          {t('rating')} *
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                                className={`p-1 transition-colors duration-200 ${
                                  star <= reviewFormData.rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                <Star size={24} className={star <= reviewFormData.rating ? 'fill-current' : ''} />
                              </button>
                            ))}
                          </div>
                          <span className="text-sm theme-text-secondary">({reviewFormData.rating}/5)</span>
                        </div>
                      </div>

                      {!user && (
                        <div>
                          <label className="block text-sm font-medium theme-text-secondary mb-2">
                            {t('yourName')} *
                          </label>
                          <input
                            type="text"
                            name="reviewer_name"
                            value={reviewFormData.reviewer_name}
                            onChange={handleReviewInputChange}
                            required
                            className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                            placeholder="Ismingizni kiriting"
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium theme-text-secondary mb-2">
                          {t('comment')} *
                        </label>
                        <textarea
                          name="comment"
                          value={reviewFormData.comment}
                          onChange={handleReviewInputChange}
                          required
                          rows={4}
                          className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text resize-none"
                          placeholder={t('shareYourThoughtsAboutDoctor')}
                        />
                        <div className="text-xs theme-text-muted mt-1">
                          {reviewFormData.comment.length}/500 belgi
                        </div>
                      </div>

                      {user && (
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="anonymous"
                            checked={reviewFormData.anonymous}
                            onChange={handleReviewInputChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label className="text-sm theme-text-secondary">
                            {t('leaveAnonymousReview')}
                          </label>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                        >
                          <Star size={16} />
                          <span>{isSubmittingReview ? t('sending') : t('sendReview')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewFormData({ rating: 5, comment: '', anonymous: false, reviewer_name: '' });
                            setReviewMessage({ type: '', text: '' });
                          }}
                          className="theme-border border theme-text-secondary px-6 py-3 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="theme-text-muted">{t('loadingReviews')}</p>
                  </div>
                ) : doctorReviews.length > 0 ? (
                  <div className="space-y-6">
                    {doctorReviews.map((review) => (
                      <div key={review.id} className="theme-bg-secondary rounded-xl p-6">
                        {/* Review Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center">
                              <User size={20} className="theme-accent" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold theme-text text-sm">
                                  {review.anonymous ? 'Anonim bemor' : (review.reviewer_name || 'Anonim')}
                                </span>
                                {!review.anonymous && review.reviewer_name && (
                                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                    Tasdiqlangan
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs theme-text-muted">
                                <Calendar size={12} />
                                <span>{new Date(review.created_at).toLocaleDateString('uz-UZ')}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={16} className={`${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>

                        {/* Review Content */}
                        <p className="theme-text-secondary leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare size={48} className="theme-text-muted mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-semibold theme-text-secondary mb-2">
                      {t('noReviewsYet')}
                    </h4>
                    <p className="theme-text-muted mb-6">
                      {t('beFirstToReview')}
                    </p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Star size={16} />
                      <span>{t('firstReview')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Professional Info */}
            <div className="space-y-8">
              {/* Professional Stats */}
              <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-6 mt-8 animate-slide-left" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <h3 className="text-xl font-bold theme-text mb-6">{t('professionalInfo')}</h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                    <div className="text-2xl font-bold theme-text mb-1">{doctor.experience_years}</div>
                    <div className="text-sm theme-text-secondary">{t('yearsExperience')}</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                    <div className="text-2xl font-bold theme-text mb-1">{ratingStats?.averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="text-sm theme-text-secondary">{t('averageRating')}</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                    <div className="text-2xl font-bold theme-text mb-1">{ratingStats?.totalReviews || 0}</div>
                    <div className="text-sm theme-text-secondary">{t('totalReviews')}</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200">
                    <div className="text-2xl font-bold theme-text mb-1">{doctor.certificates?.length || 0}</div>
                    <div className="text-sm theme-text-secondary">{t('certificates')}</div>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="theme-bg rounded-3xl theme-shadow-lg theme-border border p-6 animate-slide-left delay-200" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <h3 className="text-xl font-bold theme-text mb-6">{t('contact')}</h3>
                <div className="space-y-3">
                  {doctor.phone && (
                    <a
                      href={`tel:${doctor.phone}`}
                      className="w-full flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200 theme-text hover:theme-bg-tertiary transition-colors duration-200"
                    >
                      <Phone size={18} className="text-green-600" />
                      <span className="font-medium">{doctor.phone}</span>
                    </a>
                  )}

                  <a
                    href={`mailto:${doctor.email}`}
                    className="w-full flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-3xl focus:border-blue-500 transition-all duration-200 theme-text hover:theme-bg-tertiary transition-colors duration-200"
                  >
                    <Mail size={18} className="text-blue-600" />
                    <span className="font-medium">{doctor.email}</span>
                  </a>
                </div>
              </div>

              {/* Consultation Info */}
              <div className="bg-primary-600 rounded-3xl p-6 text-white animate-slide-left delay-400" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <h3 className="text-lg font-bold mb-2">{t('getConsultation')}</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  {t('consultationDescription')}
                </p>
                <Link
                  to="/consultation"
                  className="w-full bg-white text-primary-600 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Stethoscope size={18} />
                  <span>{t('freeConsultation')}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorProfile;