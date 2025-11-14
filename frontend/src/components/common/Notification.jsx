import { useEffect } from 'react';
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
  success: 'bg-success-50 text-success-800 border-success-200',
  error: 'bg-danger-50 text-danger-800 border-danger-200',
  warning: 'bg-warning-50 text-warning-800 border-warning-200',
  info: 'bg-primary-50 text-primary-800 border-primary-200',
};

export const Notification = ({ notification, onClose }) => {
  const Icon = icons[notification.type] || InfoIcon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  return (
    <div
      className={`
        flex items-start p-4 mb-4 rounded-lg border
        ${colors[notification.type]}
        shadow-lg
        animate-slide-in
      `}
    >
      <Icon className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3" />
      <div className="flex-1">
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-gray-600"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export const NotificationContainer = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};
