import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useLanguageRouting = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Get language from URL
  const getLanguageFromPath = (pathname: string): string | null => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    
    if (['ru', 'en'].includes(firstSegment)) {
      return firstSegment;
    }
    return null; // Default to Uzbek (no prefix)
  };

  // Get path without language prefix
  const getPathWithoutLanguage = (pathname: string): string => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    
    if (['ru', 'en'].includes(firstSegment)) {
      return '/' + segments.slice(1).join('/');
    }
    return pathname;
  };

  // Add language prefix to path
  const addLanguageToPath = (pathname: string, language: string): string => {
    const cleanPath = getPathWithoutLanguage(pathname);
    
    if (language === 'uz') {
      return cleanPath || '/';
    }
    
    return `/${language}${cleanPath}`;
  };

  // Change language and update URL
  const changeLanguage = (newLanguage: string) => {
    const currentPath = getPathWithoutLanguage(location.pathname);
    const newPath = addLanguageToPath(currentPath, newLanguage);
    
    i18n.changeLanguage(newLanguage);
    navigate(newPath, { replace: true });
  };

  // Initialize language from URL
  useEffect(() => {
    const urlLanguage = getLanguageFromPath(location.pathname);
    
    if (urlLanguage && urlLanguage !== i18n.language) {
      i18n.changeLanguage(urlLanguage);
    } else if (!urlLanguage && i18n.language !== 'uz') {
      // If no language in URL but current language is not Uzbek, redirect
      const newPath = addLanguageToPath(location.pathname, i18n.language);
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, i18n, navigate]);

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    getPathWithoutLanguage,
    addLanguageToPath
  };
};