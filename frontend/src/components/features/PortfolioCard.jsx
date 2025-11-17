import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import {
  formatCurrency,
  formatPercentage,
  getProfitLossColor,
  getProfitLossPrefix,
  getProfitLossBgColor,
} from '../../utils/formatters';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export const PortfolioCard = ({ portfolio, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(portfolio);
    } else {
      navigate(`/portfolios/${portfolio._id}`);
    }
  };

  const assetCount = portfolio.assetCount || portfolio.assets?.length || 0;

  return (
    <Card hover className="cursor-pointer group" onClick={handleClick}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start space-x-4">
          {/* Portfolio Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: portfolio.color || '#0ea5e9' }}
          >
            <AccountBalanceIcon className="w-8 h-8" />
          </div>

          {/* Portfolio Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{portfolio.name}</h3>
            {portfolio.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {portfolio.description}
              </p>
            )}
            <p className="text-xs font-semibold text-gray-500 mt-2 uppercase tracking-wide px-2 py-0.5 bg-gray-100 rounded inline-block">
              {assetCount} {assetCount === 1 ? 'activo' : 'activos'}
            </p>
          </div>
        </div>

        {/* Profit/Loss Badge */}
        <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${getProfitLossBgColor(portfolio.profitLoss)}`}>
          {getProfitLossPrefix(portfolio.profitLoss)}
          {formatPercentage(portfolio.profitLossPercentage || 0)}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Valor Total</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(portfolio.totalValue || 0, portfolio.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Efectivo</p>
          <p className="text-lg font-bold text-gray-700">
            {formatCurrency(portfolio.cashBalance || 0, portfolio.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invertido</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(portfolio.totalInvested || 0, portfolio.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ganancia/Pérdida</p>
          <p className={`text-lg font-bold ${getProfitLossColor(portfolio.profitLoss)}`}>
            {getProfitLossPrefix(portfolio.profitLoss)}
            {formatCurrency(Math.abs(portfolio.profitLoss || 0), portfolio.currency, true)}
          </p>
        </div>
      </div>
    </Card>
  );
};
