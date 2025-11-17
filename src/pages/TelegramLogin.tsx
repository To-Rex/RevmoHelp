import React from 'react';
import { ArrowRight, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

const TelegramLogin: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const phone = formData.get('phone') as string;
    const sanitizedPhone = phone.replace(/\s/g, '');

    try {
      const response = await fetch('https://revmohelp.up.railway.app/auth/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: sanitizedPhone }),
      });

      const data = await response.json();

      console.log('Response status:', response.status, response.statusText);
      console.log('Response data:', data);

      if (response.ok && data.session_id && data.telegram_url) {
        navigate('/telegram-verify', { state: { session_id: data.session_id, telegram_url: data.telegram_url, phone: sanitizedPhone } });
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen theme-bg relative overflow-hidden">
      <SEOHead
        title="Telegram Login"
        description="Login with your Telegram account"
        keywords="telegram, login, authentication"
        url="https://revmohelp.uz/telegram-login"
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
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse-medical">
                  <Smartphone size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold theme-text">{t('telegramLogin.header')}</span>
              </div>

              <h2 className="text-2xl font-bold theme-text mb-2 animate-slide-up">
                {t('telegramLogin.title')}
              </h2>
              <p className="text-sm theme-text-secondary animate-slide-up delay-100">
                {t('telegramLogin.description')}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('telegramLogin.phoneLabel')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder={t('telegramLogin.phonePlaceholder')}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>{t('telegramLogin.continueButton')}</span>
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramLogin;