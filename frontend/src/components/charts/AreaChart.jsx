import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../config/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AreaChart = ({
  data = [],
  areas = [],
  xAxisKey = 'date',
  height = 300,
  showGrid = true,
  showLegend = true,
  currency = 'USD',
  stacked = false,
  formatXAxis = (value) => formatDate(value, 'MMM dd'),
  formatYAxis = (value) => formatCurrency(value, currency, true),
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxis}
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
          }}
          formatter={(value, name) => [formatCurrency(value, currency), name]}
          labelFormatter={(label) => formatDate(label, 'MMM dd, yyyy')}
        />
        {showLegend && <Legend />}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stackId={stacked ? 'stack' : undefined}
            stroke={area.color || CHART_COLORS[index % CHART_COLORS.length]}
            fill={area.color || CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};
