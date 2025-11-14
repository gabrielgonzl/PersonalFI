import { useApp } from '../../context/AppContext';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const Header = () => {
  const { toggleSidebar } = useApp();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-900 lg:hidden"
          >
            <MenuIcon />
          </button>

          <div className="flex items-center space-x-2">
            <AccountBalanceWalletIcon className="text-primary-600 text-3xl" />
            <span className="text-xl font-bold text-gray-900">Growing</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Welcome back!
          </div>
        </div>
      </div>
    </header>
  );
};
