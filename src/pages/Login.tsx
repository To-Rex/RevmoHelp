import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Stethoscope,
  Heart,
  Activity,
  Shield,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { signInWithEmail, resendConfirmationEmail, signInWithGoogle } from '../lib/supabase';
import { useEffect } from 'react';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(location.search);
    const oauthError = urlParams.get('error');
    
    if (oauthError) {
      console.log('🚨 OAuth error detected:', oauthError);
      switch (oauthError) {
        case 'oauth_failed':
          setError('Google orqali kirish muvaffaqiyatsiz tugadi');
          break;
        case 'session_failed':
          setError('Session yaratishda xatolik yuz berdi');
          break;
        case 'no_session':
          setError('Session yaratilmadi');
          break;
        case 'no_tokens':
          setError('OAuth tokens topilmadi');
          break;
        case 'callback_error':
          setError('Callback xatoligi yuz berdi');
          break;
        default:
          setError('OAuth xatoligi: ' + oauthError);
      }
      // Clear error from URL
      window.history.replaceState({}, document.title, '/login');
    }
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
  }, [location.state, location.search]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError('Google orqali kirish xatoligi: ' + error.message);
        setIsGoogleLoading(false);
      } else {
        // Don't set loading to false here, let the redirect happen
        console.log('Google sign-in initiated');
      }
    } catch (err) {
      setError('Google orqali kirish xatoligi yuz berdi');
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
    if (resendSuccess) setResendSuccess(false);
    if (showResendButton) setShowResendButton(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signInWithEmail(formData.email, formData.password);
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Email tasdiqlanmagan. Iltimos, emailingizni tekshiring yoki qayta yuborish tugmasini bosing.');
          setShowResendButton(true);
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Email yoki parol noto\'g\'ri');
        } else {
          setError(error.message);
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await resendConfirmationEmail(formData.email);
      
      if (error) {
        setError('Tasdiqlash emailini yuborishda xatolik: ' + error.message);
      } else {
        setResendSuccess(true);
        setShowResendButton(false);
        setError('');
      }
    } catch (err) {
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg relative overflow-hidden">
      <SEOHead
        title="Kirish"
        description="Revmohelp platformasiga kirish. Professional tibbiy ma'lumotlar va shifokor maslahatlari."
        keywords="kirish, login, revmohelp, tibbiy platforma"
        url="https://revmohelp.uz/login"
      />

      {/* Hero Background - Same as Homepage */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main Background with Theme Support */}
        <div className="absolute inset-0 theme-bg"></div>
        
        {/* Animated Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large Geometric Shapes */}
          <div className="absolute -top-40 -right-40 w-80 h-80 theme-gradient opacity-20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 theme-gradient-secondary opacity-15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-200 opacity-10 rounded-full blur-2xl animate-pulse-slow"></div>
          
          {/* Medical Icons - Subtle and Professional */}
          <div className="absolute top-50 right-20 opacity-10">
            <Stethoscope size={48} className="theme-accent animate-float" />
          </div>
          <div className="absolute bottom-20 left-20 opacity-10">
            <Heart size={40} className="text-red-500 animate-pulse-slow" />
          </div>
          <div className="absolute top-1/3 left-16 opacity-8">
            <Activity size={36} className="theme-accent-secondary animate-float" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute bottom-1/3 right-16 opacity-8">
            <Shield size={32} className="text-green-600 animate-float" style={{ animationDelay: '3s' }} />
          </div>
          
          {/* Additional Medical Elements */}
          <div className="absolute top-1/4 right-1/4 opacity-15">
            <Users size={28} className="text-blue-500 animate-float" style={{ animationDelay: '4s' }} />
          </div>
          <div className="absolute bottom-1/4 left-1/4 opacity-12">
            <BookOpen size={32} className="text-teal-500 animate-float" style={{ animationDelay: '2.5s' }} />
          </div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, var(--accent-primary) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-6">
          {/* Header */}
          <div className="text-center animate-fade-in mb-6">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center animate-pulse-medical group-hover:animate-heartbeat transition-all duration-300 transform group-hover:scale-110">
                <Stethoscope size={20} className="text-white animate-stethoscope" />
              </div>
              <span className="text-xl font-bold theme-text group-hover:theme-accent transition-colors duration-300">Revmoinfo</span>
              <span className="text-xl font-bold theme-text group-hover:theme-accent transition-colors duration-300">Revmohelp</span>
            </Link>
            
            <h2 className="text-2xl font-bold theme-text mb-2 animate-slide-up">
              Xush kelibsiz!
            </h2>
            <p className="text-sm theme-text-secondary animate-slide-up delay-100">
              Hisobingizga kirish uchun ma'lumotlaringizni kiriting
            </p>
          </div>

          {/* Login Form */}
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 animate-zoom-in delay-200 backdrop-blur-sm bg-opacity-95">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-slide-down">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 text-xs">{successMessage}</span>
                </div>
              )}

              {/* Resend Success Message */}
              {resendSuccess && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-slide-down">
                  <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300 text-xs">
                    Tasdiqlash emaili yuborildi! Iltimos, emailingizni tekshiring.
                  </span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-shake">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 text-xs">{error}</span>
                </div>
              )}

              {/* Resend Email Button */}
              {showResendButton && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-3 border border-blue-300 dark:border-blue-600 text-xs font-medium rounded-lg text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      <span>Yuborilmoqda...</span>
                    </div>
                  ) : (
                    'Tasdiqlash emailini qayta yuborish'
                  )}
                </button>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label className="block text-xs font-medium theme-text-secondary">
                  Email manzil
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-4 w-4 theme-text-muted group-focus-within:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-medium theme-text-secondary">
                  Parol
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 theme-text-muted group-focus-within:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-10 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center theme-text-muted hover:theme-accent transition-colors duration-200 z-10"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                  />
                  <span className="text-xs theme-text-secondary group-hover:theme-accent transition-colors duration-200">
                    Meni eslab qol
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs theme-accent hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Kirilmoqda...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Kirish</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t theme-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 theme-bg theme-text-muted">yoki</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 theme-border rounded-lg hover:theme-bg-tertiary transition-all duration-300 transform hover:scale-105 hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGoogleLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="theme-text text-sm">Google'ga ulanmoqda...</span>
                </div>
              ) : (
                <>
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="theme-text text-sm group-hover:theme-accent transition-colors duration-200">
                    Google bilan kirish
                  </span>
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="mt-4 text-center">
              <p className="theme-text-secondary">
                Hisobingiz yo'qmi?{' '}
                <Link
                  to="/register"
                  className="theme-accent hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200 hover:underline"
                >
                  Ro'yxatdan o'ting
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 opacity-70 animate-fade-in delay-500 pb-8">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Shield size={14} className="animate-pulse-medical" />
              <span className="text-xs font-medium">Xavfsiz</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Heart size={14} className="animate-heartbeat" />
              <span className="text-xs font-medium">Ishonchli</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Activity size={14} className="animate-pulse" />
              <span className="text-xs font-medium">Professional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;