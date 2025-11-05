import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import LanguageAwareLink from './LanguageAwareLink';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="theme-bg-secondary theme-border border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <LanguageAwareLink to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 theme-accent-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-lg font-bold theme-text">Revmohelp</span>
            </LanguageAwareLink>
            <p className="theme-text-secondary text-sm leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="space-y-2 text-sm theme-text-secondary">
              <div className="flex items-center space-x-2">
                <Mail size={14} />
                <span>revmohelp@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={14} />
                <span>+998 (93) 200 10 22</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} />
                <span>Toshkent, O'zbekiston</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold theme-text uppercase tracking-wider">{t('footerQuickLinks')}</h3>
            <div className="space-y-2">
              <LanguageAwareLink
                to="/"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('home')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/posts"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('posts')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/doctors"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('doctors')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/qa"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('qa')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/patient-stories"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('patientStories')}
              </LanguageAwareLink>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold theme-text uppercase tracking-wider">{t('footerLegal')}</h3>
            <div className="space-y-2">
              <LanguageAwareLink
                to="/privacy"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('privacyPolicy')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/data-security"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('dataSecurity')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/terms"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('termsOfUse')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/faq"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('faq')}
              </LanguageAwareLink>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold theme-text uppercase tracking-wider">{t('footerContact')}</h3>
            <div className="space-y-2">
              <LanguageAwareLink
                to="/about"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('aboutUs')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/contact"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('contact')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/partnership"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                {t('partnership')}
              </LanguageAwareLink>
              <LanguageAwareLink
                to="/consultation"
                className="block theme-text-secondary hover:theme-accent transition-colors duration-200 text-sm"
              >
                A'zosi Bo'ling
              </LanguageAwareLink>
            </div>
          </div>
        </div>

        <div className="theme-border border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="theme-text-muted text-sm">
            © {currentYear} Revmohelp. {t('allRightsReserved')}.
          </p>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <span className="theme-text-muted text-sm">{t('developedBy')}</span>
            <a
              href="https://torexdev.uz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
            >
              torexdev.uz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;