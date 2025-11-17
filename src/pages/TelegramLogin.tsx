import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

const countries = [
  { name: 'Algeria', code: 'DZ', dialCode: '+213' },
  { name: 'Argentina', code: 'AR', dialCode: '+54' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Austria', code: 'AT', dialCode: '+43' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880' },
  { name: 'Belarus', code: 'BY', dialCode: '+375' },
  { name: 'Belgium', code: 'BE', dialCode: '+32' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591' },
  { name: 'Brazil', code: 'BR', dialCode: '+55' },
  { name: 'Cambodia', code: 'KH', dialCode: '+855' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Chile', code: 'CL', dialCode: '+56' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'Colombia', code: 'CO', dialCode: '+57' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506' },
  { name: 'Denmark', code: 'DK', dialCode: '+45' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593' },
  { name: 'Egypt', code: 'EG', dialCode: '+20' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251' },
  { name: 'Fiji', code: 'FJ', dialCode: '+679' },
  { name: 'Finland', code: 'FI', dialCode: '+358' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'Ghana', code: 'GH', dialCode: '+233' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62' },
  { name: 'Iran', code: 'IR', dialCode: '+98' },
  { name: 'Ireland', code: 'IE', dialCode: '+353' },
  { name: 'Israel', code: 'IL', dialCode: '+972' },
  { name: 'Italy', code: 'IT', dialCode: '+39' },
  { name: 'Ivory Coast', code: 'CI', dialCode: '+225' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'Jordan', code: 'JO', dialCode: '+962' },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7' },
  { name: 'Kyrgyzstan', code: 'KG', dialCode: '+996' },
  { name: 'Tajikistan', code: 'TJ', dialCode: '+992' },
  { name: 'Turkmenistan', code: 'TM', dialCode: '+993' },
  { name: 'Kenya', code: 'KE', dialCode: '+254' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60' },
  { name: 'Mexico', code: 'MX', dialCode: '+52' },
  { name: 'Morocco', code: 'MA', dialCode: '+212' },
  { name: 'Nepal', code: 'NP', dialCode: '+977' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234' },
  { name: 'Norway', code: 'NO', dialCode: '+47' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92' },
  { name: 'Panama', code: 'PA', dialCode: '+507' },
  { name: 'Papua New Guinea', code: 'PG', dialCode: '+675' },
  { name: 'Peru', code: 'PE', dialCode: '+51' },
  { name: 'Philippines', code: 'PH', dialCode: '+63' },
  { name: 'Poland', code: 'PL', dialCode: '+48' },
  { name: 'Portugal', code: 'PT', dialCode: '+351' },
  { name: 'Russia', code: 'RU', dialCode: '+7' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966' },
  { name: 'Singapore', code: 'SG', dialCode: '+65' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'South Korea', code: 'KR', dialCode: '+82' },
  { name: 'Spain', code: 'ES', dialCode: '+34' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94' },
  { name: 'Sweden', code: 'SE', dialCode: '+46' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255' },
  { name: 'Thailand', code: 'TH', dialCode: '+66' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216' },
  { name: 'Turkey', code: 'TR', dialCode: '+90' },
  { name: 'UAE', code: 'AE', dialCode: '+971' },
  { name: 'Uganda', code: 'UG', dialCode: '+256' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598' },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84' },
];
// Phone number formatting functions
const formatUzbekistan = (number: string) => {
  const digits = number.replace(/\D/g, '');
  let formatted = '';
  for (let i = 0; i < digits.length && i < 9; i++) {
    if (i === 2 || i === 5 || i === 7) formatted += ' ';
    formatted += digits[i];
  }
  return formatted;
};

const formatDefault = (number: string) => {
  const digits = number.replace(/\D/g, '');
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
};

const TelegramLogin: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedCountry, setSelectedCountry] = useState('+998');
  const [phone, setPhone] = useState('+998');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize input: allow only one '+' at the beginning, followed by digits only
    let sanitized = value.replace(/[^+\d]/g, ''); // Remove invalid characters
    if (sanitized.includes('+')) {
      const firstPlusIndex = sanitized.indexOf('+');
      if (firstPlusIndex > 0) {
        // Move '+' to the front and remove any additional '+'
        sanitized = '+' + sanitized.replace(/\+/g, '');
      } else {
        // '+' is at the start, remove any additional '+'
        sanitized = '+' + sanitized.slice(1).replace(/\+/g, '');
      }
    } else {
      // No '+', ensure only digits
      sanitized = sanitized.replace(/\+/g, '');
    }
    let formatted = sanitized;
    if (sanitized.trim() === '') {
      setSelectedCountry('');
      setPhone('');
      return;
    }
    if (sanitized.startsWith('+')) {
      const matchedCountry = countries.find(country => sanitized.startsWith(country.dialCode));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry.dialCode);
        const dialCode = matchedCountry.dialCode;
        const numberPart = sanitized.slice(dialCode.length);
        let formattedNumber = '';
        if (dialCode === '+998') {
          formattedNumber = formatUzbekistan(numberPart);
        } else {
          formattedNumber = formatDefault(numberPart);
        }
        formatted = dialCode + (formattedNumber ? ' ' + formattedNumber : '');
      }
    }
    setPhone(formatted);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedPhone = phone.replace(/\s/g, '');
    let fullPhone = sanitizedPhone;
    if (!sanitizedPhone.startsWith('+')) {
      fullPhone = selectedCountry + sanitizedPhone;
    }

    try {
      const response = await fetch('https://revmohelp.up.railway.app/auth/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();

      console.log('Response status:', response.status, response.statusText);
      console.log('Response data:', data);

      if (response.ok && data.session_id && data.telegram_url) {
        navigate('/telegram-verify', { state: { session_id: data.session_id, telegram_url: data.telegram_url, phone: fullPhone } });
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full">
          {/* Login Card */}
          <div className="bg-white rounded-3xl theme-shadow-lg theme-border border p-6 animate-zoom-in delay-200" style={{ boxShadow: '0 -2px 4px -1px rgba(0, 0, 0, 0.03), 0 -6px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            {/* Header */}
            <div className="text-center animate-fade-in mb-6">
              <div className="flex flex-col items-center space-y-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse-medical">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
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
              {/* Country Code Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('telegramLogin.countryCodeLabel')}
                </label>
                <select
                  name="countryCode"
                  required
                  className="w-full px-3 py-2 h-10 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  <option value="" disabled>{t('telegramLogin.selectCountry')}</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.dialCode}>
                      {country.name} ({country.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('telegramLogin.phoneNumberLabel')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 py-2 h-10 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  value={phone}
                  onChange={handlePhoneChange}
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

        {/* Back Button */}
        <div className="max-w-sm w-full mt-4 text-center">
          <div className="text-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span>{t('telegramLogin.backButton')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramLogin;