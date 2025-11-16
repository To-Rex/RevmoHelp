import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
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
          setError(t('loginPage.oauthFailed'));
          break;
        case 'session_failed':
          setError(t('loginPage.sessionFailed'));
          break;
        case 'no_session':
          setError(t('loginPage.noSession'));
          break;
        case 'no_tokens':
          setError(t('loginPage.noTokens'));
          break;
        case 'callback_error':
          setError(t('loginPage.callbackError'));
          break;
        default:
          setError(t('loginPage.generalError'));
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
  }, [location.state, location.search, t]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(t('loginPage.oauthFailed') + ': ' + error.message);
        setIsGoogleLoading(false);
      } else {
        // Don't set loading to false here, let the redirect happen
        console.log('Google sign-in initiated');
      }
    } catch (err) {
      setError(t('loginPage.oauthFailed'));
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
          setError(t('loginPage.emailNotConfirmed'));
          setShowResendButton(true);
        } else if (error.message.includes('Invalid login credentials')) {
          setError(t('loginPage.invalidCredentials'));
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
        setError(t('loginPage.generalError') + ': ' + error.message);
      } else {
        setResendSuccess(true);
        setShowResendButton(false);
        setError('');
      }
    } catch (err) {
      setError(t('loginPage.generalError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg relative overflow-hidden">
      <SEOHead
        title={t('loginPage.seoTitle')}
        description={t('loginPage.seoDescription')}
        keywords={t('loginPage.seoKeywords')}
        url="https://revmohelp.uz/login"
      />

      {/* Hero Background - Same as Homepage */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main Background with Theme Support */}
        <div className="absolute inset-0 theme-bg"></div>
        
        {/* Animated Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large Geometric Shapes */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 opacity-20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-200 opacity-15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
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
        <div className="max-w-sm w-full space-y-4">
          {/* Login Card */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-6 animate-zoom-in delay-200" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            {/* Header */}
            <div className="text-center animate-fade-in mb-6">
              <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
                <img src="/logo.png" alt="Revmohelp Logo" className="w-10 h-10 rounded-xl animate-pulse-medical group-hover:animate-heartbeat transition-all duration-300 transform group-hover:scale-110" />
                <span className="text-xl font-bold theme-text group-hover:theme-accent transition-colors duration-300">Revmohelp</span>
              </Link>

              <h2 className="text-2xl font-bold theme-text mb-2 animate-slide-up">
                {t('loginPage.welcome')}
              </h2>
              <p className="text-sm theme-text-secondary animate-slide-up delay-100">
                {t('loginPage.subtitle')}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('loginPage.title')}</h2>
              </div>
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
                    {t('loginPage.resendSuccess')}
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
                      <span>{t('loginPage.resending')}</span>
                    </div>
                  ) : (
                    t('loginPage.resendEmail')
                  )}
                </button>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('loginPage.emailLabel')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                  placeholder="email@example.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('loginPage.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-all duration-200"
                  />
                  <span className="text-sm text-gray-700">
                    {t('loginPage.rememberMe')}
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                >
                  {t('loginPage.forgotPassword')}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('loginPage.loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('loginPage.loginButton')}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('loginPage.or')}</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border-4 border-blue-500 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-gray-700 text-sm">{t('loginPage.connectingGoogle')}</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm group-hover:text-blue-600 transition-colors duration-200">
                    {t('loginPage.googleSignIn')}
                  </span>
                </>
              )}
            </button>
            {/* Telegram Sign In */}
            <button
              type="button"
              onClick={() => navigate('/telegram-login')}
              className="mt-4 w-full flex items-center justify-center space-x-2 py-2 px-4 border-4 border-blue-400 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-all duration-300 group"
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0088cc">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <span className="text-gray-700 text-sm group-hover:text-blue-600 transition-colors duration-200">
                Login with Telegram
              </span>
            </button>

            {/* Register Link */}
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                {t('loginPage.noAccount')}{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:underline"
                >
                  {t('loginPage.register')}
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 opacity-70 animate-fade-in delay-500 pb-6">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Shield size={14} className="animate-pulse-medical" />
              <span className="text-xs font-medium">{t('loginPage.secure')}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Heart size={14} className="animate-heartbeat" />
              <span className="text-xs font-medium">{t('loginPage.trusted')}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Activity size={14} className="animate-pulse" />
              <span className="text-xs font-medium">{t('loginPage.professional')}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;