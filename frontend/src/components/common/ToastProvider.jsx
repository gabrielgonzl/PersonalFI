import { Toaster } from 'react-hot-toast';

/**
 * Toast Provider Component
 * Configures react-hot-toast with professional styling
 */
export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,

        // Styling
        style: {
          background: '#fff',
          color: '#374151',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontSize: '14px',
          fontWeight: '500',
        },

        // Success
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #d1fae5',
            background: '#f0fdf4',
          },
        },

        // Error
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #fecaca',
            background: '#fef2f2',
          },
        },

        // Loading
        loading: {
          iconTheme: {
            primary: '#2563eb',
            secondary: '#fff',
          },
        },

        // Custom (warning, info)
        custom: {
          duration: 4000,
        },
      }}
    />
  );
};

/**
 * Custom toast helpers with consistent styling
 */
export const customToast = {
  warning: (message, options = {}) => {
    return toast(message, {
      icon: '⚠️',
      style: {
        border: '1px solid #fde68a',
        background: '#fffbeb',
      },
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      icon: 'ℹ️',
      style: {
        border: '1px solid #bfdbfe',
        background: '#eff6ff',
      },
      ...options,
    });
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Cargando...',
      success: messages.success || 'Completado',
      error: messages.error || 'Error',
    });
  },
};
