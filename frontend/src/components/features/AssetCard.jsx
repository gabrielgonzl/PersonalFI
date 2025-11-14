import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import {
  formatCurrency,
  formatPercentage,
  getProfitLossColor,
  getProfitLossPrefix,
  getProfitLossBgColor,
} from '../../utils/formatters';
import { ASSET_TYPE_LABELS } from '../../config/constants';

export const AssetCard = ({ asset, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(asset);
    } else {
      navigate(`/assets/${asset._id}`);
    }
  };

  return (
    <Card hover className="cursor-pointer" onClick={handleClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {/* Asset Icon/Color */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: asset.color || '#0ea5e9' }}
          >
            {asset.symbol ? asset.symbol.substring(0, 2).toUpperCase() : asset.name.substring(0, 2).toUpperCase()}
          </div>

          {/* Asset Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
            <p className="text-sm text-gray-500">{asset.symbol}</p>
            <p className="text-xs text-gray-400 mt-1">
              {ASSET_TYPE_LABELS[asset.type] || asset.type}
            </p>
          </div>
        </div>

        {/* Profit/Loss Badge */}
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getProfitLossBgColor(asset.profitLoss)}`}>
          {getProfitLossPrefix(asset.profitLoss)}
          {formatPercentage(asset.profitLossPercentage || 0)}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Current Value</p>
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(asset.currentValue || 0, asset.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Invested</p>
          <p className="text-base font-semibold text-gray-600">
            {formatCurrency(asset.totalInvested || 0, asset.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Quantity</p>
          <p className="text-base font-semibold text-gray-900">
            {asset.quantity?.toFixed(4) || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Profit/Loss</p>
          <p className={`text-base font-semibold ${getProfitLossColor(asset.profitLoss)}`}>
            {getProfitLossPrefix(asset.profitLoss)}
            {formatCurrency(Math.abs(asset.profitLoss || 0), asset.currency, true)}
          </p>
        </div>
      </div>
    </Card>
  );
};
