import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, Stethoscope, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LanguageSelector from './LanguageSelector';
import LanguageAwareLink from './LanguageAwareLink';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActivePage = (path: string) => {
    const withPrefix = (i18n.language === 'ru' || i18n.language === 'en') ? `/${i18n.language}${path}` : path;
    return location.pathname === withPrefix;
  };

  return (
    <header className="theme-bg theme-shadow theme-border border-b sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <LanguageAwareLink to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold theme-text group-hover:theme-accent transition-colors duration-300">
              Revmohelp
            </span>
          </LanguageAwareLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageAwareLink
              to="/"
              className={`transition-all duration-300 font-medium px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                isActivePage('/') 
                  ? 'text-white bg-[#90978C]' 
                  : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
              }`}
            >
              {t('home')}
            </LanguageAwareLink>
            <LanguageAwareLink
              to="/posts"
              className={`transition-all duration-300 font-medium px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                isActivePage('/posts') 
                  ? 'text-white bg-[#90978C]' 
                  : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
              }`}
            >
              {t('posts')}
            </LanguageAwareLink>
            <LanguageAwareLink
              to="/doctors"
              className={`transition-all duration-300 font-medium px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                isActivePage('/doctors') 
                  ? 'text-white bg-[#90978C]' 
                  : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
              }`}
            >
              {t('doctors')}
            </LanguageAwareLink>
            <LanguageAwareLink
              to="/patient-stories"
              className={`transition-all duration-300 font-medium px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                isActivePage('/patient-stories')
                  ? 'text-white bg-[#90978C]'
                  : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
              }`}
            >
              {t('patientStories')}
            </LanguageAwareLink>
            <LanguageAwareLink
              to="/qa"
              className={`transition-all duration-300 font-medium px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                isActivePage('/qa') 
                  ? 'text-white bg-[#90978C]' 
                  : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
              }`}
            >
              {t('qa')}
            </LanguageAwareLink>
            <LanguageAwareLink
              to="/about"
              className={`transition-all duration-300 font-medium px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                isActivePage('/about') 
                  ? 'text-white bg-[#90978C]' 
                  : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
              }`}
            >
              {t('about')}
            </LanguageAwareLink>
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center space-x-3">
            <LanguageSelector />

            {user && <NotificationBell />}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 rounded-lg hover:theme-bg-tertiary transition-all duration-300"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#A6BAB4]"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-[#CAD8D6] to-[#B8C9C5] rounded-full flex items-center justify-center">
                      <User size={16} className="theme-accent" />
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 theme-bg rounded-lg theme-shadow-lg theme-border border py-2">
                    <div className="px-4 py-3 theme-border border-b">
                      <div className="text-sm font-semibold theme-text">{user.full_name}</div>
                      <div className="text-xs theme-text-muted">{user.email}</div>
                    </div>
                    <LanguageAwareLink
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm theme-text-secondary hover:theme-bg-tertiary hover:theme-accent transition-all duration-300"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      <span>Profil</span>
                    </LanguageAwareLink>
                    {(user.role === 'admin' || user.role === 'moderator') && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-sm theme-text-secondary hover:theme-bg-tertiary hover:theme-accent transition-all duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    {user.role === 'doctor' && (
                      <LanguageAwareLink
                        to="/doctor-dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-sm theme-text-secondary hover:theme-bg-tertiary hover:theme-accent transition-all duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Stethoscope size={16} />
                        <span>Shifokor Paneli</span>
                      </LanguageAwareLink>
                    )}
                    <div className="theme-border border-t my-2"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    >
                      <LogOut size={16} />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LanguageAwareLink
                  to="/login"
                 className="theme-text hover:theme-accent hover:theme-bg-tertiary transition-all duration-300 font-medium px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                >
                  {t('login')}
                </LanguageAwareLink>
                <LanguageAwareLink
                  to="/register"
                  className="text-white bg-[#90978C] px-3 py-2 rounded-lg transition-all duration-300 font-medium shadow-sm hover:opacity-90 text-sm whitespace-nowrap"
                >
                  {t('register')}
                </LanguageAwareLink>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Controls */}
          <div className="lg:hidden flex items-center space-x-2">
            <LanguageSelector />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 theme-text-secondary hover:theme-accent transition-all duration-300 rounded-lg hover:theme-bg-tertiary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 theme-border border-t">
            <div className="flex flex-col space-y-3">
              <LanguageAwareLink
                to="/"
                className={`transition-all duration-300 font-medium py-2 px-3 rounded-lg text-sm whitespace-nowrap ${
                  isActivePage('/') 
                    ? 'text-white bg-[#90978C]' 
                    : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/posts"
                className={`transition-all duration-300 font-medium py-2 px-3 rounded-lg text-sm whitespace-nowrap ${
                  isActivePage('/posts') 
                    ? 'text-white bg-[#90978C]' 
                    : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('posts')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/doctors"
                className={`transition-all duration-300 font-medium py-2 px-3 rounded-lg text-sm whitespace-nowrap ${
                  isActivePage('/doctors') 
                    ? 'text-white bg-[#90978C]' 
                    : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('doctors')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/patient-stories"
                className={`transition-all duration-300 font-medium py-2 px-3 rounded-lg text-sm whitespace-nowrap ${
                  isActivePage('/patient-stories') 
                    ? 'text-white bg-[#90978C]' 
                    : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('patientStories')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/qa"
                className={`transition-all duration-300 font-medium py-2 px-3 rounded-lg text-sm whitespace-nowrap ${
                  isActivePage('/qa') 
                    ? 'text-white bg-[#90978C]' 
                    : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('qa')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/about"
                className={`transition-all duration-300 font-medium py-2 px-3 rounded-lg text-sm whitespace-nowrap ${
                  isActivePage('/about') 
                    ? 'text-white bg-[#90978C]' 
                    : 'theme-text hover:theme-accent hover:theme-bg-tertiary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('about')}
              </LanguageAwareLink>
              
              {user ? (
                <div className="pt-3 theme-border border-t space-y-2">
                  <div className="flex items-center space-x-3 py-2 px-3 theme-bg-tertiary rounded-lg">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full object-cover border border-[#A6BAB4]"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-[#CAD8D6] to-[#B8C9C5] rounded-full flex items-center justify-center">
                        <User size={14} className="theme-accent" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold theme-text">{user.full_name}</div>
                      <div className="text-xs theme-text-muted capitalize">{user.role}</div>
                    </div>
                  </div>
                  <LanguageAwareLink
                    to="/profile"
                   className="flex items-center space-x-2 theme-text hover:theme-accent transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:theme-bg-tertiary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>Profil</span>
                  </LanguageAwareLink>
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <Link
                      to="/admin"
                     className="flex items-center space-x-2 theme-text hover:theme-accent transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:theme-bg-tertiary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={16} />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  {user.role === 'doctor' && (
                    <LanguageAwareLink
                      to="/doctor-dashboard"
                      className="flex items-center space-x-2 theme-text hover:theme-accent transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:theme-bg-tertiary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Stethoscope size={16} />
                      <span>Shifokor Paneli</span>
                    </LanguageAwareLink>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:bg-red-50 text-left w-full flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 theme-border border-t flex flex-col space-y-2">
                  <LanguageAwareLink
                    to="/login"
                   className="theme-text hover:theme-accent transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:theme-bg-tertiary text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('login')}
                  </LanguageAwareLink>
                  <LanguageAwareLink
                  to="/register"
                  className="text-white bg-[#90978C] px-4 py-2 rounded-lg transition-all duration-300 font-medium text-center shadow-sm hover:opacity-90 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                    {t('register')}
                  </LanguageAwareLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
