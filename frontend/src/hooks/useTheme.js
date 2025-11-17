import { useApp } from '../context/AppContext';
import { THEMES } from '../config/constants';

/**
 * useTheme Hook
 * Manages theme state using AppContext
 *
 * @returns {object} - { theme, setTheme, toggleTheme, isDark }
 *
 * @example
 * const { theme, toggleTheme, isDark } = useTheme();
 */
export const useTheme = () => {
  const { theme, updateTheme } = useApp();

  const toggleTheme = () => {
    const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    updateTheme(newTheme);
  };

  const isDark = theme === THEMES.DARK;

  return {
    theme,
    setTheme: updateTheme,
    toggleTheme,
    isDark,
  };
};

export default useTheme;
