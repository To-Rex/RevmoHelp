import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stethoscope, FileText, Users, Calendar, Award, Plus, CreditCard as Edit, Eye, TrendingUp, Clock, MessageSquare, Star, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { getDoctorProfileByUserId } from '../lib/doctorProfiles';
import { getPosts } from '../lib/posts';
import type { DoctorProfile } from '../lib/doctorProfiles';
import type { Post } from '../types';

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDoctorData();
    }
  }, [user]);

  const loadDoctorData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [profileResult, postsResult] = await Promise.all([
        getDoctorProfileByUserId(user.id),
        getPosts('uz', { author_id: user.id })
      ]);

      if (profileResult.data) {
        setDoctorProfile(profileResult.data);
      }

      if (postsResult.data) {
        setPosts(postsResult.data);
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  };

  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.published).length,
    totalViews: posts.reduce((sum, p) => sum + (p.views_count || 0), 0),
    avgRating: 4.8 // Mock data
  };

  if (!user) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">{t('dashboardLoginRequired')}</h1>
          <p className="theme-text-secondary mb-6">{t('dashboardLoginRequiredDesc')}</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'doctor') {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">{t('dashboardAccessDenied')}</h1>
          <p className="theme-text-secondary mb-6">{t('dashboardDoctorOnlyPage')}</p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">{t('dashboardLoadingDoctorProfile')}</p>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Stethoscope size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold theme-text mb-4">{t('dashboardCreateDoctorProfile')}</h1>
          <p className="theme-text-secondary mb-6 max-w-md mx-auto">
            {t('createDoctorProfileDesc')}
          </p>
          <Link
            to="/doctor-registration"
            className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>{t('createProfile')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <SEOHead
        title={t('doctorPanel')}
        description={t('dashboardDoctorPanelDescription')}
        keywords="shifokor panel, tibbiy maqolalar, bemor boshqaruvi"
        url="https://revmohelp.uz/doctor-dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold theme-text mb-2">
                {t('dashboardWelcomeDoctor')}, {doctorProfile.full_name}!
              </h1>
              <p className="theme-text-secondary">{t('dashboardDoctorPanelSpecialization')} - {doctorProfile.specialization}</p>
            </div>
            <div className="flex items-center space-x-2">
              {doctorProfile.verified ? (
                <span className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle size={16} />
                  <span>{t('verified')}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                  <Clock size={16} />
                  <span>{t('verificationPending')}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        {!doctorProfile.verified && (
          <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle size={24} className="text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">{t('dashboardProfileVerificationPending')}</h3>
                <p className="text-yellow-700 mb-4">
                  {t('dashboardProfileVerificationDesc')}
                </p>
                <div className="flex items-center space-x-4 text-sm text-yellow-600">
                  <span>• {t('dashboardFillProfileInfo')}</span>
                  <span>• {t('dashboardAddCertificates')}</span>
                  <span>• {t('dashboardWaitAdminApproval')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold theme-text mb-2">{stats.totalPosts}</div>
            <div className="theme-text-secondary">{t('dashboardTotalArticles')}</div>
          </div>

          <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold theme-text mb-2">{stats.publishedPosts}</div>
            <div className="theme-text-secondary">{t('published')}</div>
          </div>

          <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Eye size={24} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold theme-text mb-2">{stats.totalViews.toLocaleString()}</div>
            <div className="theme-text-secondary">{t('dashboardViews')}</div>
          </div>

          <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-yellow-600" />
            </div>
            <div className="text-2xl font-bold theme-text mb-2">{stats.avgRating}</div>
            <div className="theme-text-secondary">{t('dashboardRating')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6">
              <h2 className="text-xl font-bold theme-text mb-4">{t('dashboardQuickActions')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/doctor/posts/create"
                  className="flex items-center space-x-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors duration-200"
                >
                  <Plus size={20} />
                  <span className="font-medium">{t('dashboardWriteNewArticle')}</span>
                </Link>
                <Link
                  to="/doctor/profile/edit"
                  className="flex items-center space-x-3 p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors duration-200"
                >
                  <Edit size={20} />
                  <span className="font-medium">{t('editProfile')}</span>
                </Link>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold theme-text">{t('dashboardMyRecentArticles')}</h2>
                <Link
                  to="/doctor/posts"
                  className="text-sm theme-accent hover:text-blue-800 font-medium"
                >
                  {t('viewAllArticles')}
                </Link>
              </div>
              
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-white rounded-xl theme-border border">
                      <div className="flex-1">
                        <h3 className="font-semibold theme-text mb-1 line-clamp-1">{post.title}</h3>
                        <div className="flex items-center space-x-4 text-sm theme-text-muted">
                          <span>{post.published ? t('published') : t('draft')}</span>
                          <span>{(post.views_count || 0).toLocaleString()} {t('views')}</span>
                          <span>{new Date(post.created_at).toLocaleDateString('uz-UZ')}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/doctor/posts/edit/${post.id}`}
                          className="p-2 theme-accent hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        >
                          <Edit size={16} />
                        </Link>
                        <Link
                          to={`/posts/${post.slug}`}
                          target="_blank"
                          className="p-2 text-green-600 hover:text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="theme-text-muted mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold theme-text-secondary mb-2">{t('noArticlesYet')}</h3>
                  <p className="theme-text-muted mb-4">{t('writeFirstArticle')}</p>
                  <Link
                    to="/doctor/posts/create"
                    className="inline-flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus size={16} />
                    <span>{t('writeArticle')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6">
              <h3 className="text-lg font-bold theme-text mb-4">{t('dashboardProfileSummary')}</h3>

              <div className="text-center mb-6">
                {doctorProfile.avatar_url ? (
                  <img
                    src={doctorProfile.avatar_url}
                    alt={doctorProfile.full_name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope size={24} className="text-blue-600" />
                  </div>
                )}
                <h4 className="text-lg font-bold theme-text">{doctorProfile.full_name}</h4>
                <p className="theme-accent font-medium">{doctorProfile.specialization}</p>
                <p className="theme-text-secondary text-sm">{doctorProfile.experience_years} {t('dashboardYearsExperience')}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="theme-text-secondary">{t('certificates')}</span>
                  <span className="font-medium theme-text">{doctorProfile.certificates.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="theme-text-secondary">{t('dashboardEducation')}</span>
                  <span className="font-medium theme-text">{doctorProfile.education.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="theme-text-secondary">{t('languages')}</span>
                  <span className="font-medium theme-text">{doctorProfile.languages.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="theme-text-secondary">{t('dashboardStatus')}</span>
                  <span className={`font-medium ${doctorProfile.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {doctorProfile.verified ? t('verified') : t('dashboardPending')}
                  </span>
                </div>
              </div>

              <Link
                to="/doctor/profile/edit"
                className="w-full mt-6 theme-accent-bg text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Edit size={16} />
                <span>{t('editProfile')}</span>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6">
              <h3 className="text-lg font-bold theme-text mb-4">{t('dashboardContactInfo')}</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="theme-text-muted" />
                  <span className="text-sm theme-text">{doctorProfile.email}</span>
                </div>
                {doctorProfile.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className="theme-text-muted" />
                    <span className="text-sm theme-text">{doctorProfile.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="theme-text-muted" />
                  <span className="text-sm theme-text">
                    {Object.values(doctorProfile.working_hours || {}).filter(h => h.available).length} {t('dashboardDaysAvailable')}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6">
              <h3 className="text-lg font-bold theme-text mb-4">{t('dashboardRecentActivity')}</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="theme-text-secondary">{t('dashboardProfileCreated')}</span>
                  <span className="theme-text-muted ml-auto">
                    {new Date(doctorProfile.created_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
                {posts.length > 0 && (
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="theme-text-secondary">{t('dashboardLastArticle')}</span>
                    <span className="theme-text-muted ml-auto">
                      {new Date(posts[0].created_at).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;