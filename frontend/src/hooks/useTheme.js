import { useState, useEffect } from 'react';

export function useTheme() {
  // Get initial theme from localStorage or default to 'system'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system';
    }
    return 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState('light');

  // Function to get the effective theme (resolves 'system' to 'light' or 'dark')
  const getEffectiveTheme = (themeValue) => {
    if (themeValue === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeValue;
  };

  // Apply theme to document
  const applyTheme = (themeValue) => {
    const resolvedTheme = getEffectiveTheme(themeValue);
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    setEffectiveTheme(resolvedTheme);
  };

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system');
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  // Set theme and persist to localStorage
  const setThemeAndPersist = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  // Toggle between light and dark (ignores system)
  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    setThemeAndPersist(newTheme);
  };

  return {
    theme,
    setTheme: setThemeAndPersist,
    toggleTheme,
    effectiveTheme,
  };
}
