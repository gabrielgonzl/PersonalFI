import { useState } from 'react';
import {
  usePerformanceData,
  useDistributionData,
  useTopPerformers,
  useTimelineData,
  useRiskMetrics,
  useBenchmarkComparison,
  useRecommendedBenchmark,
} from '../../hooks/useAnalytics';
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

export const Analytics = () => {
  const { currency } = useApp();
  const [period, setPeriod] = useState(DATE_RANGES.MONTH);
  const [granularity, setGranularity] = useState('day');

  const { data: performance, isLoading: performanceLoading } = usePerformanceData({ period, granularity });
  const { data: distribution, isLoading: distributionLoading } = useDistributionData();
  const { data: topPerformers, isLoading: topPerformersLoading } = useTopPerformers({ limit: 10 });
  const { data: timeline, isLoading: timelineLoading } = useTimelineData({ period });
  const { data: riskMetrics, isLoading: riskMetricsLoading } = useRiskMetrics({ period });
  const { data: recommendedBenchmark } = useRecommendedBenchmark();
  const { data: benchmarkComparison, isLoading: benchmarkLoading } = useBenchmarkComparison(
    recommendedBenchmark?.data?.symbol,
    { period }
  );

  const periodOptions = Object.entries(DATE_RANGE_LABELS).map(([value, label]) => ({ value, label }));
  const granularityOptions = [
    { value: 'day', label: 'Diario' },
    { value: 'week', label: 'Semanal' },
    { value: 'month', label: 'Mensual' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-warning-100 rounded-lg">
            <AssessmentIcon className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analíticas</h1>
            <p className="text-sm text-gray-600 mt-0.5">Visualiza y analiza el rendimiento de tus inversiones</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Select
            label="Granularidad"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            options={granularityOptions}
            className="w-36"
          />
          <Select
            label="Período"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={periodOptions}
            className="w-44"
          />
        </div>
      </div>

      <Card
        title="Rendimiento del Portfolio"
        subtitle={`Evolución del valor - ${DATE_RANGE_LABELS[period]} - ${granularityOptions.find(g => g.value === granularity)?.label}`}
        className="shadow-md"
      >
        {performanceLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loading />
          </div>
        ) : performance?.data?.timeline?.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">Valor Inicial</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(performance.data.summary.startValue, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Valor Final</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(performance.data.summary.endValue, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Retorno Total</p>
                <p className={`text-lg font-bold ${getProfitLossColor(performance.data.summary.totalReturn)}`}>
                  {getProfitLossPrefix(performance.data.summary.totalReturn)}
                  {formatPercentage(Math.abs(performance.data.summary.totalReturn))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Capital Invertido</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(performance.data.summary.totalInvestedInPeriod, currency)}
                </p>
              </div>
            </div>
            <LineChart
              data={performance.data.timeline}
              lines={[
                { dataKey: 'totalValue', name: 'Valor del Portfolio', color: '#0ea5e9' },
                { dataKey: 'totalInvested', name: 'Total Invertido', color: '#6b7280' },
              ]}
              currency={currency}
              height={350}
              showBrush={performance.data.timeline.length > 30}
              enableZoom={true}
            />
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 text-base">No hay datos de rendimiento disponibles</p>
            <p className="text-gray-400 text-sm mt-1">Agrega activos y transacciones para ver gráficos</p>
          </div>
        )}
      </Card>

      {/* NUEVA SECCIÓN: Comparación con Benchmark */}
      {benchmarkComparison?.data?.chartData && (
        <Card
          title={`Comparación con ${benchmarkComparison.data.benchmark}`}
          subtitle="Portfolio vs Índice de referencia (Base 100)"
          className="shadow-md"
          icon={<CompareArrowsIcon />}
        >
          {benchmarkLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loading />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Beta</p>
                  <p className="text-lg font-bold text-gray-900">
                    {benchmarkComparison.data.metrics.beta.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Sensibilidad</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Alpha</p>
                  <p className={`text-lg font-bold ${getProfitLossColor(benchmarkComparison.data.metrics.alpha)}`}>
                    {formatPercentage(benchmarkComparison.data.metrics.alpha)}
                  </p>
                  <p className="text-xs text-gray-500">Exceso de retorno</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Correlación</p>
                  <p className="text-lg font-bold text-gray-900">
                    {benchmarkComparison.data.metrics.correlation.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">-1 a 1</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Outperformance</p>
                  <p className={`text-lg font-bold ${getProfitLossColor(benchmarkComparison.data.metrics.outperformance)}`}>
                    {getProfitLossPrefix(benchmarkComparison.data.metrics.outperformance)}
                    {formatPercentage(Math.abs(benchmarkComparison.data.metrics.outperformance))}
                  </p>
                </div>
              </div>
              <LineChart
                data={[
                  ...benchmarkComparison.data.chartData.portfolio.map((p, i) => ({
                    date: p.date,
                    portfolio: p.value,
                    benchmark: benchmarkComparison.data.chartData.benchmark[i]?.value || 100,
                  })),
                ]}
                lines={[
                  { dataKey: 'portfolio', name: 'Mi Portfolio', color: '#0ea5e9' },
                  { dataKey: 'benchmark', name: benchmarkComparison.data.benchmark, color: '#6b7280' },
                ]}
                height={300}
                showBrush={false}
                enableZoom={true}
                formatYAxis={(value) => `${value.toFixed(0)}`}
              />
            </div>
          )}
        </Card>
      )}

      {/* NUEVA SECCIÓN: Métricas de Riesgo */}
      {riskMetrics?.data && (
        <Card
          title="Métricas de Riesgo"
          subtitle="Análisis de riesgo y volatilidad"
          className="shadow-md"
          icon={<TrendingUpIcon />}
        >
          {riskMetricsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loading />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Volatilidad Anualizada</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(riskMetrics.data.volatility)}</p>
                <p className="text-xs text-gray-500 mt-1">Riesgo del portfolio</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{riskMetrics.data.sharpeRatio.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Retorno ajustado por riesgo</p>
              </div>
              <div className="p-4 bg-danger-50 rounded-lg border border-danger-200">
                <p className="text-xs text-danger-600 mb-1">Maximum Drawdown</p>
                <p className="text-2xl font-bold text-danger-700">
                  {formatPercentage(riskMetrics.data.maxDrawdown.maxDrawdownPercentage)}
                </p>
                <p className="text-xs text-danger-600 mt-1">Peor caída histórica</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">VaR 95%</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(riskMetrics.data.var95.percentile)}</p>
                <p className="text-xs text-gray-500 mt-1">Pérdida máxima esperada</p>
              </div>
              {riskMetrics.data.diversification && (
                <>
                  <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                    <p className="text-xs text-success-600 mb-1">Assets Efectivos</p>
                    <p className="text-2xl font-bold text-success-700">
                      {riskMetrics.data.diversification.effectiveAssets.toFixed(1)}
                    </p>
                    <p className="text-xs text-success-600 mt-1">Diversificación</p>
                  </div>
                  <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                    <p className="text-xs text-success-600 mb-1">Score Diversificación</p>
                    <p className="text-2xl font-bold text-success-700">
                      {riskMetrics.data.diversification.diversificationScore.toFixed(0)}%
                    </p>
                    <p className="text-xs text-success-600 mt-1">0-100 (ideal: 100)</p>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title="Distribución por Tipo"
          subtitle="Desglose por categoría de activo"
          className="shadow-md"
        >
          {distributionLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loading />
            </div>
          ) : distribution?.data?.byType?.length > 0 ? (
            <PieChart
              data={distribution.data.byType.map(item => ({
                name: ASSET_TYPE_LABELS[item.type] || item.type,
                value: item.value,
              }))}
              currency={currency}
              height={260}
            />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Sin datos de distribución</p>
            </div>
          )}
        </Card>

        <Card
          title="Distribución por Cartera"
          subtitle="Asignación entre carteras"
          className="shadow-md"
        >
          {distributionLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loading />
            </div>
          ) : distribution?.data?.byPortfolio?.length > 0 ? (
            <PieChart
              data={distribution.data.byPortfolio.map(item => ({
                name: item.portfolioName || 'Independiente',
                value: item.value,
                color: item.color,
              }))}
              currency={currency}
              height={260}
            />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Sin datos de carteras</p>
            </div>
          )}
        </Card>
      </div>

      <Card title="Mejores y Peores Activos" subtitle="Rendimiento de activos" className="shadow-md">
        {topPerformersLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loading />
          </div>
        ) : topPerformers?.data?.length > 0 ? (
          <div className="space-y-5">
            {topPerformers.data.some(asset => asset.profitLossPercentage > 0) && (
              <div>
                <h3 className="text-base font-bold text-success-700 mb-3 flex items-center gap-2">
                  Top Ganadores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topPerformers.data
                    .filter(asset => asset.profitLossPercentage > 0)
                    .slice(0, 5)
                    .map((asset) => (
                      <div key={asset._id} className="flex items-center justify-between p-3 bg-success-50 rounded-lg border border-success-200 hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{asset.name}</p>
                          <p className="text-xs text-gray-600">{asset.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-success-700">
                            {getProfitLossPrefix(asset.profitLoss)}
                            {formatPercentage(asset.profitLossPercentage)}
                          </p>
                          <p className="text-xs text-gray-600">
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
                <h3 className="text-base font-bold text-danger-700 mb-3 flex items-center gap-2">
                  Top Perdedores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topPerformers.data
                    .filter(asset => asset.profitLossPercentage < 0)
                    .slice(0, 5)
                    .map((asset) => (
                      <div key={asset._id} className="flex items-center justify-between p-3 bg-danger-50 rounded-lg border border-danger-200 hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{asset.name}</p>
                          <p className="text-xs text-gray-600">{asset.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-danger-700">
                            {formatPercentage(asset.profitLossPercentage)}
                          </p>
                          <p className="text-xs text-gray-600">
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
          <div className="text-center py-10">
            <p className="text-gray-500 text-base">Sin datos de rendimiento</p>
          </div>
        )}
      </Card>

      <Card title="Línea de Tiempo de Inversiones" subtitle="Historial de compras y ventas" className="shadow-md">
        {timelineLoading ? (
          <div className="flex items-center justify-center py-10">
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
            height={260}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Sin datos de transacciones</p>
          </div>
        )}
      </Card>

      {/* ROI Comparison Chart */}
      {topPerformers?.data?.length > 0 && (
        <Card title="Comparación de ROI por Activo" subtitle="Retorno de inversión comparativo" className="shadow-md">
          <BarChart
            data={topPerformers.data.map(asset => ({
              name: asset.symbol,
              roi: asset.profitLossPercentage,
              profitLoss: asset.profitLoss,
            }))}
            bars={[
              { dataKey: 'roi', name: 'ROI (%)', color: '#3b82f6' },
            ]}
            xAxisKey="name"
            height={280}
            currency={currency}
            showGrid={true}
          />
          <div className="mt-3 text-xs text-gray-500 text-center">
            Muestra el retorno de inversión (ROI) de cada activo en porcentaje
          </div>
        </Card>
      )}
    </div>
  );
};
