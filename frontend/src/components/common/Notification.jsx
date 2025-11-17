import { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const icons = {
  success: CheckCircleIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

const colors = {
  success: 'bg-success-50 text-success-800 border-l-success-500',
  error: 'bg-danger-50 text-danger-800 border-l-danger-500',
  warning: 'bg-warning-50 text-warning-800 border-l-warning-500',
  info: 'bg-primary-50 text-primary-800 border-l-primary-500',
};

const iconColors = {
  success: 'text-success-500',
  error: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-primary-500',
};

export const Notification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[notification.type] || InfoIcon;

  useEffect(() => {
    // Entrada
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  return (
    <div
      className={`
        flex items-start p-4 mb-3 rounded-lg border-l-4 shadow-xl backdrop-blur-sm
        ${colors[notification.type]}
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        hover:shadow-2xl hover:scale-105
      `}
    >
      <div className={`flex-shrink-0 mr-3 ${iconColors[notification.type]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-semibold leading-relaxed">{notification.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-full p-1 transition-colors"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export const NotificationContainer = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] w-96 max-w-[calc(100vw-3rem)] pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};
