import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, CheckCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

const TelegramVerify: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sessionId = location.state?.session_id;
  const telegramUrl = location.state?.telegram_url;

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage('Session ID not found. Please go back and try logging in again.');
    }
  }, [sessionId]);

  const verifyOtp = async (otp: string) => {
    if (!sessionId) {
      setErrorMessage('Session ID not found. Please try logging in again.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('https://revmohelp.up.railway.app/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          session_id: sessionId,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Verification successful!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.every(digit => digit !== '')) {
      const otp = code.join('');
      console.log('Verification code:', otp);
      verifyOtp(otp);
    }
  }, [code]);

  return (
    <div className="min-h-screen theme-bg relative overflow-hidden">
      <SEOHead
        title="Telegram Verification"
        description="Verify your Telegram account with a 6-digit code"
        keywords="telegram, verification, code, authentication"
        url="https://revmohelp.uz/telegram-verify"
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
          {/* Verification Card */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-6 animate-zoom-in delay-200" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            {/* Header */}
            <div className="text-center animate-fade-in mb-6">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center animate-pulse-medical">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold theme-text">{t('telegramVerify.header')}</span>
              </div>

              <h2 className="text-2xl font-bold theme-text mb-2 animate-slide-up">
                {t('telegramVerify.title')}
              </h2>
              <p className="text-sm theme-text-secondary animate-slide-up delay-100">
                {t('telegramVerify.description')}
              </p>
            </div>

            {/* Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('telegramVerify.codeLabel')}
              </label>
              <div className="flex space-x-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    pattern="[0-9]"
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d$/.test(value) || value === '') {
                        const newCode = [...code];
                        newCode[index] = value;
                        setCode(newCode);
                        if (value && index < 5) inputRefs.current[index + 1]?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const paste = e.clipboardData.getData('text');
                      const digits = paste.replace(/\D/g, '').slice(0, 6);
                      const newCode = [...code];
                      for (let i = 0; i < digits.length; i++) {
                        newCode[i] = digits[i];
                      }
                      setCode(newCode);
                      if (digits.length > 0) {
                        const nextIndex = Math.min(digits.length - 1, 5);
                        inputRefs.current[nextIndex]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !code[index] && index > 0) {
                        inputRefs.current[index - 1]?.focus();
                      }
                    }}
                    className="w-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 text-center"
                    placeholder="0"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Open Bot Card */}
              {telegramUrl && (
                <div className="mt-4">
                  <div
                    onClick={() => window.open(telegramUrl, '_blank')}
                    className="w-full border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.894 9.072l-1.894 8.928c-.144.672-.534.836-1.076.522l-2.988-2.204-1.442 1.386c-.16.16-.294.294-.604.294l.214-3.034 5.546-5.004c.24-.214-.052-.334-.372-.12L11.77 16.686l-3.008-.936c-.652-.204-.666-.652.136-.964l11.764-4.528c.544-.196.1020-.29.1020-.29z" fill="#0088cc"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{t('telegramVerify.openBotButton')}</h3>
                        <p className="text-sm text-gray-600">{t('telegramVerify.openBotDescription')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {loading && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700 text-sm">Verifying code...</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-green-700 text-sm">{successMessage}</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-700 text-sm">{errorMessage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramVerify;