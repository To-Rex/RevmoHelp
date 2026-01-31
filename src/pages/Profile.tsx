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
  const { user, authProvider, signOut } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [doctorPosts, setDoctorPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isGeneratedEmail = (email: string) => {
    return /^user-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@example\.invalid$/.test(email);
  };

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
        <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 sm:p-8 hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
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
              <div className="inline-flex items-center px-4 py-2 bg-highlight-50 theme-accent rounded-full text-sm font-medium mb-4">
                {t(user.role)}
              </div>
            </div>

            {/* Contact Info Grid */}
            <div className={`mb-8 gap-4 ${!isGeneratedEmail(user.email) ? 'grid grid-cols-1 sm:grid-cols-3' : 'flex flex-col sm:flex-row justify-center'}`}>
              {!isGeneratedEmail(user.email) && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Mail className="w-6 h-6 theme-text-secondary mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900 mb-1">{t('email')}</div>
                <div className="text-xs text-gray-600 truncate">{user.email}</div>
              </div>
              )}

              {user.phone && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Phone className="w-6 h-6 theme-text-secondary mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900 mb-1">{t('phone')}</div>
                <div className="text-xs text-gray-600">{user.phone}</div>
              </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 theme-text-secondary mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900 mb-1">{t('memberSince')}</div>
                <div className="text-xs text-gray-600">{formatDate(user.created_at)}</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {new Date(user.created_at).toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' })}
                </div>
                <div className="text-xs text-gray-600">{t('registered')}</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {user.role === 'doctor' ? doctorPosts.length : t('status')}
                </div>
                <div className="text-xs text-gray-600">
                  {user.role === 'doctor' ? t('articles') : t('status')}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-lg font-bold theme-accent mb-1">100%</div>
                <div className="text-xs text-gray-600">{t('profileCompleteness')}</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-green-600 mb-1">5.0</div>
                <div className="text-xs text-gray-600">{t('rating')}</div>
              </div>
            </div>

            {/* Patient Description */}
            {user.role === 'patient' && (
              <div className="bg-highlight-50 border border-secondary-200 rounded-xl p-4 mb-6">
                <p className="text-sm theme-text-secondary text-center">
                  {t('useMedicalInfo')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {user.role === 'doctor' && (
                <>
                  <Link
                    to="/doctor-dashboard"
                    className="flex items-center space-x-2 theme-accent-bg hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <Stethoscope size={18} />
                    <span>{t('doctorPanel')}</span>
                  </Link>
                  {!doctorProfile && (
                    <Link
                      to="/doctor-registration"
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      <Plus size={18} />
                      <span>{t('createProfile')}</span>
                    </Link>
                  )}
                </>
              )}

              {user.role === 'patient' && (
                <>
                  <Link
                    to="/consultation"
                    className="flex items-center space-x-2 theme-accent-bg hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <Stethoscope size={18} />
                    <span>{t('consultation')}</span>
                  </Link>
                  <Link
                    to="/posts"
                    className="flex items-center space-x-2 theme-accent-bg hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <BookOpen size={18} />
                    <span>{t('articles')}</span>
                  </Link>
                </>
              )}

              {(user.role === 'admin' || user.role === 'moderator') && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Settings size={18} />
                  <span>{t('adminPanel')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Modern Tabs */}
        <div className="bg-white rounded-2xl theme-shadow-lg theme-border border mb-8 overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-center p-4">
            <div className="inline-flex rounded-lg theme-bg-secondary p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 font-semibold transition-all duration-200 whitespace-nowrap rounded-md text-sm ${
                      isActive
                        ? 'theme-accent-bg text-white shadow-sm'
                        : 'theme-text-secondary hover:theme-accent'
                    }`}
                  >
                    <Icon size={16} />
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
        </div>

        {/* Tab Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Responsive Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Personal Information Card */}
               <div className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                 <div className="bg-white px-6 py-4 border-b border-gray-100">
                   <div className="flex items-center space-x-3">
                     <div className="p-3 bg-blue-100 rounded-xl">
                       <User size={20} className="text-blue-600" />
                     </div>
                     <h2 className="text-lg font-semibold text-gray-900">{t('personalInfo')}</h2>
                   </div>
                 </div>

                 <div className="p-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <User size={16} className="theme-text-secondary flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">{user.full_name}</div>
                         </div>
                       </div>
                     </div>

                     {!isGeneratedEmail(user.email) && (
                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Mail size={16} className="theme-text-secondary flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailAddress')}</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium break-all">{user.email}</div>
                         </div>
                       </div>
                     </div>
                     )}

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Phone size={16} className="theme-text-secondary flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">{user.phone || t('notSpecified')}</div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Briefcase size={16} className="theme-text-secondary flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">{t('role')}</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">
                             {t(user.role)}
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Calendar size={16} className="theme-text-secondary flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">{t('registered')}</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">{formatDate(user.created_at)}</div>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <Activity size={16} className="theme-text-secondary flex-shrink-0" />
                         <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastUpdate')}</label>
                           <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">{formatDate(user.updated_at)}</div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

              {/* Modern Patient Benefits */}
                {user.role === 'patient' && (
                  <div className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                   <div className="bg-white px-6 py-4 border-b border-gray-100">
                     <div className="flex items-center space-x-3">
                       <div className="p-3 bg-green-100 rounded-xl">
                         <Heart size={20} className="text-green-600" />
                       </div>
                       <h3 className="text-lg font-semibold text-gray-900">{t('patientBenefits')}</h3>
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
                             <h4 className="font-semibold text-gray-900 mb-1">{t('medicalArticles')}</h4>
                             <p className="text-sm text-gray-600">{t('readProfessionalArticles')}</p>
                           </div>
                         </div>
                       </div>

                       <div className="group bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
                         <div className="flex items-center space-x-4">
                           <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                             <Stethoscope size={20} className="text-white" />
                           </div>
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-1">{t('consultation')}</h4>
                             <p className="text-sm text-gray-600">{t('getAdviceFromDoctors')}</p>
                           </div>
                         </div>
                       </div>

                       <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
                         <div className="flex items-center space-x-4">
                           <div className="p-3 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                             <MessageSquare size={20} className="text-white" />
                           </div>
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-1">{t('qa')}</h4>
                             <p className="text-sm text-gray-600">{t('askYourQuestions')}</p>
                           </div>
                         </div>
                       </div>

                       <div className="group bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200">
                         <div className="flex items-center space-x-4">
                           <div className="p-3 bg-orange-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                             <Users size={20} className="text-white" />
                           </div>
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-1">{t('patientStories')}</h4>
                             <p className="text-sm text-gray-600">{t('successStories')}</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4">
                       <Link
                         to="/consultation"
                         className="flex items-center justify-center space-x-2 theme-accent-bg hover:opacity-90 text-white px-6 py-4 rounded-xl transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl w-full sm:w-auto"
                       >
                         <Stethoscope size={20} />
                         <span>{t('startConsultation')}</span>
                       </Link>
                       <Link
                         to="/posts"
                         className="flex items-center justify-center space-x-2 theme-accent-bg hover:opacity-90 text-white px-6 py-4 rounded-xl transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl w-full sm:w-auto"
                       >
                         <BookOpen size={20} />
                         <span>{t('readArticles')}</span>
                       </Link>
                     </div>
                   </div>
                 </div>
               )}

               {/* Become Doctor Section */}
               {user.role === 'patient' && (
                 <div className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                   <div className="bg-white px-6 py-4 border-b border-gray-100">
                     <div className="flex items-center space-x-3">
                       <div className="p-3 bg-green-100 rounded-xl">
                         <Stethoscope size={20} className="text-green-600" />
                       </div>
                       <h3 className="text-lg font-semibold text-gray-900">{t('becomeDoctor')}</h3>
                     </div>
                   </div>

                   <div className="p-6">
                     <div className="text-center">
                       <p className="text-gray-600 mb-6">
                         Agar siz ham shifokor bo'lishni xohlasangiz, professional profilingizni yarating va bemorlarga yordam bering.
                       </p>
                       <Link
                         to="/doctor-registration"
                         className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                       >
                         <Stethoscope size={20} />
                         <span>{t('becomeDoctor')}</span>
                       </Link>
                     </div>
                   </div>
                 </div>
               )}

            </div>
          )}
          {/* Modern Doctor Info Tab (only for doctors) */}
           {activeTab === 'doctor-info' && user.role === 'doctor' && (
             <div className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Stethoscope size={20} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('doctorInfo')}</h2>
                  </div>
                  {doctorProfile && (
                    <Link
                      to="/doctor/profile/edit"
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      <Edit size={16} />
                      <span>{t('edit')}</span>
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
                          <span className="text-sm font-medium theme-text-secondary">{t('specialization')}</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">{doctorProfile.specialization}</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <Award size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-green-800">{t('experience')}</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">{doctorProfile.experience_years} yil</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-purple-500 rounded-lg">
                            <Shield size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-purple-800">{t('status')}</span>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          doctorProfile.verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doctorProfile.verified ? t('verified') : t('verificationPending')}
                        </span>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <Activity size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-orange-800">{t('consultationFee')}</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">
                          {doctorProfile.consultation_fee ?
                            `${doctorProfile.consultation_fee.toLocaleString()} so'm` :
                            t('free')
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
                          <span className="text-sm font-medium text-indigo-800">{t('bio')}</span>
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
                          <span className="text-sm font-medium text-yellow-800">{t('certificates')}</span>
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
                          <span className="text-sm font-medium text-pink-800">{t('languages')}</span>
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
                    <div className="w-24 h-24 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Stethoscope size={40} className="theme-text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">
                      {t('doctorProfileNotCreated')}
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                      {t('createDoctorProfileDesc')}
                    </p>
                    <Link
                      to="/doctor-registration"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus size={20} />
                      <span>{t('createProfile')}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modern Posts Tab (only for doctors) */}
           {activeTab === 'posts' && user.role === 'doctor' && (
             <div className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-secondary-100 rounded-xl">
                      <FileText size={20} className="theme-text-secondary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{t('myArticles')}</h2>
                  </div>
                  <Link
                    to="/doctor/posts/create"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus size={18} />
                    <span>{t('newArticle')}</span>
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
                                  {post.published ? t('published') : t('draft')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye size={14} />
                                <span>{(post.views_count || 0).toLocaleString()} {t('views')}</span>
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
                        className="inline-flex items-center space-x-2 theme-accent hover:text-blue-800 font-semibold text-lg hover:underline"
                      >
                        <span>{t('viewAllArticles')} ({doctorPosts.length})</span>
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FileText size={40} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">{t('noArticlesYet')}</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                      {t('writeFirstArticle')}
                    </p>
                    <Link
                      to="/doctor/posts/create"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus size={20} />
                      <span>{t('writeArticle')}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modern Notifications Tab */}
           {activeTab === 'notifications' && (
             <div className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-secondary-100 rounded-xl">
                    <Bell size={20} className="theme-text-secondary" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('notifications')}</h2>
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
                                  className="theme-accent hover:text-blue-800 font-medium text-sm hover:underline"
                                >
                                  {t('viewArticle')} →
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
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">{t('noNotifications')}</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">{t('noNotificationsDesc')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modern Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Account Settings */}
               <div className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div className="bg-white px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-secondary-100 rounded-xl">
                      <Settings size={20} className="theme-text-secondary" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('accountSettings')}</h2>
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
                          <h3 className="font-semibold text-gray-900">{t('emailNotifications')}</h3>
                          <p className="text-sm text-gray-600">{t('emailNotificationsDesc')}</p>
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
                          <h3 className="font-semibold text-gray-900">{t('smsNotifications')}</h3>
                          <p className="text-sm text-gray-600">{t('smsNotificationsDesc')}</p>
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
               <div className="bg-white rounded-2xl theme-shadow-lg theme-border border overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div className="bg-white px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Shield size={20} className="text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('privacySettings')}</h2>
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
                          <h3 className="font-semibold text-gray-900">{t('profileVisibility')}</h3>
                          <p className="text-sm text-gray-600">{t('profileVisibilityDesc')}</p>
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
                          <h3 className="font-semibold text-gray-900">{t('activityStatus')}</h3>
                          <p className="text-sm text-gray-600">{t('activityStatusDesc')}</p>
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
               <div className="bg-white rounded-2xl theme-shadow-lg theme-border border border-red-200 overflow-hidden hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-medical" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div className="bg-white px-6 py-4 border-b border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <AlertCircle size={20} className="text-red-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-red-600">{t('dangerZone')}</h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-red-500 rounded-xl flex-shrink-0">
                        <AlertCircle size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-800 mb-2">{t('deleteAccount')}</h3>
                        <p className="text-red-700 text-sm mb-4 leading-relaxed">
                          {t('deleteAccountDesc')}
                        </p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
                          {t('deleteAccount')}
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
                        <h3 className="font-semibold text-yellow-800 mb-2">{t('logout')}</h3>
                        <p className="text-yellow-700 text-sm mb-4 leading-relaxed">
                          {t('logoutDesc')}
                        </p>
                        <button
                          onClick={handleSignOut}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl"
                        >
                          <LogOut size={18} />
                          <span>{t('logout')}</span>
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
