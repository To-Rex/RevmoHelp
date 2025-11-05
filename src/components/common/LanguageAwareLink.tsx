import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LanguageAwareLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  preserveLanguage?: boolean;
}

const LanguageAwareLink: React.FC<LanguageAwareLinkProps> = ({ 
  to, 
  preserveLanguage = true, 
  children, 
  ...props 
}) => {
  const { i18n } = useTranslation();

  const getLocalizedPath = (path: string): string => {
    // Don't add language prefix for Uzbek (default)
    if (!preserveLanguage || i18n.language === 'uz') {
      return path;
    }
    
    // Add language prefix for other languages
    if (i18n.language === 'ru' || i18n.language === 'en') {
      return `/${i18n.language}${path}`;
    }
    
    return path;
  };

  return (
    <Link to={getLocalizedPath(to)} {...props}>
      {children}
    </Link>
  );
};

export default LanguageAwareLink;