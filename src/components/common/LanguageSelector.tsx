import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguageRouting } from '../../hooks/useLanguageRouting';
import type { Language } from '../../types';

const languages: Language[] = [
  { code: 'uz', name: "O'zbek", nativeName: "O'zbekcha" },
  { code: 'ru', name: 'Русский', nativeName: 'Русский' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const { i18n } = useTranslation();
  const { changeLanguage } = useLanguageRouting();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg theme-text-secondary hover:theme-accent hover:theme-bg-tertiary transition-all duration-200"
      >
        <Globe size={16} className="theme-text-muted" />
        <span className="text-sm font-medium theme-text">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown size={14} className="theme-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg theme-shadow-lg theme-border border py-2 z-50" ref={menuRef}>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:theme-bg-tertiary transition-colors duration-200 ${
                currentLanguage.code === language.code
                  ? 'theme-accent bg-blue-50 dark:bg-blue-900/20'
                  : 'theme-text-secondary'
              }`}
            >
              {language.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;