import { Card } from '../common/Card';
import { formatCurrency, formatPercentage, getProfitLossColor, getProfitLossPrefix } from '../../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export const MetricCard = ({
  title,
  value,
  change,
  changeType = 'percentage',
  currency = 'USD',
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
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-32 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(value, currency, value > 10000)}
            </p>
          )}
          {change !== undefined && !loading && (
            <div className={`mt-2 flex items-center text-sm ${getProfitLossColor(change)}`}>
              {isPositive && <TrendingUpIcon className="w-4 h-4 mr-1" />}
              {isNegative && <TrendingDownIcon className="w-4 h-4 mr-1" />}
              <span>
                {getProfitLossPrefix(change)}{formattedChange}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg bg-gray-50 ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
