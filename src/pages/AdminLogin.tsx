import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield,
  AlertCircle,
  Settings,
  CheckCircle
} from 'lucide-react';
import { adminLogin } from '../lib/adminAuth';
import { useAdminAuth } from '../hooks/useAdminAuth';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Already authenticated, redirecting to admin panel');
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 Admin login form submitted');
    
    if (!formData.login.trim()) {
      setError('Login kiritilishi shart');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Parol kiritilishi shart');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔄 Attempting admin login...');
      const { data, error } = await adminLogin(formData.login, formData.password);
      
      if (error) {
        console.log('❌ Login failed:', error.message);
        setError(error.message);
      } else if (data) {
        console.log('✅ Login successful, redirecting...');
        setSuccess('Muvaffaqiyatli kirildi! Admin panelga yo\'naltirilmoqda...');
        login(data);
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        setError('Noma\'lum xatolik yuz berdi');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Tizimda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      login: 'admin',
      password: 'admin123'
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen theme-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-medical">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold theme-text mb-2">Admin Panel</h2>
          <p className="theme-text-secondary">Boshqaruv paneliga kirish</p>
        </div>

        {/* Login Form */}
        <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8 animate-zoom-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-slide-down">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Settings size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Demo hisoblar:</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs underline"
                >
                  To'ldirish
                </button>
              </div>
              <div className="text-blue-600 dark:text-blue-400 text-sm space-y-1">
                <div>Admin: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">admin</code> / <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">admin123</code></div>
                <div>Moderator: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">moderator</code> / <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">moderator123</code></div>
              </div>
            </div>

            {/* Login Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium theme-text-secondary">
                Login
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 theme-text-muted group-focus-within:theme-accent transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium theme-text-secondary">
                Parol
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 theme-text-muted group-focus-within:theme-accent transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-12 py-4 theme-border border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 theme-bg theme-text placeholder-gray-400"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center theme-text-muted hover:theme-accent transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Kirilmoqda...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Admin panelga kirish</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Back to Site */}
        <div className="text-center animate-fade-in delay-300">
          <button
            onClick={() => navigate('/')}
            className="theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm underline"
          >
            ← Asosiy saytga qaytish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;