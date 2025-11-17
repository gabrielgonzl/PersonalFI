import { useState } from 'react';
import { usePerformanceData, useDistributionData, useTopPerformers, useTimelineData } from '../../hooks/useAnalytics';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart } from '../../components/charts/PieChart';
import { ASSET_TYPE_LABELS } from '../../config/constants';
import { BarChart } from '../../components/charts/BarChart';
import { AreaChart } from '../../components/charts/AreaChart';
import { formatCurrency, formatPercentage, getProfitLossColor, getProfitLossPrefix } from '../../utils/formatters';
import { DATE_RANGES, DATE_RANGE_LABELS } from '../../config/constants';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const Analytics = () => {
  const { currency } = useApp();
  const [period, setPeriod] = useState(DATE_RANGES.MONTH);

  const { data: performance, isLoading: performanceLoading } = usePerformanceData({ period });
  const { data: distribution, isLoading: distributionLoading } = useDistributionData();
  const { data: topPerformers, isLoading: topPerformersLoading } = useTopPerformers({ limit: 10 });
  const { data: timeline, isLoading: timelineLoading } = useTimelineData({ period });

  const periodOptions = Object.entries(DATE_RANGE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-warning-100 rounded-xl">
            <AssessmentIcon className="w-8 h-8 text-warning-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Analíticas</h1>
            <p className="text-gray-600 mt-1">Visualiza y analiza el rendimiento de tus inversiones</p>
          </div>
        </div>
        <Select
          label="Período"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={periodOptions}
          className="w-48"
        />
      </div>

      <Card 
        title="📈 Rendimiento del Portfolio"
        subtitle={`Evolución del valor - ${DATE_RANGE_LABELS[period]}`}
        className="shadow-lg"
      >
        {performanceLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loading />
          </div>
        ) : performance?.data?.length > 0 ? (
          <AreaChart
            data={performance.data}
            areas={[
              { dataKey: 'value', name: 'Valor del Portfolio', color: '#0ea5e9' },
              { dataKey: 'invested', name: 'Total Invertido', color: '#6b7280' },
            ]}
            currency={currency}
            height={350}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">📊 No hay datos de rendimiento disponibles</p>
            <p className="text-gray-400 text-sm mt-2">Agrega activos y transacciones para ver gráficos</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="🥧 Distribución por Tipo"
          subtitle="Desglose por categoría de activo"
          className="shadow-lg"
        >
          {distributionLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loading />
            </div>
          ) : distribution?.byType?.length > 0 ? (
            <PieChart
              data={distribution.byType.map(item => ({
                name: ASSET_TYPE_LABELS[item.type] || item.type,
                value: item.value,
              }))}
              currency={currency}
              height={300}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Sin datos de distribución</p>
            </div>
          )}
        </Card>

        <Card
          title="💼 Distribución por Cartera"
          subtitle="Asignación entre carteras"
          className="shadow-lg"
        >
          {distributionLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loading />
            </div>
          ) : distribution?.byPortfolio?.length > 0 ? (
            <PieChart
              data={distribution.byPortfolio.map(item => ({
                name: item.portfolioName || 'Independiente',
                value: item.value,
                color: item.color,
              }))}
              currency={currency}
              height={300}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Sin datos de carteras</p>
            </div>
          )}
        </Card>
      </div>

      <Card title="🏆 Mejores y Peores Activos" subtitle="Rendimiento de activos" className="shadow-lg">
        {topPerformersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : topPerformers?.data?.length > 0 ? (
          <div className="space-y-6">
            {topPerformers.data.some(asset => asset.profitLossPercentage > 0) && (
              <div>
                <h3 className="text-lg font-bold text-success-700 mb-4 flex items-center gap-2">
                  🚀 Top Ganadores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topPerformers.data
                    .filter(asset => asset.profitLossPercentage > 0)
                    .slice(0, 5)
                    .map((asset) => (
                      <div key={asset._id} className="flex items-center justify-between p-4 bg-success-50 rounded-xl border border-success-200 hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-bold text-gray-900">{asset.name}</p>
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
            )}

            {topPerformers.data.some(asset => asset.profitLossPercentage < 0) && (
              <div>
                <h3 className="text-lg font-bold text-danger-700 mb-4 flex items-center gap-2">
                  📉 Top Perdedores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topPerformers.data
                    .filter(asset => asset.profitLossPercentage < 0)
                    .slice(0, 5)
                    .map((asset) => (
                      <div key={asset._id} className="flex items-center justify-between p-4 bg-danger-50 rounded-xl border border-danger-200 hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-bold text-gray-900">{asset.name}</p>
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
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Sin datos de rendimiento</p>
          </div>
        )}
      </Card>

      <Card title="📅 Línea de Tiempo de Inversiones" subtitle="Historial de compras y ventas" className="shadow-lg">
        {timelineLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : timeline?.data?.length > 0 ? (
          <BarChart
            data={timeline.data}
            bars={[
              { dataKey: 'totalBuy', name: 'Compras', color: '#22c55e' },
              { dataKey: 'totalSell', name: 'Ventas', color: '#ef4444' },
            ]}
            currency={currency}
            height={300}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Sin datos de transacciones</p>
          </div>
        )}
      </Card>
    </div>
  );
};
