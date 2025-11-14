import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, CURRENCIES, THEMES, LANGUAGES } from '../config/constants';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.LIGHT;
  });

  // Language
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || LANGUAGES.EN;
  });

  // Currency
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || CURRENCIES[0];
  });

  // Sidebar - Start collapsed on mobile by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    if (stored !== null) {
      return stored === 'true';
    }
    // Default: collapsed on mobile (< 1024px), open on desktop
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // Update theme
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);

    // Apply theme to document
    if (newTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Update language
  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
  };

  // Update currency
  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, newCurrency);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(newValue));
      return newValue;
    });
  };

  // Add notification
  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { id, ...notification };
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return id;
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Show success notification
  const showSuccess = (message) => {
    addNotification({ type: 'success', message });
  };

  // Show error notification
  const showError = (message) => {
    addNotification({ type: 'error', message });
  };

  // Show warning notification
  const showWarning = (message) => {
    addNotification({ type: 'warning', message });
  };

  // Show info notification
  const showInfo = (message) => {
    addNotification({ type: 'info', message });
  };

  // Initialize theme on mount
  useEffect(() => {
    if (theme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const value = {
    // Theme
    theme,
    updateTheme,

    // Language
    language,
    updateLanguage,

    // Currency
    currency,
    updateCurrency,

    // Sidebar
    sidebarCollapsed,
    toggleSidebar,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
