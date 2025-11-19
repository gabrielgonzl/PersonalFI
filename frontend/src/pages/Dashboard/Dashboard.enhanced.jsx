import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Briefcase,
  Plus,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAnalyticsOverview, usePerformanceData, useDistributionData } from '../../hooks/useAnalytics';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useAssets } from '../../hooks/useAssets.enhanced';
import { useApp } from '../../context/AppContext';

import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonDashboard, SkeletonKPICard } from '../../components/common/Skeleton';

import { PortfolioCard } from '../../components/features/PortfolioCard';
import { AssetCard } from '../../components/features/AssetCard';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart as PieChartComponent } from '../../components/charts/PieChart';

import { formatCurrency } from '../../utils/formatters';

/**
 * Enhanced Dashboard with:
 * - Minimalist, professional design
 * - Skeleton loading states
 * - Subtle animations
 * - Prefetching on hover
 * - Optimized queries
 */
export const DashboardEnhanced = () => {
  const navigate = useNavigate();
  const { currency } = useApp();

  // Fetch data with optimized queries
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useAnalyticsOverview();

  const { data: performance, isLoading: performanceLoading } = usePerformanceData({
    period: '30d',
  });

  const { data: distribution, isLoading: distributionLoading } = useDistributionData();

  const { data: portfoliosData, isLoading: portfoliosLoading } = usePortfolios();

  const { data: assetsData, isLoading: assetsLoading, prefetchAsset } = useAssets({
    limit: 6,
  });

  // Handle error state
  if (overviewError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage error={overviewError} />
      </div>
    );
  }

  // Show skeleton while loading
  if (overviewLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SkeletonDashboard />
      </div>
    );
  }

  const portfolios = portfoliosData?.data || [];
  const assets = assetsData?.data || [];
  const summary = overview?.data?.summary || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 pb-6">
          {/* Header - Sobrio y profesional */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/assets/create')}
                >
                  Nuevo Activo
                </Button>
                <Button
                  leftIcon={<Briefcase className="w-4 h-4" />}
                  onClick={() => navigate('/analytics')}
                >
                  Analíticas
                </Button>
              </div>
            </div>
          </header>

          {/* KPI Cards - Diseño sobrio */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Valor Total"
              value={formatCurrency(summary.totalValue || 0, currency)}
              icon={<DollarSign className="w-5 h-5" />}
              iconColor="text-primary-600 dark:text-primary-400"
              iconBg="bg-primary-50 dark:bg-primary-900/20"
            />

            <KPICard
              title="Ganancia/Pérdida"
              value={formatCurrency(summary.profitLoss || 0, currency)}
              change={summary.profitLossPercentage}
              icon={
                summary.profitLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )
              }
              iconColor={
                summary.profitLoss >= 0
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-danger-600 dark:text-danger-400'
              }
              iconBg={
                summary.profitLoss >= 0
                  ? 'bg-success-50 dark:bg-success-900/20'
                  : 'bg-danger-50 dark:bg-danger-900/20'
              }
            />

            <KPICard
              title="Total Invertido"
              value={formatCurrency(summary.totalInvested || 0, currency)}
              icon={<Wallet className="w-5 h-5" />}
              iconColor="text-info-600 dark:text-info-400"
              iconBg="bg-info-50 dark:bg-info-900/20"
            />

            <KPICard
              title="Activos"
              value={summary.assetsCount || 0}
              subtitle={`${portfolios.length} cartera${portfolios.length !== 1 ? 's' : ''}`}
              icon={<PieChart className="w-5 h-5" />}
              iconColor="text-warning-600 dark:text-warning-400"
              iconBg="bg-warning-50 dark:bg-warning-900/20"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart - 2 columns */}
            <div className="lg:col-span-2">
              <Card
                title="Evolución del Portfolio"
                subtitle="Últimos 30 días"
                className="h-full"
              >
                {performanceLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                ) : performance?.data?.length > 0 ? (
                  <LineChart
                    data={performance.data}
                    lines={[
                      {
                        dataKey: 'value',
                        name: 'Valor del Portfolio',
                        color: '#2563eb',
                      },
                    ]}
                    currency={currency}
                    height={300}
                  />
                ) : (
                  <EmptyState
                    title="Sin datos de rendimiento"
                    description="Comienza a agregar activos para ver el rendimiento de tu cartera"
                  />
                )}
              </Card>
            </div>

            {/* Distribution Chart - 1 column */}
            <div>
              <Card
                title="Distribución"
                subtitle="Por tipo de inversión"
                className="h-full"
              >
                {distributionLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                ) : distribution?.data?.byType?.length > 0 ? (
                  <PieChartComponent
                    data={distribution.data.byType}
                    nameKey="type"
                    valueKey="value"
                    currency={currency}
                    height={300}
                  />
                ) : (
                  <EmptyState
                    title="Sin datos"
                    description="Agrega activos para ver la distribución"
                  />
                )}
              </Card>
            </div>
          </div>

          {/* Portfolios Section */}
          {portfolios.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tus Carteras
                </h2>
                <Button
                  variant="ghost"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/portfolios')}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Ver Todas
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfoliosLoading ? (
                  <>
                    <SkeletonKPICard />
                    <SkeletonKPICard />
                    <SkeletonKPICard />
                  </>
                ) : (
                  portfolios.slice(0, 3).map(portfolio => (
                    <motion.div
                      key={portfolio._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PortfolioCard portfolio={portfolio} />
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Recent Assets Section */}
          {assets.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Activos Recientes
                </h2>
                <Button
                  variant="ghost"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/assets')}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Ver Todos
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assetsLoading ? (
                  <>
                    <SkeletonKPICard />
                    <SkeletonKPICard />
                    <SkeletonKPICard />
                  </>
                ) : (
                  assets.map(asset => (
                    <motion.div
                      key={asset._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onHoverStart={() => prefetchAsset(asset._id)}
                    >
                      <AssetCard asset={asset} />
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!overviewLoading && portfolios.length === 0 && assets.length === 0 && (
            <Card className="py-12">
              <EmptyState
                icon={<Wallet className="w-16 h-16 text-gray-400" />}
                title="Bienvenido a Growing"
                description="Comienza a rastrear tus inversiones creando tu primer activo y observa cómo crece tu patrimonio"
                action={
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <Button
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => navigate('/assets/create')}
                    >
                      Agregar Primer Activo
                    </Button>
                    <Button
                      variant="outline"
                      leftIcon={<Briefcase className="w-4 h-4" />}
                      onClick={() => navigate('/portfolios/create')}
                    >
                      Crear Cartera
                    </Button>
                  </div>
                }
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * KPI Card Component - Diseño minimalista y profesional
 */
const KPICard = ({
  title,
  value,
  change,
  subtitle,
  icon,
  iconColor = 'text-gray-600',
  iconBg = 'bg-gray-50',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {value}
          </p>

          {change !== undefined && change !== null && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 text-success-600 dark:text-success-400 mr-1" />
              ) : change < 0 ? (
                <TrendingDown className="w-4 h-4 text-danger-600 dark:text-danger-400 mr-1" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  change > 0
                    ? 'text-success-600 dark:text-success-400'
                    : change < 0
                    ? 'text-danger-600 dark:text-danger-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {change > 0 ? '+' : ''}
                {change.toFixed(2)}%
              </span>
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>

        <div className={`ml-4 p-3 rounded-full ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

// Export both names
export const Dashboard = DashboardEnhanced;
