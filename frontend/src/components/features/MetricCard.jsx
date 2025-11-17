import { Card } from '../common/Card';
import { formatCurrency, formatPercentage, getProfitLossColor, getProfitLossPrefix } from '../../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export const MetricCard = ({
  title,
  value,
  change,
  changeType = 'percentage',
  currency = 'EUR',
  icon,
  iconColor = 'text-primary-600',
  loading = false,
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const formattedChange =
    changeType === 'percentage'
      ? formatPercentage(Math.abs(change || 0))
      : formatCurrency(Math.abs(change || 0), currency, true);

  return (
    <Card hover className="relative overflow-hidden group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          {loading ? (
            <div className="mt-3 h-10 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
          ) : (
            <p className="mt-3 text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title === 'Número de Activos' ? value : formatCurrency(value, currency, value > 10000)}
            </p>
          )}
          {change !== undefined && !loading && (
            <div className={`mt-3 flex items-center text-sm font-semibold ${getProfitLossColor(change)}`}>
              {isPositive && <TrendingUpIcon className="w-5 h-5 mr-1" />}
              {isNegative && <TrendingDownIcon className="w-5 h-5 mr-1" />}
              <span className="text-base">
                {getProfitLossPrefix(change)}{formattedChange}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
