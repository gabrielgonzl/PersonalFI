import { useState } from 'react';
import { usePerformanceData, useDistributionData, useTopPerformers, useTimelineData } from '../../hooks/useAnalytics';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart } from '../../components/charts/PieChart';
import { BarChart } from '../../components/charts/BarChart';
import { AreaChart } from '../../components/charts/AreaChart';
import { formatCurrency, formatPercentage, getProfitLossColor, getProfitLossPrefix } from '../../utils/formatters';
import { DATE_RANGES, DATE_RANGE_LABELS } from '../../config/constants';

export const Analytics = () => {
  const { currency } = useApp();
  const [period, setPeriod] = useState(DATE_RANGES.MONTH);

  const { data: performance, isLoading: performanceLoading } = usePerformanceData({ period });
  const { data: distribution, isLoading: distributionLoading } = useDistributionData();
  const { data: topPerformers, isLoading: topPerformersLoading } = useTopPerformers({ limit: 10 });
  const { data: timeline, isLoading: timelineLoading } = useTimelineData({ period });

  const periodOptions = Object.entries(DATE_RANGE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed insights into your investment performance</p>
        </div>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={periodOptions}
          className="w-48"
        />
      </div>

      {/* Performance Chart */}
      <Card title="Portfolio Performance" subtitle={`Value over time - ${DATE_RANGE_LABELS[period]}`}>
        {performanceLoading ? (
          <Loading />
        ) : performance?.data?.length > 0 ? (
          <AreaChart
            data={performance.data}
            areas={[
              { dataKey: 'value', name: 'Portfolio Value', color: '#0ea5e9' },
              { dataKey: 'invested', name: 'Total Invested', color: '#6b7280' },
            ]}
            currency={currency}
            height={350}
          />
        ) : (
          <p className="text-gray-500 text-center py-8">No performance data available</p>
        )}
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Distribution by Asset Type" subtitle="Breakdown by category">
          {distributionLoading ? (
            <Loading />
          ) : distribution?.byType?.length > 0 ? (
            <PieChart
              data={distribution.byType.map(item => ({
                name: item.type,
                value: item.value,
              }))}
              currency={currency}
              height={300}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No distribution data</p>
          )}
        </Card>

        <Card title="Distribution by Portfolio" subtitle="Allocation across portfolios">
          {distributionLoading ? (
            <Loading />
          ) : distribution?.byPortfolio?.length > 0 ? (
            <PieChart
              data={distribution.byPortfolio.map(item => ({
                name: item.portfolioName || 'Independent',
                value: item.value,
                color: item.color,
              }))}
              currency={currency}
              height={300}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No portfolio data</p>
          )}
        </Card>
      </div>

      {/* Top Performers */}
      <Card title="Top Performers" subtitle="Best and worst performing assets">
        {topPerformersLoading ? (
          <Loading />
        ) : topPerformers?.data?.length > 0 ? (
          <div className="space-y-4">
            {/* Top Gainers */}
            <div>
              <h3 className="text-lg font-semibold text-success-700 mb-3">Top Gainers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topPerformers.data
                  .filter(asset => asset.profitLossPercentage > 0)
                  .slice(0, 5)
                  .map((asset) => (
                    <div key={asset._id} className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-600">{asset.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-success-700">
                          {getProfitLossPrefix(asset.profitLoss)}
                          {formatPercentage(asset.profitLossPercentage)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(asset.profitLoss, asset.currency, true)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Losers */}
            {topPerformers.data.some(asset => asset.profitLossPercentage < 0) && (
              <div>
                <h3 className="text-lg font-semibold text-danger-700 mb-3">Top Losers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topPerformers.data
                    .filter(asset => asset.profitLossPercentage < 0)
                    .slice(0, 5)
                    .map((asset) => (
                      <div key={asset._id} className="flex items-center justify-between p-4 bg-danger-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{asset.name}</p>
                          <p className="text-sm text-gray-600">{asset.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-danger-700">
                            {formatPercentage(asset.profitLossPercentage)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(asset.profitLoss, asset.currency, true)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No performance data available</p>
        )}
      </Card>

      {/* Investment Timeline */}
      <Card title="Investment Timeline" subtitle="Contribution history over time">
        {timelineLoading ? (
          <Loading />
        ) : timeline?.data?.length > 0 ? (
          <BarChart
            data={timeline.data}
            bars={[
              { dataKey: 'totalBuy', name: 'Purchases', color: '#22c55e' },
              { dataKey: 'totalSell', name: 'Sales', color: '#ef4444' },
            ]}
            currency={currency}
            height={300}
          />
        ) : (
          <p className="text-gray-500 text-center py-8">No timeline data available</p>
        )}
      </Card>
    </div>
  );
};
