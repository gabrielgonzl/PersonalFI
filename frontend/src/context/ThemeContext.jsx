import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS, THEMES } from '../config/constants';

const ThemeContext = createContext({
  theme: THEMES.LIGHT,
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, THEMES.LIGHT);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark');

    // Determine effective theme
    let effectiveTheme = theme;
    if (theme === THEMES.AUTO) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? THEMES.DARK : THEMES.LIGHT;
    }

    // Add theme class
    root.classList.add(effectiveTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        effectiveTheme === THEMES.DARK ? '#1e293b' : '#ffffff'
      );
    } else {
      // Create meta tag if it doesn't exist
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = effectiveTheme === THEMES.DARK ? '#1e293b' : '#ffffff';
      document.head.appendChild(meta);
    }
  }, [theme]);

  // Listen for system theme changes when in AUTO mode
  useEffect(() => {
    if (theme !== THEMES.AUTO) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === THEMES.LIGHT) return THEMES.DARK;
      if (prevTheme === THEMES.DARK) return THEMES.LIGHT;
      return THEMES.LIGHT; // Default from AUTO
    });
  };

  const isDark = () => {
    if (theme === THEMES.DARK) return true;
    if (theme === THEMES.LIGHT) return false;
    // AUTO mode
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: isDark(),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
