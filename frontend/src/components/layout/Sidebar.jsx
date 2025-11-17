import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

const navigation = [
  { name: 'Dashboard', href: '/', icon: DashboardIcon },
  { name: 'Assets', href: '/assets', icon: TrendingUpIcon },
  { name: 'Portfolios', href: '/portfolios', icon: AccountBalanceIcon },
  { name: 'Analytics', href: '/analytics', icon: BarChartIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useApp();

  // On mobile, collapsed means hidden. On desktop, always visible.
  const isHidden = sidebarCollapsed;

  return (
    <>
      {/* Mobile overlay */}
      {!isHidden && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isHidden ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          w-64
        `}
      >
        {/* Close button (mobile only) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-900"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `
              }
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
