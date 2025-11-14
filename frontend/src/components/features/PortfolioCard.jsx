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
    <Card hover className="cursor-pointer" onClick={handleClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {/* Portfolio Icon */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: portfolio.color || '#0ea5e9' }}
          >
            <AccountBalanceIcon />
          </div>

          {/* Portfolio Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{portfolio.name}</h3>
            {portfolio.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {portfolio.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
            </p>
          </div>
        </div>

        {/* Profit/Loss Badge */}
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getProfitLossBgColor(portfolio.profitLoss)}`}>
          {getProfitLossPrefix(portfolio.profitLoss)}
          {formatPercentage(portfolio.profitLossPercentage || 0)}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(portfolio.totalValue || 0, portfolio.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Cash Balance</p>
          <p className="text-base font-semibold text-gray-600">
            {formatCurrency(portfolio.cashBalance || 0, portfolio.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Invested</p>
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(portfolio.totalInvested || 0, portfolio.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Profit/Loss</p>
          <p className={`text-base font-semibold ${getProfitLossColor(portfolio.profitLoss)}`}>
            {getProfitLossPrefix(portfolio.profitLoss)}
            {formatCurrency(Math.abs(portfolio.profitLoss || 0), portfolio.currency, true)}
          </p>
        </div>
      </div>
    </Card>
  );
};
