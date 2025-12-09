import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import SEOHead from '../components/common/SEOHead';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = [
    {
      to: '/',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: t('home', 'Bosh sahifa'),
      description: t('notFound.homeDesc', 'Asosiy sahifaga qayting'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      to: '/doctors',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: t('doctors', 'Shifokorlar'),
      description: t('notFound.doctorsDesc', 'Professional shifokorlarni toping'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      to: '/posts',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      title: t('posts', 'Maqolalar'),
      description: t('notFound.postsDesc', 'Foydali maqolalarni o\'qing'),
      color: 'from-purple-500 to-violet-500'
    },
    {
      to: '/qa',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('qa', 'Savol-javob'),
      description: t('notFound.qaDesc', 'Savollaringizga javob toping'),
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      <SEOHead
        title={t('notFound.title', 'Sahifa topilmadi')}
        description={t('notFound.description', 'Kechirasiz, siz qidirgan sahifa mavjud emas.')}
        keywords="404, sahifa topilmadi, xatolik"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#BEE9E8] via-[#CAE9FF] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-gradient-shift"></div>

        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-float-1"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-lg animate-float-2 rotate-45"></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full animate-float-3"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-lg animate-float-4 -rotate-12"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full animate-float-5"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className={`text-center max-w-6xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* 404 Number */}
          <div className={`mb-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-[#62B6CB] via-[#5FA8D3] to-[#1B4965] bg-clip-text text-transparent animate-pulse-slow mb-4">
              404
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-[#62B6CB] to-[#5FA8D3] mx-auto rounded-full animate-pulse"></div>
          </div>

          {/* Error Message */}
          <div className={`mb-12 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl md:text-6xl font-bold theme-text mb-6">
              {t('notFound.title', 'Sahifa topilmadi')}
            </h1>
            <p className="text-xl md:text-2xl theme-text-secondary leading-relaxed max-w-3xl mx-auto">
              {t('notFound.description', 'Kechirasiz, siz qidirgan sahifa mavjud emas yoki o\'chirilgan bo\'lishi mumkin.')}
            </p>
          </div>

          {/* Navigation Grid */}
          <div className={`mb-12 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in`}
                  style={{ animationDelay: `${900 + index * 200}ms` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold theme-text mb-2 group-hover:text-[#62B6CB] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm theme-text-secondary leading-relaxed">
                    {item.description}
                  </p>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#62B6CB]/5 to-[#5FA8D3]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className={`transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#62B6CB] to-[#5FA8D3] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold theme-text mb-4">
                {t('notFound.help', 'Yordam kerakmi?')}
              </h3>
              <p className="theme-text-secondary mb-6 leading-relaxed">
                {t('notFound.helpDesc', 'Bizning jamoamiz sizga yordam berishga tayyor')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-[#62B6CB] to-[#5FA8D3] hover:from-[#5FA8D3] hover:to-[#1B4965] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('notFound.contactUs', 'Biz bilan bog\'laning')}
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-[#62B6CB] text-[#62B6CB] hover:bg-[#62B6CB] hover:text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('notFound.backToHome', 'Bosh sahifaga')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-15px) rotate(225deg); }
        }

        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.1); }
        }

        @keyframes float-4 {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-18px) rotate(348deg); }
        }

        @keyframes float-5 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-10px) translateX(10px); }
          66% { transform: translateY(5px) translateX(-5px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-gradient-shift {
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }

        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 8s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 7s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 9s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 5s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>
    </>
  );
};

export default NotFound;