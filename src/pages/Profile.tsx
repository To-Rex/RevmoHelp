import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Calendar, CreditCard as Edit, Settings, LogOut, Shield, Bell, Eye, EyeOff, Save, CheckCircle, AlertCircle, Stethoscope, FileText, Award, Users, Heart, Activity, Clock, Star, MessageSquare, TrendingUp, BookOpen, Plus, Camera, MapPin, Building2, Briefcase, ArrowRight } from 'lucide-react';
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

      {/* Responsive Hero Section */}
      <div className="relative mb-6 sm:mb-8">
        {/* Simple Cover */}
        <div className="h-12 sm:h-10 md:h-28 relative rounded-xl transition-all duration-700 ease-in-out"></div>

        
        {/* Profile Content */}
        <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Centered Avatar and Basic Info */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User size={40} className="text-gray-500" />
                  </div>
                )}

                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {user.full_name}
              </h1>
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                {user.role === 'doctor' ? 'Shifokor' :
                 user.role === 'admin' ? 'Administrator' :
                 user.role === 'moderator' ? 'Moderator' :
                 'Bemor'}
              </div>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900 mb-1">Email</div>
                <div className="text-xs text-gray-600 truncate">{user.email}</div>
              </div>

              {user.phone && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Phone className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900 mb-1">Telefon</div>
                  <div className="text-xs text-gray-600">{user.phone}</div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900 mb-1">A'zo bo'lgan</div>
                <div className="text-xs text-gray-600">{formatDate(user.created_at)}</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {new Date(user.created_at).toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' })}
                </div>
                <div className="text-xs text-gray-600">Ro'yxatdan o'tgan</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {user.role === 'doctor' ? doctorPosts.length : 'Faol'}
                </div>
                <div className="text-xs text-gray-600">
                  {user.role === 'doctor' ? 'Maqolalar' : 'Holat'}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-blue-600 mb-1">100%</div>
                <div className="text-xs text-gray-600">Profil to'liqligi</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-green-600 mb-1">5.0</div>
                <div className="text-xs text-gray-600">Reyting</div>
              </div>
            </div>

            {/* Patient Description */}
            {user.role === 'patient' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 text-center">
                  Tibbiy ma'lumotlar va professional maslahatlardan foydalaning
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {user.role === 'doctor' && (
                <>
                  <Link
                    to="/doctor-dashboard"
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <Stethoscope size={18} />
                    <span>Shifokor Paneli</span>
                  </Link>
                  {!doctorProfile && (
                    <Link
                      to="/doctor-registration"
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      <Plus size={18} />
                      <span>Profil Yaratish</span>
                    </Link>
                  )}
                </>
              )}

              {user.role === 'patient' && (
                <>
                  <Link
                    to="/consultation"
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <Stethoscope size={18} />
                    <span>Konsultatsiya</span>
                  </Link>
                  <Link
                    to="/posts"
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <BookOpen size={18} />
                    <span>Maqolalar</span>
                  </Link>
                </>
              )}

              {(user.role === 'admin' || user.role === 'moderator') && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Settings size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Modern Tabs */}
         <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
           <div className="flex overflow-x-auto scrollbar-hide">
             {tabs.map((tab, index) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`relative flex items-center space-x-3 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap text-sm sm:text-base min-w-max ${
                     isActive
                       ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                   }`}
                 >
                   <Icon size={20} className="flex-shrink-0" />
                   <span>{tab.label}</span>
                   {tab.badge && tab.badge > 0 && (
                     <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                       {tab.badge > 9 ? '9+' : tab.badge}
                     </div>
                   )}
                 </button>
               );
             })}
           </div>
         </div>

        {/* Tab Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Responsive Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Personal Information Card */}
               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                 <div className="bg-white px-6 py-4 border-b border-gray-100">
                   <div className="flex items-center space-x-3">
                     <div className="p-3 bg-blue-100 rounded-xl">
                       <User size={20} className="text-blue-600" />
                     </div>
                     <h2 className="text-lg font-semibold text-gray-900">Shaxsiy Ma'lumotlar</h2>
                   </div>
                 </div>

                 <div className="p-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <User size={16} className="text-blue-600 flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">To'liq ism</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">{user.full_name}</div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Mail size={16} className="text-blue-600 flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Email manzil</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium break-all">{user.email}</div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Phone size={16} className="text-blue-600 flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqam</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">{user.phone || 'Kiritilmagan'}</div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Briefcase size={16} className="text-blue-600 flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">
                             {user.role === 'doctor' ? 'Shifokor' :
                              user.role === 'admin' ? 'Administrator' :
                              user.role === 'moderator' ? 'Moderator' :
                              'Bemor'}
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Calendar size={16} className="text-blue-600 flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Ro'yxatdan o'tgan</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">{formatDate(user.created_at)}</div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Activity size={16} className="text-blue-600 flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Oxirgi yangilanish</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">{formatDate(user.updated_at)}</div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

              {/* Modern Patient Benefits */}
                {user.role === 'patient' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                   <div className="bg-white px-6 py-4 border-b border-gray-100">
                     <div className="flex items-center space-x-3">
                       <div className="p-3 bg-green-100 rounded-xl">
                         <Heart size={20} className="text-green-600" />
                       </div>
                       <h3 className="text-lg font-semibold text-gray-900">Bemor Imkoniyatlari</h3>
                     </div>
                   </div>

                   <div className="p-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                       <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
                         <div className="flex items-center space-x-4">
                           <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                             <BookOpen size={20} className="text-white" />
                           </div>
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-1">Tibbiy Maqolalar</h4>
                             <p className="text-sm text-gray-600">Professional maqolalarni o'qish</p>
                           </div>
                         </div>
                       </div>

                       <div className="group bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
                         <div className="flex items-center space-x-4">
                           <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                             <Stethoscope size={20} className="text-white" />
                           </div>
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-1">Konsultatsiya</h4>
                             <p className="text-sm text-gray-600">Shifokorlardan maslahat olish</p>
                           </div>
                         </div>
                       </div>

                       <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
                         <div className="flex items-center space-x-4">
                           <div className="p-3 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                             <MessageSquare size={20} className="text-white" />
                           </div>
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-1">Savol-Javob</h4>
                             <p className="text-sm text-gray-600">Savollaringizni bering</p>
                           </div>
                         </div>
                       </div>

                       <div className="group bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200">
                         <div className="flex items-center space-x-4">
                           <div className="p-3 bg-orange-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                             <Users size={20} className="text-white" />
                           </div>
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-1">Bemor Tarixi</h4>
                             <p className="text-sm text-gray-600">Muvaffaqiyatli hikoyalar</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4">
                       <Link
                         to="/consultation"
                         className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl w-full sm:w-auto"
                       >
                         <Stethoscope size={20} />
                         <span>Konsultatsiya Boshlash</span>
                       </Link>
                       <Link
                         to="/posts"
                         className="flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-xl transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl w-full sm:w-auto"
                       >
                         <BookOpen size={20} />
                         <span>Maqolalarni O'qish</span>
                       </Link>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* Modern Doctor Info Tab (only for doctors) */}
           {activeTab === 'doctor-info' && user.role === 'doctor' && (
             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Stethoscope size={20} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Shifokor Ma'lumotlari</h2>
                  </div>
                  {doctorProfile && (
                    <Link
                      to="/doctor/profile/edit"
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      <Edit size={16} />
                      <span>Tahrirlash</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-6">
                {doctorProfile ? (
                  <div className="space-y-8">
                    {/* Professional Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Stethoscope size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-blue-800">Mutaxassislik</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">{doctorProfile.specialization}</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <Award size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-green-800">Tajriba</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">{doctorProfile.experience_years} yil</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-purple-500 rounded-lg">
                            <Shield size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-purple-800">Holat</span>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          doctorProfile.verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doctorProfile.verified ? 'Tasdiqlangan' : 'Tasdiq kutilmoqda'}
                        </span>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <Activity size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-orange-800">Konsultatsiya narxi</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">
                          {doctorProfile.consultation_fee ?
                            `${doctorProfile.consultation_fee.toLocaleString()} so'm` :
                            'Bepul'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {doctorProfile.bio && (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-indigo-500 rounded-lg">
                            <FileText size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-indigo-800">Bio</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{doctorProfile.bio}</p>
                      </div>
                    )}

                    {/* Certificates */}
                    {doctorProfile.certificates.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-yellow-500 rounded-lg">
                            <Award size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-yellow-800">Sertifikatlar</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {doctorProfile.certificates.map((cert, index) => (
                            <div key={index} className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200 flex items-center space-x-3">
                              <Award size={18} className="text-yellow-600 flex-shrink-0" />
                              <span className="text-yellow-800 font-medium">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {doctorProfile.languages.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-pink-500 rounded-lg">
                            <MessageSquare size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-pink-800">Tillar</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {doctorProfile.languages.map((lang) => (
                            <span
                              key={lang}
                              className="px-4 py-2 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 text-sm font-semibold rounded-full border border-pink-300"
                            >
                              {lang.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Stethoscope size={40} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">
                      Shifokor Profili Yaratilmagan
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                      Shifokor sifatida faoliyat yuritish uchun professional profilingizni yarating va bemorlarga yordam bering.
                    </p>
                    <Link
                      to="/doctor-registration"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus size={20} />
                      <span>Profil Yaratish</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modern Posts Tab (only for doctors) */}
           {activeTab === 'posts' && user.role === 'doctor' && (
             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Mening Maqolalarim</h2>
                  </div>
                  <Link
                    to="/doctor/posts/create"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus size={18} />
                    <span>Yangi Maqola</span>
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {doctorPosts.length > 0 ? (
                  <div className="space-y-4">
                    {doctorPosts.slice(0, 5).map((post) => (
                      <div key={post.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-lg">{post.title}</h3>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {post.published ? 'Nashr etilgan' : 'Qoralama'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye size={14} />
                                <span>{(post.views_count || 0).toLocaleString()} ko'rishlar</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{formatDate(post.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Link
                              to={`/doctor/posts/edit/${post.id}`}
                              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
                            >
                              <Edit size={16} />
                            </Link>
                            <Link
                              to={`/posts/${post.slug}`}
                              target="_blank"
                              className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
                            >
                              <Eye size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="text-center pt-6">
                      <Link
                        to="/doctor/posts"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold text-lg hover:underline"
                      >
                        <span>Barcha maqolalarni ko'rish ({doctorPosts.length})</span>
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FileText size={40} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">Hozircha maqolalar yo'q</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                      Birinchi tibbiy maqolangizni yozing va bilimlaringizni bemorlar bilan baham ko'ring.
                    </p>
                    <Link
                      to="/doctor/posts/create"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus size={20} />
                      <span>Maqola Yozish</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modern Notifications Tab */}
           {activeTab === 'notifications' && (
             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Bell size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Bildirishnomalar</h2>
                </div>
              </div>

              <div className="p-6">
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.slice(0, 10).map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-5 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                          notification.type === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500' :
                          notification.type === 'warning'
                            ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500' :
                          notification.type === 'error'
                            ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-500' :
                            'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {notification.type === 'success' ? <CheckCircle size={20} className="text-green-600" /> :
                             notification.type === 'warning' ? <AlertCircle size={20} className="text-yellow-600" /> :
                             notification.type === 'error' ? <AlertCircle size={20} className="text-red-600" /> :
                             <Bell size={20} className="text-blue-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-2">{notification.title}</h4>
                            <p className="text-gray-700 mb-3 leading-relaxed">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">{formatDate(notification.sent_at)}</span>
                              {notification.post && (
                                <Link
                                  to={`/posts/${notification.post.slug}`}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                                >
                                  Maqolani ko'rish →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Bell size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">Bildirishnomalar yo'q</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Hozircha sizga bildirishnomalar kelmagan. Yangiliklar paydo bo'lganda bu yerda ko'rinadi.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modern Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Account Settings */}
               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-white px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Settings size={20} className="text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Hisob Sozlamalari</h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <Mail size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Email Bildirishnomalar</h3>
                          <p className="text-sm text-gray-600">Yangi maqolalar va javoblar haqida email olish</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-500 rounded-xl">
                          <Phone size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">SMS Bildirishnomalar</h3>
                          <p className="text-sm text-gray-600">Muhim yangiliklar haqida SMS olish</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-white px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Shield size={20} className="text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Maxfiylik Sozlamalari</h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-500 rounded-xl">
                          <Eye size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Profil Ko'rinishi</h3>
                          <p className="text-sm text-gray-600">Profilingiz boshqalar tomonidan ko'rinishi</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-orange-500 rounded-xl">
                          <Activity size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Faollik Holati</h3>
                          <p className="text-sm text-gray-600">Oxirgi faollik vaqtingiz ko'rinishi</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
               <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
                <div className="bg-white px-6 py-4 border-b border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <AlertCircle size={20} className="text-red-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-red-600">Xavfli Zona</h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-red-500 rounded-xl flex-shrink-0">
                        <AlertCircle size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-800 mb-2">Hisobni O'chirish</h3>
                        <p className="text-red-700 text-sm mb-4 leading-relaxed">
                          Hisobingizni butunlay o'chirish. Bu amal qaytarib bo'lmaydi va barcha ma'lumotlaringiz o'chib ketadi.
                        </p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
                          Hisobni O'chirish
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-yellow-500 rounded-xl flex-shrink-0">
                        <LogOut size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-yellow-800 mb-2">Tizimdan Chiqish</h3>
                        <p className="text-yellow-700 text-sm mb-4 leading-relaxed">
                          Barcha qurilmalarda tizimdan chiqish va sessiyani tugatish
                        </p>
                        <button
                          onClick={handleSignOut}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl"
                        >
                          <LogOut size={18} />
                          <span>Tizimdan Chiqish</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
       <div className="h-12 sm:h-10 md:h-8 relative rounded-xl transition-all duration-700 ease-in-out"></div>
    </div>
  );
};

export default Profile;
