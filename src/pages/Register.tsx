import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Stethoscope,
  Heart,
  Activity,
  Shield,
  AlertCircle,
  Users,
  BookOpen
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import { signUpWithEmail, signInWithGoogle } from '../lib/supabase';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError(t('registerPage.errorFullNameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t('registerPage.errorEmailRequired'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t('registerPage.errorEmailInvalid'));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.password.length < 6) {
      setError(t('registerPage.errorPasswordLength'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('registerPage.errorPasswordMismatch'));
      return false;
    }
    if (!formData.agreeToTerms) {
      setError(t('registerPage.errorAgreeTerms'));
      return false;
    }
    if (!formData.agreeToPrivacy) {
      setError(t('registerPage.errorAgreePrivacy'));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');

    try {
      const { error } = await signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.fullName,
        {
          phone: formData.phone,
          role: formData.role
        }
      );
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError(t('registerPage.errorUserExists'));
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setError(t('registerPage.errorPasswordLength'));
        } else {
          setError(error.message);
        }
      } else {
        navigate('/login', { 
          state: { 
            message: t('registerPage.successMessage'),
            email: formData.email
          }
        });
      }
    } catch (err) {
      setError(t('registerPage.errorGeneral'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(t('registerPage.errorGoogleSignUp') + ': ' + error.message);
        setIsGoogleLoading(false);
      } else {
        // Don't set loading to false here, let the redirect happen
        console.log('Google sign-up initiated');
      }
    } catch (err) {
      setError(t('registerPage.errorGoogleSignUp'));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg relative overflow-hidden">
      <SEOHead
        title={t('registerPage.seoTitle')}
        description={t('registerPage.seoDescription')}
        keywords={t('registerPage.seoKeywords')}
        url="https://revmohelp.uz/register"
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
          <div className="absolute top-20 right-20 opacity-10">
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-sm w-full space-y-6">
          {/* Header */}
          <div className="text-center animate-fade-in mb-6">
            <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl flex items-center justify-center animate-pulse-medical group-hover:animate-heartbeat transition-all duration-300 transform group-hover:scale-110">
                <Stethoscope size={20} className="text-white animate-stethoscope" />
              </div>
              <span className="text-xl font-bold theme-text group-hover:theme-accent transition-colors duration-300">Revmohelp</span>
            </Link>
            
            <h2 className="text-2xl font-bold theme-text mb-2 animate-slide-up">
              {t('registerPage.title')}
            </h2>
            <p className="text-sm theme-text-secondary animate-slide-up delay-100">
              {t('registerPage.subtitle')}
            </p>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-3 mt-4 animate-zoom-in delay-200">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-blue-200 theme-text-muted'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
                step >= 2 ? 'bg-blue-600' : 'bg-blue-200'
              }`}></div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-blue-200 theme-text-muted'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-6 animate-zoom-in delay-300" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-3">
              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-shake">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 text-xs">{error}</span>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-4 animate-slide-right">
                  <div className="text-center mb-4">
                    <h3 className="text-base font-semibold theme-text mb-1">{t('registerPage.step1Title')}</h3>
                    <p className="text-xs theme-text-secondary">{t('registerPage.step1Subtitle')}</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registerPage.fullNameLabel')}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                      placeholder={t('registerPage.fullNamePlaceholder')}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registerPage.emailLabel')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                      placeholder={t('registerPage.emailPlaceholder')}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registerPage.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                      placeholder={t('registerPage.phonePlaceholder')}
                    />
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registerPage.roleLabel')}
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="patient">{t('registerPage.rolePatient')}</option>
                      <option value="doctor">{t('registerPage.roleDoctor')}</option>
                    </select>
                    {formData.role === 'doctor' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t('registerPage.doctorNote')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Security & Agreements */}
              {step === 2 && (
                <div className="space-y-4 animate-slide-left">
                  <div className="text-center mb-4">
                    <h3 className="text-base font-semibold theme-text mb-1">{t('registerPage.step2Title')}</h3>
                    <p className="text-xs theme-text-secondary">{t('registerPage.step2Subtitle')}</p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registerPage.passwordLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 pr-10"
                        placeholder={t('registerPage.passwordPlaceholder')}
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registerPage.confirmPasswordLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-200 pr-10"
                        placeholder={t('registerPage.confirmPasswordPlaceholder')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-all duration-200"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                        <Link to="/terms" className="text-blue-600 hover:underline">{t('termsOfUse')}</Link> {t('registerPage.agreeToTerms')}
                      </span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="agreeToPrivacy"
                        checked={formData.agreeToPrivacy}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-all duration-200"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                        <Link to="/privacy" className="text-blue-600 hover:underline">{t('privacyPolicy')}</Link> {t('registerPage.agreeToPrivacy')}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-2 px-4 border-2 theme-border text-sm font-medium rounded-lg theme-text-secondary hover:theme-bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105"
                  >
                    {t('registerPage.backButton')}
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative ${step === 2 ? 'flex-1' : 'w-full'} flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t('registerPage.registering')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{step === 1 ? t('registerPage.nextButton') : t('registerPage.registerButton')}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t theme-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 theme-bg theme-text-muted">{t('registerPage.or')}</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border-2 border-blue-300 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="theme-text text-sm">{t('registerPage.connectingGoogle')}</span>
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
                    {t('registerPage.googleSignUp')}
                  </span>
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                {t('registerPage.haveAccount')}{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:underline"
                >
                  {t('registerPage.loginLink')}
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 opacity-70 animate-fade-in delay-500 pb-6">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Shield size={14} className="animate-pulse-medical" />
              <span className="text-xs font-medium">{t('registerPage.secure')}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Heart size={14} className="animate-heartbeat" />
              <span className="text-xs font-medium">{t('registerPage.trusted')}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Activity size={14} className="animate-pulse" />
              <span className="text-xs font-medium">{t('registerPage.professional')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;