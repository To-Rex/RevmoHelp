import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Calendar, CreditCard as Edit, Settings, LogOut, Shield, Bell, Eye, EyeOff, Save, CheckCircle, AlertCircle, Stethoscope, FileText, Award, Users, Heart, Activity, Clock, Star, MessageSquare, TrendingUp, BookOpen, Plus } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { getDoctorProfileByUserId } from '../lib/doctorProfiles';
import { getPosts } from '../lib/posts';
import type { DoctorProfile } from '../lib/doctorProfiles';
import type { Post } from '../types';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [doctorPosts, setDoctorPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // If user is a doctor, load doctor profile and posts
      if (user.role === 'doctor') {
        const [profileResult, postsResult] = await Promise.all([
          getDoctorProfileByUserId(user.id),
          getPosts('uz', { author_id: user.id })
        ]);

        if (profileResult.data) {
          setDoctorProfile(profileResult.data);
        }

        if (postsResult.data) {
          setDoctorPosts(postsResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text mb-4">{t('loginRequired')}</h1>
          <p className="theme-text-secondary mb-6">{t('loginRequiredDesc')}</p>
          <Link
            to="/login"
            className="theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {t('loginToSystem')}
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadCount },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  // Add doctor-specific tabs
  if (user.role === 'doctor') {
    tabs.splice(1, 0, 
      { id: 'doctor-info', label: t('doctorInfo'), icon: Stethoscope },
      { id: 'posts', label: t('myArticles'), icon: FileText }
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <SEOHead
        title="Profil"
        description="Foydalanuvchi profili va sozlamalar"
        keywords="profil, sozlamalar, foydalanuvchi"
        url="https://revmohelp.uz/profile"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <User size={32} className="theme-accent" />
                </div>
              )}
              
              {/* Role Badge */}
              <div className="absolute -bottom-2 -right-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                  user.role === 'doctor' ? 'bg-blue-500 text-white' :
                  user.role === 'admin' ? 'bg-red-500 text-white' :
                  user.role === 'moderator' ? 'bg-orange-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  {user.role === 'doctor' ? 'Dr' :
                   user.role === 'admin' ? 'Admin' :
                   user.role === 'moderator' ? 'Mod' :
                   t('patient')}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold theme-text mb-2">{user.full_name}</h1>
              <p className="theme-accent font-semibold mb-2 capitalize">
                {user.role === 'doctor' ? 'Shifokor' :
                 user.role === 'admin' ? 'Administrator' :
                 user.role === 'moderator' ? 'Moderator' :
                 'Bemor'}
              </p>
              <p className="theme-text-secondary mb-4">{user.email}</p>
              
              {/* Role-specific description */}
              {user.role === 'doctor' ? (
                <p className="theme-text-muted text-sm">
                  Platformada tibbiy maqolalar yozish va bemorlar bilan bog'lanish imkoniyati
                </p>
              ) : user.role === 'patient' ? (
                <p className="theme-text-muted text-sm">
                  Tibbiy ma'lumotlar o'qish va shifokorlardan maslahat olish imkoniyati
                </p>
              ) : (
                <p className="theme-text-muted text-sm">
                  Platforma boshqaruvi va kontent moderatsiyasi
                </p>
              )}

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                {user.role === 'doctor' && (
                  <>
                    <Link
                      to="/doctor-dashboard"
                      className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Stethoscope size={16} />
                      <span>Shifokor Paneli</span>
                    </Link>
                    {!doctorProfile && (
                      <Link
                        to="/doctor-registration"
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <Plus size={16} />
                        <span>Profil Yaratish</span>
                      </Link>
                    )}
                  </>
                )}
                
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Settings size={16} />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 theme-bg-secondary rounded-xl">
                <div className="text-2xl font-bold theme-text mb-1">
                  {formatDate(user.created_at)}
                </div>
                <div className="text-sm theme-text-secondary">Qo'shilgan</div>
              </div>
              <div className="p-4 theme-bg-secondary rounded-xl">
                <div className="text-2xl font-bold theme-text mb-1">
                  {user.role === 'doctor' ? doctorPosts.length : '—'}
                </div>
                <div className="text-sm theme-text-secondary">
                  {user.role === 'doctor' ? 'Maqolalar' : 'Faollik'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="theme-bg rounded-lg theme-shadow theme-border border mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors duration-200 whitespace-nowrap border-b-2 relative ${
                    activeTab === tab.id
                      ? 'theme-accent border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'theme-text-secondary hover:theme-accent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
              <h2 className="text-2xl font-bold theme-text mb-6">Shaxsiy Ma'lumotlar</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    To'liq ism
                  </label>
                  <input
                    type="text"
                    value={user.full_name}
                    disabled
                    className="w-full px-4 py-3 theme-border border rounded-lg theme-bg theme-text opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 theme-border border rounded-lg theme-bg theme-text opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={user.phone || 'Kiritilmagan'}
                    disabled
                    className="w-full px-4 py-3 theme-border border rounded-lg theme-bg theme-text opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Rol
                  </label>
                  <input
                    type="text"
                    value={user.role === 'doctor' ? 'Shifokor' :
                           user.role === 'admin' ? 'Administrator' :
                           user.role === 'moderator' ? 'Moderator' :
                           'Bemor'}
                    disabled
                    className="w-full px-4 py-3 theme-border border rounded-lg theme-bg theme-text opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Ro'yxatdan o'tgan
                  </label>
                  <input
                    type="text"
                    value={formatDate(user.created_at)}
                    disabled
                    className="w-full px-4 py-3 theme-border border rounded-lg theme-bg theme-text opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Oxirgi yangilanish
                  </label>
                  <input
                    type="text"
                    value={formatDate(user.updated_at)}
                    disabled
                    className="w-full px-4 py-3 theme-border border rounded-lg theme-bg theme-text opacity-60"
                  />
                </div>
              </div>

              {/* Role-specific information */}
              {user.role === 'patient' && (
                <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart size={20} className="text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Bemor Profili</h3>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mb-4">
                    Siz bemor sifatida platformadan foydalanmoqdasiz. Bu sizga quyidagi imkoniyatlarni beradi:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <CheckCircle size={16} />
                      <span className="text-sm">Tibbiy maqolalarni o'qish</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <CheckCircle size={16} />
                      <span className="text-sm">Shifokorlardan maslahat olish</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <CheckCircle size={16} />
                      <span className="text-sm">Savol-javob bo'limida ishtirok etish</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <CheckCircle size={16} />
                      <span className="text-sm">Bemorlar tarixi o'qish</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Doctor Info Tab (only for doctors) */}
          {activeTab === 'doctor-info' && user.role === 'doctor' && (
            <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold theme-text">Shifokor Ma'lumotlari</h2>
                {doctorProfile && (
                  <Link
                    to="/doctor/profile/edit"
                    className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Edit size={16} />
                    <span>Tahrirlash</span>
                  </Link>
                )}
              </div>

              {doctorProfile ? (
                <div className="space-y-6">
                  {/* Professional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Mutaxassislik
                      </label>
                      <div className="p-3 theme-bg-secondary rounded-lg">
                        <span className="theme-text">{doctorProfile.specialization}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Tajriba
                      </label>
                      <div className="p-3 theme-bg-secondary rounded-lg">
                        <span className="theme-text">{doctorProfile.experience_years} yil</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Holat
                      </label>
                      <div className="p-3 theme-bg-secondary rounded-lg">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          doctorProfile.verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doctorProfile.verified ? 'Tasdiqlangan' : 'Tasdiq kutilmoqda'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Konsultatsiya narxi
                      </label>
                      <div className="p-3 theme-bg-secondary rounded-lg">
                        <span className="theme-text">
                          {doctorProfile.consultation_fee ? 
                            `${doctorProfile.consultation_fee.toLocaleString()} so'm` : 
                            'Bepul'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {doctorProfile.bio && (
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Bio
                      </label>
                      <div className="p-4 theme-bg-secondary rounded-lg">
                        <p className="theme-text-secondary leading-relaxed">{doctorProfile.bio}</p>
                      </div>
                    </div>
                  )}

                  {/* Certificates */}
                  {doctorProfile.certificates.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Sertifikatlar
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {doctorProfile.certificates.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-800 rounded-lg">
                            <Award size={16} />
                            <span className="text-sm">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {doctorProfile.languages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium theme-text-secondary mb-2">
                        Tillar
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {doctorProfile.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                          >
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Stethoscope size={48} className="theme-text-muted mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold theme-text-secondary mb-2">
                    Shifokor Profili Yaratilmagan
                  </h3>
                  <p className="theme-text-muted mb-6">
                    Shifokor sifatida faoliyat yuritish uchun professional profilingizni yarating.
                  </p>
                  <Link
                    to="/doctor-registration"
                    className="inline-flex items-center space-x-2 theme-accent-bg text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus size={20} />
                    <span>Profil Yaratish</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab (only for doctors) */}
          {activeTab === 'posts' && user.role === 'doctor' && (
            <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold theme-text">Mening Maqolalarim</h2>
                <Link
                  to="/doctor/posts/create"
                  className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus size={16} />
                  <span>Yangi Maqola</span>
                </Link>
              </div>

              {doctorPosts.length > 0 ? (
                <div className="space-y-4">
                  {doctorPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 theme-bg-secondary rounded-xl">
                      <div className="flex-1">
                        <h3 className="font-semibold theme-text mb-1 line-clamp-1">{post.title}</h3>
                        <div className="flex items-center space-x-4 text-sm theme-text-muted">
                          <span>{post.published ? 'Nashr etilgan' : 'Qoralama'}</span>
                          <span>{(post.views_count || 0).toLocaleString()} ko'rishlar</span>
                          <span>{formatDate(post.created_at)}</span>
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
                  
                  <div className="text-center pt-4">
                    <Link
                      to="/doctor/posts"
                      className="theme-accent hover:text-blue-800 font-medium"
                    >
                      Barcha maqolalarni ko'rish ({doctorPosts.length})
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="theme-text-muted mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold theme-text-secondary mb-2">Hozircha maqolalar yo'q</h3>
                  <p className="theme-text-muted mb-6">Birinchi tibbiy maqolangizni yozing</p>
                  <Link
                    to="/doctor/posts/create"
                    className="inline-flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus size={16} />
                    <span>Maqola Yozish</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
              <h2 className="text-2xl font-bold theme-text mb-6">Bildirishnomalar</h2>
              
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border-l-4 ${
                        notification.type === 'success' ? 'bg-green-50 border-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        notification.type === 'error' ? 'bg-red-50 border-red-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold theme-text mb-1">{notification.title}</h4>
                          <p className="theme-text-secondary text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs theme-text-muted">
                            <span>{formatDate(notification.sent_at)}</span>
                            {notification.post && (
                              <Link
                                to={`/posts/${notification.post.slug}`}
                                className="theme-accent hover:text-blue-800"
                              >
                                Maqolani ko'rish
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell size={48} className="theme-text-muted mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold theme-text-secondary mb-2">Bildirishnomalar yo'q</h3>
                  <p className="theme-text-muted">Hozircha sizga bildirishnomalar kelmagan</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Account Settings */}
              <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
                <h2 className="text-2xl font-bold theme-text mb-6">Hisob Sozlamalari</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 theme-bg-secondary rounded-xl">
                    <div>
                      <h3 className="font-semibold theme-text">Email Bildirishnomalar</h3>
                      <p className="theme-text-secondary text-sm">Yangi maqolalar va javoblar haqida email olish</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 theme-bg-secondary rounded-xl">
                    <div>
                      <h3 className="font-semibold theme-text">SMS Bildirishnomalar</h3>
                      <p className="theme-text-secondary text-sm">Muhim yangiliklar haqida SMS olish</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
                <h2 className="text-2xl font-bold theme-text mb-6">Maxfiylik Sozlamalari</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 theme-bg-secondary rounded-xl">
                    <div>
                      <h3 className="font-semibold theme-text">Profil Ko'rinishi</h3>
                      <p className="theme-text-secondary text-sm">Profilingiz boshqalar tomonidan ko'rinishi</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 theme-bg-secondary rounded-xl">
                    <div>
                      <h3 className="font-semibold theme-text">Faollik Holati</h3>
                      <p className="theme-text-secondary text-sm">Oxirgi faollik vaqtingiz ko'rinishi</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 border-red-200">
                <h2 className="text-2xl font-bold text-red-600 mb-6">Xavfli Zona</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="font-semibold text-red-800 mb-2">Hisobni O'chirish</h3>
                    <p className="text-red-700 text-sm mb-4">
                      Hisobingizni butunlay o'chirish. Bu amal qaytarib bo'lmaydi.
                    </p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200">
                      Hisobni O'chirish
                    </button>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <h3 className="font-semibold text-yellow-800 mb-2">Tizimdan Chiqish</h3>
                    <p className="text-yellow-700 text-sm mb-4">
                      Barcha qurilmalarda tizimdan chiqish
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Chiqish</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;