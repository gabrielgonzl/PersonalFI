import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NotificationContainer } from '../common/Notification';
import { useApp } from '../../context/AppContext';

export const Layout = ({ children }) => {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
};
