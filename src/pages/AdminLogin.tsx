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


  return (
    <div className="min-h-screen bg-white dark:bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden">

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse-medical relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl blur-lg opacity-50"></div>
            <Shield size={36} className="text-white relative z-10" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">Admin Panel</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Boshqaruv paneliga kirish</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 animate-zoom-in relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
          <div className="relative z-10">
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


            {/* Login Field */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Login
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 shadow-sm hover:shadow-md"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Parol
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 hover:from-blue-700 hover:via-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
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
        </div>

        {/* Back to Site */}
        <div className="text-center animate-fade-in delay-300">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm underline hover:no-underline font-medium"
          >
            ← Asosiy saytga qaytish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;