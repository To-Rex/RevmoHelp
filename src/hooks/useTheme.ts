import { useState, useEffect } from 'react';

type Theme = 'light';

export const useTheme = () => {
  const [theme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Apply single theme
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light');
    setIsLoading(false);
  }, []);

  // No-op toggle function to maintain compatibility
  const toggleTheme = () => {
    // Theme toggle disabled
  };

  return {
    theme,
    toggleTheme,
    isLoading,
    isDark: false,
    isLight: true
  };
};