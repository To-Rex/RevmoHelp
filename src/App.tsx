import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useLayoutEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase, isSupabaseAvailable, setSupabaseConnectionHealth } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useLanguageRouting } from './hooks/useLanguageRouting';
import { preloadCriticalData } from './lib/cache';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AdminLayout from './components/admin/AdminLayout';
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Home = lazy(() => import('./pages/Home'));
const Posts = lazy(() => import('./pages/Posts'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const PostsManagement = lazy(() => import('./pages/admin/PostsManagement'));
const CreatePost = lazy(() => import('./pages/admin/CreatePost'));
const DoctorsManagement = lazy(() => import('./pages/admin/DoctorsManagement'));
const AdminsManagement = lazy(() => import('./pages/admin/AdminsManagement'));
const StaticPagesManagement = lazy(() => import('./pages/admin/StaticPagesManagement'));
const PartnersManagement = lazy(() => import('./pages/admin/PartnersManagement'));
const PatientStoriesManagement = lazy(() => import('./pages/admin/PatientStoriesManagement'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const DiseasesManagement = lazy(() => import('./pages/admin/DiseasesManagement'));
const Doctors = lazy(() => import('./pages/Doctors'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const QA = lazy(() => import('./pages/QA'));
const QuestionDetail = lazy(() => import('./pages/QuestionDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Partnership = lazy(() => import('./pages/Partnership'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Privacy = lazy(() => import('./pages/Privacy'));
const DataSecurity = lazy(() => import('./pages/DataSecurity'));
const Terms = lazy(() => import('./pages/Terms'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PartnerDetail = lazy(() => import('./pages/PartnerDetail'));
const PatientStories = lazy(() => import('./pages/PatientStories'));
const PatientStoryDetail = lazy(() => import('./pages/PatientStoryDetail'));
const NotificationsManagement = lazy(() => import('./pages/admin/NotificationsManagement'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const ConsultationForm = lazy(() => import('./pages/ConsultationForm'));
const DoctorRegistration = lazy(() => import('./pages/DoctorRegistration'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const DoctorProfileEdit = lazy(() => import('./pages/DoctorProfileEdit'));
const DoctorPosts = lazy(() => import('./pages/DoctorPosts'));
const DoctorCreatePost = lazy(() => import('./pages/DoctorCreatePost'));
const PublicLayout = lazy(() => import('./components/layouts/PublicLayout'));
const Diseases = lazy(() => import('./pages/Diseases'));
const DiseaseDetail = lazy(() => import('./pages/DiseaseDetail'));
const TelegramLogin = lazy(() => import('./pages/TelegramLogin'));
const TelegramVerify = lazy(() => import('./pages/TelegramVerify'));
const NotFound = lazy(() => import('./pages/NotFound'));
import './lib/i18n';

// Language Route Wrapper Component
const LanguageRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useLanguageRouting();
  return <>{children}</>;
};

// Scroll to top component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

// Auth Callback Component
const AuthCallback: React.FC = () => {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(3);
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');

        if (!isSupabaseAvailable() || !supabase) {
          console.warn('⚠️ Supabase not available during auth callback');
          setError('Supabase aloqasi mavjud emas. Iltimos keyinroq urinib ko‘ring.');
          setProcessing(false);
          return;
        }

        // Get the session from URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Session error:', error);
          // Mark connection unhealthy if network issues
          if (error.message?.includes('fetch') || error.message?.includes('Network') || error.message?.includes('network')) {
            setSupabaseConnectionHealth(false);
          }
          setError('Session yaratishda xatolik');
          setProcessing(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Session found:', session.user.email);
          
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log('📝 Creating user profile...');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name || 
                          session.user.email?.split('@')[0] || 'User',
                phone: session.user.user_metadata?.phone,
                role: session.user.user_metadata?.role || 'patient',
                avatar_url: session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture
              });
            
            if (insertError) {
              console.error('❌ Profile creation error:', insertError);
            } else {
              console.log('✅ Profile created successfully');
            }
          } else if (profile) {
            console.log('✅ Profile exists:', profile.full_name);
          }
          
          setProcessing(false);
        } else {
          console.log('❌ No session found');
          setError('Session topilmadi');
          setProcessing(false);
        }
      } catch (err) {
        console.error('❌ Auth callback error:', err);
        if (err instanceof Error && (err.message?.includes('fetch') || err.message?.includes('network') || err.name === 'TypeError')) {
          console.log('🚨 Auth callback network error detected, marking Supabase as unhealthy');
          setSupabaseConnectionHealth(false);
        }
        setError('Autentifikatsiya xatoligi');
        setProcessing(false);
      }
    };
    
    handleAuthCallback();
  }, []);
  
  useEffect(() => {
    if (!processing && !error) {
    // Simple countdown and redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    }
  }, [processing, error]);

  if (processing) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold theme-text mb-2">Autentifikatsiya...</h2>
          <p className="theme-text-secondary">
            Hisobingiz tayyorlanmoqda...
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold theme-text mb-2">Xatolik!</h2>
          <p className="theme-text-secondary mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Qaytadan urinish
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen theme-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold theme-text mb-2">Muvaffaqiyatli!</h2>
          <p className="theme-text-secondary mb-4">
            {user ? `Xush kelibsiz, ${user.full_name}!` : 'Tizimga muvaffaqiyatli kirdingiz!'}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted animate-fade-in">
            Bosh sahifaga yo'naltirilmoqda... ({countdown})
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { ready } = useTranslation();
  const { user, loading } = useAuth();

  // Preload critical data on app load
  useEffect(() => {
    preloadCriticalData();
  }, []);

  // Handle auth state changes and redirects
  useEffect(() => {
    let subscription: any | null = null;
    if (isSupabaseAvailable() && supabase) {
      const res = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      });
      subscription = res?.data?.subscription || null;
    } else {
      console.warn('Supabase not available: skipping auth state listener');
    }

    return () => { if (subscription && subscription.unsubscribe) subscription.unsubscribe(); };
  }, []);

  if (!ready || loading) {
    return (
      <div className="min-h-screen theme-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="animate-pulse-slow w-32 h-2 theme-accent-bg opacity-30 rounded mx-auto mb-4"></div>
          <p className="theme-text-muted animate-fade-in">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <LanguageRouteWrapper>
          <Suspense fallback={<div className="min-h-screen theme-bg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="theme-text-muted">Yuklanmoqda...</p></div>}>
            <Routes>
            {/* Auth Callback Route */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin Routes (no language prefix) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="admins" element={<AdminsManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="posts" element={<PostsManagement />} />
              <Route path="doctors" element={<DoctorsManagement />} />
              <Route path="diseases" element={<DiseasesManagement />} />
              <Route path="posts/create" element={<CreatePost />} />
              <Route path="posts/edit/:id" element={<CreatePost />} />
              <Route path="pages" element={<StaticPagesManagement />} />
              <Route path="partners" element={<PartnersManagement />} />
              <Route path="patient-stories" element={<PatientStoriesManagement />} />
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Russian Admin Routes */}
            <Route path="/ru/admin/login" element={<AdminLogin />} />
            <Route path="/ru/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="admins" element={<AdminsManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="posts" element={<PostsManagement />} />
              <Route path="doctors" element={<DoctorsManagement />} />
              <Route path="diseases" element={<DiseasesManagement />} />
              <Route path="posts/create" element={<CreatePost />} />
              <Route path="posts/edit/:id" element={<CreatePost />} />
              <Route path="pages" element={<StaticPagesManagement />} />
              <Route path="partners" element={<PartnersManagement />} />
              <Route path="patient-stories" element={<PatientStoriesManagement />} />
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* English Admin Routes */}
            <Route path="/en/admin/login" element={<AdminLogin />} />
            <Route path="/en/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="admins" element={<AdminsManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="posts" element={<PostsManagement />} />
              <Route path="doctors" element={<DoctorsManagement />} />
              <Route path="diseases" element={<DiseasesManagement />} />
              <Route path="posts/create" element={<CreatePost />} />
              <Route path="posts/edit/:id" element={<CreatePost />} />
              <Route path="pages" element={<StaticPagesManagement />} />
              <Route path="partners" element={<PartnersManagement />} />
              <Route path="patient-stories" element={<PatientStoriesManagement />} />
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Public Routes with Layout */}
            <Route path="/*" element={<PublicLayout />}>
              {/* Uzbek routes (no prefix) */}
              <Route path="" element={<Home />} />
              <Route path="posts" element={<Posts />} />
              <Route path="posts/:slug" element={<PostDetail />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="doctors/:id" element={<DoctorProfile />} />
              <Route path="qa" element={<QA />} />
              <Route path="questions/:slug" element={<QuestionDetail />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="partnership" element={<Partnership />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="consultation" element={<ConsultationForm />} />
              <Route path="profile" element={<Profile />} />
              <Route path="doctor-registration" element={<DoctorRegistration />} />
              <Route path="doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="doctor/profile/edit" element={<DoctorProfileEdit />} />
              <Route path="doctor/posts" element={<DoctorPosts />} />
              <Route path="doctor/posts/create" element={<DoctorCreatePost />} />
              <Route path="doctor/posts/edit/:id" element={<DoctorCreatePost />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="data-security" element={<DataSecurity />} />
              <Route path="terms" element={<Terms />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="partners/:slug" element={<PartnerDetail />} />
              <Route path="patient-stories" element={<PatientStories />} />
              <Route path="patient-stories/:id" element={<PatientStoryDetail />} />
              <Route path="diseases" element={<Diseases />} />
              <Route path="diseases/:slug" element={<DiseaseDetail />} />
              <Route path="telegram-login" element={<TelegramLogin />} />
              <Route path="telegram-verify" element={<TelegramVerify />} />

              {/* Russian routes */}
              <Route path="ru" element={<Home />} />
              <Route path="ru/posts" element={<Posts />} />
              <Route path="ru/posts/:slug" element={<PostDetail />} />
              <Route path="ru/doctors" element={<Doctors />} />
              <Route path="ru/doctors/:id" element={<DoctorProfile />} />
              <Route path="ru/qa" element={<QA />} />
              <Route path="ru/questions/:slug" element={<QuestionDetail />} />
              <Route path="ru/about" element={<About />} />
              <Route path="ru/contact" element={<Contact />} />
              <Route path="ru/partnership" element={<Partnership />} />
              <Route path="ru/login" element={<Login />} />
              <Route path="ru/register" element={<Register />} />
              <Route path="ru/consultation" element={<ConsultationForm />} />
              <Route path="ru/profile" element={<Profile />} />
              <Route path="ru/doctor-registration" element={<DoctorRegistration />} />
              <Route path="ru/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="ru/doctor/profile/edit" element={<DoctorProfileEdit />} />
              <Route path="ru/doctor/posts" element={<DoctorPosts />} />
              <Route path="ru/doctor/posts/create" element={<DoctorCreatePost />} />
              <Route path="ru/doctor/posts/edit/:id" element={<DoctorCreatePost />} />
              <Route path="ru/privacy" element={<Privacy />} />
              <Route path="ru/data-security" element={<DataSecurity />} />
              <Route path="ru/terms" element={<Terms />} />
              <Route path="ru/faq" element={<FAQ />} />
              <Route path="ru/partners/:slug" element={<PartnerDetail />} />
              <Route path="ru/patient-stories" element={<PatientStories />} />
              <Route path="ru/patient-stories/:id" element={<PatientStoryDetail />} />
              <Route path="ru/diseases" element={<Diseases />} />
              <Route path="ru/diseases/:slug" element={<DiseaseDetail />} />
              <Route path="ru/telegram-login" element={<TelegramLogin />} />
              <Route path="ru/telegram-verify" element={<TelegramVerify />} />

              {/* English routes */}
              <Route path="en" element={<Home />} />
              <Route path="en/posts" element={<Posts />} />
              <Route path="en/posts/:slug" element={<PostDetail />} />
              <Route path="en/doctors" element={<Doctors />} />
              <Route path="en/doctors/:id" element={<DoctorProfile />} />
              <Route path="en/qa" element={<QA />} />
              <Route path="en/questions/:slug" element={<QuestionDetail />} />
              <Route path="en/about" element={<About />} />
              <Route path="en/contact" element={<Contact />} />
              <Route path="en/partnership" element={<Partnership />} />
              <Route path="en/login" element={<Login />} />
              <Route path="en/register" element={<Register />} />
              <Route path="en/consultation" element={<ConsultationForm />} />
              <Route path="en/profile" element={<Profile />} />
              <Route path="en/doctor-registration" element={<DoctorRegistration />} />
              <Route path="en/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="en/doctor/profile/edit" element={<DoctorProfileEdit />} />
              <Route path="en/doctor/posts" element={<DoctorPosts />} />
              <Route path="en/doctor/posts/create" element={<DoctorCreatePost />} />
              <Route path="en/doctor/posts/edit/:id" element={<DoctorCreatePost />} />
              <Route path="en/privacy" element={<Privacy />} />
              <Route path="en/data-security" element={<DataSecurity />} />
              <Route path="en/terms" element={<Terms />} />
              <Route path="en/faq" element={<FAQ />} />
              <Route path="en/partners/:slug" element={<PartnerDetail />} />
              <Route path="en/patient-stories" element={<PatientStories />} />
              <Route path="en/patient-stories/:id" element={<PatientStoryDetail />} />
              <Route path="en/diseases" element={<Diseases />} />
              <Route path="en/diseases/:slug" element={<DiseaseDetail />} />
              <Route path="en/telegram-login" element={<TelegramLogin />} />
              <Route path="en/telegram-verify" element={<TelegramVerify />} />

              {/* 404 Not Found - must be last */}
              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </Suspense>
        </LanguageRouteWrapper>
      </Router>
    </HelmetProvider>
  );
}

export default App;
