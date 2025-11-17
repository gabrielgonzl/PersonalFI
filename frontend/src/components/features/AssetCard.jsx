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
    <Card hover className="cursor-pointer group" onClick={handleClick}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start space-x-4">
          {/* Asset Icon/Color */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: asset.color || '#0ea5e9' }}
          >
            {asset.symbol ? asset.symbol.substring(0, 2).toUpperCase() : asset.name.substring(0, 2).toUpperCase()}
          </div>

          {/* Asset Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{asset.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-medium text-gray-600">{asset.symbol}</p>
              <span className="text-gray-400">•</span>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-0.5 bg-gray-100 rounded">
                {ASSET_TYPE_LABELS[asset.type] || asset.type}
              </p>
            </div>
          </div>
        </div>

        {/* Profit/Loss Badge */}
        <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${getProfitLossBgColor(asset.profitLoss)}`}>
          {getProfitLossPrefix(asset.profitLoss)}
          {formatPercentage(asset.profitLossPercentage || 0)}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Valor Actual</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(asset.currentValue || 0, asset.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Invertido</p>
          <p className="text-lg font-bold text-gray-700">
            {formatCurrency(asset.totalInvested || 0, asset.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cantidad</p>
          <p className="text-lg font-bold text-gray-900">
            {asset.quantity?.toFixed(4) || 0}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ganancia/Pérdida</p>
          <p className={`text-lg font-bold ${getProfitLossColor(asset.profitLoss)}`}>
            {getProfitLossPrefix(asset.profitLoss)}
            {formatCurrency(Math.abs(asset.profitLoss || 0), asset.currency, true)}
          </p>
        </div>
      </div>
    </Card>
  );
};
