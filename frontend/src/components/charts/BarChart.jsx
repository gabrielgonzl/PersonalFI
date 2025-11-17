import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../config/constants';
import { formatCurrency } from '../../utils/formatters';

export const BarChart = ({
  data = [],
  bars = [],
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  currency = 'USD',
  stacked = false,
  horizontal = false,
}) => {
  const Chart = horizontal ? RechartsBarChart : RechartsBarChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value, currency, true)}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xAxisKey}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value, currency, true)}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
          }}
          formatter={(value) => formatCurrency(value, currency)}
        />
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </Chart>
    </ResponsiveContainer>
  );
};
