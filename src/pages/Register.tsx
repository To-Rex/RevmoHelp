import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone,
  ArrowRight, 
  Stethoscope,
  Heart,
  Activity,
  Shield,
  CheckCircle,
  AlertCircle,
  UserPlus,
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
      setError('To\'liq ismingizni kiriting');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email manzilni kiriting');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('To\'g\'ri email manzil kiriting');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmaydi');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('Foydalanish shartlarini qabul qiling');
      return false;
    }
    if (!formData.agreeToPrivacy) {
      setError('Maxfiylik siyosatini qabul qiling');
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
          setError('Bu email bilan allaqachon ro\'yxatdan o\'tilgan');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
        } else {
          setError(error.message);
        }
      } else {
        navigate('/login', { 
          state: { 
            message: 'Ro\'yxatdan o\'tish muvaffaqiyatli! Email orqali tasdiqlang va kirish mumkin.',
            email: formData.email
          }
        });
      }
    } catch (err) {
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
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
        setError('Google orqali ro\'yxatdan o\'tish xatoligi: ' + error.message);
        setIsGoogleLoading(false);
      } else {
        // Don't set loading to false here, let the redirect happen
        console.log('Google sign-up initiated');
      }
    } catch (err) {
      setError('Google orqali ro\'yxatdan o\'tish xatoligi yuz berdi');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg relative overflow-hidden">
      <SEOHead
        title="Ro'yxatdan o'tish"
        description="Revmohelp platformasida ro'yxatdan o'ting. Professional tibbiy ma'lumotlar va shifokor maslahatlari."
        keywords="ro'yxatdan o'tish, register, revmohelp, tibbiy platforma"
        url="https://revmohelp.uz/register"
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
              <span className="text-xl font-bold theme-text group-hover:theme-accent transition-colors duration-300">Revmoinfo</span>
              <span className="text-xl font-bold theme-text group-hover:theme-accent transition-colors duration-300">Revmohelp</span>
            </Link>
            
            <h2 className="text-2xl font-bold theme-text mb-2 animate-slide-up">
              Ro'yxatdan o'ting
            </h2>
            <p className="text-sm theme-text-secondary animate-slide-up delay-100">
              Professional tibbiy platformaga qo'shiling
            </p>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-3 mt-4 animate-zoom-in delay-200">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                step >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 theme-text-muted'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
                step >= 2 ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}></div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                step >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 theme-text-muted'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 animate-zoom-in delay-300 backdrop-blur-sm bg-opacity-95">
            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-4">
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
                    <h3 className="text-base font-semibold theme-text mb-1">Asosiy ma'lumotlar</h3>
                    <p className="text-xs theme-text-secondary">Shaxsiy ma'lumotlaringizni kiriting</p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium theme-text-secondary">
                      To'liq ism
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <User className="h-4 w-4 theme-text-muted group-focus-within:text-primary-500 transition-colors duration-200" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                        placeholder="Ismingiz va familiyangiz"
                      />
                    </div>
                  </div>

                  {/* Email */}
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

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium theme-text-secondary">
                      Telefon raqam (ixtiyoriy)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Phone className="h-4 w-4 theme-text-muted group-focus-within:text-primary-500 transition-colors duration-200" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium theme-text-secondary">
                      Sizning rolingiz
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text"
                    >
                      <option value="patient">Bemor</option>
                      <option value="doctor">Shifokor</option>
                    </select>
                    {formData.role === 'doctor' && (
                      <p className="text-xs theme-text-muted mt-1">
                        Shifokor sifatida ro'yxatdan o'tgandan so'ng professional profil yaratishingiz kerak bo'ladi.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Security & Agreements */}
              {step === 2 && (
                <div className="space-y-4 animate-slide-left">
                  <div className="text-center mb-4">
                    <h3 className="text-base font-semibold theme-text mb-1">Xavfsizlik</h3>
                    <p className="text-xs theme-text-secondary">Parol yarating va shartlarni qabul qiling</p>
                  </div>

                  {/* Password */}
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
                        placeholder="Kamida 6 ta belgi"
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

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium theme-text-secondary">
                      Parolni tasdiqlang
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Lock className="h-4 w-4 theme-text-muted group-focus-within:text-primary-500 transition-colors duration-200" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-10 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                        placeholder="Parolni qaytaring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center theme-text-muted hover:theme-accent transition-colors duration-200 z-10"
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
                        className="w-3 h-3 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-1 transition-all duration-200"
                      />
                      <span className="text-xs theme-text-secondary group-hover:theme-accent transition-colors duration-200">
                        <Link to="/terms" className="theme-accent hover:underline">Foydalanish shartlari</Link>ni qabul qilaman
                      </span>
                    </label>
                    
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="agreeToPrivacy"
                        checked={formData.agreeToPrivacy}
                        onChange={handleInputChange}
                        className="w-3 h-3 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-1 transition-all duration-200"
                      />
                      <span className="text-xs theme-text-secondary group-hover:theme-accent transition-colors duration-200">
                        <Link to="/privacy" className="theme-accent hover:underline">Maxfiylik siyosati</Link>ni qabul qilaman
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
                    className="flex-1 py-3 px-4 border-2 theme-border text-sm font-medium rounded-lg theme-text-secondary hover:theme-bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105"
                  >
                    Orqaga
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative ${step === 2 ? 'flex-1' : 'w-full'} flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Ro'yxatdan o'tilmoqda...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{step === 1 ? 'Davom etish' : "Ro'yxatdan o'tish"}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  )}
                </button>
              </div>
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

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
                    Google bilan ro'yxatdan o'tish
                  </span>
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="mt-4 text-center">
              <p className="theme-text-secondary">
                Hisobingiz bormi?{' '}
                <Link
                  to="/login"
                  className="theme-accent hover:text-primary-700 text-sm font-medium transition-colors duration-200 hover:underline"
                >
                  Kirish
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

export default Register;