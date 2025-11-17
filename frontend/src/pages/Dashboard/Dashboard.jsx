import { useAnalyticsOverview, usePerformanceData, useDistributionData } from '../../hooks/useAnalytics';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useAssets } from '../../hooks/useAssets';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../../components/features/MetricCard';
import { PortfolioCard } from '../../components/features/PortfolioCard';
import { AssetCard } from '../../components/features/AssetCard';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart } from '../../components/charts/PieChart';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { currency } = useApp();

  // Fetch data
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useAnalyticsOverview();
  const { data: performance, isLoading: performanceLoading } = usePerformanceData({ period: '30d' });
  const { data: distribution, isLoading: distributionLoading } = useDistributionData();
  const { data: portfoliosData, isLoading: portfoliosLoading } = usePortfolios();
  const { data: assetsData, isLoading: assetsLoading } = useAssets({ limit: 6 });

  if (overviewError) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage error={overviewError} />
      </div>
    );
  }

  const portfolios = portfoliosData?.data || [];
  const assets = assetsData?.data || [];

  // Extract summary from analytics overview
  const summary = overview?.data?.summary || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="space-y-6 pb-6">
        {/* Hero Header with Total Value */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AccountBalanceWalletIcon className="w-6 h-6 text-white" />
                <h1 className="text-lg font-semibold text-white">Valor Total del Portfolio</h1>
              </div>
              {overviewLoading ? (
                <div className="h-12 w-56 bg-white/25 rounded-lg animate-pulse" />
              ) : (
                <>
                  <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {formatCurrency(summary.totalValue || 0, currency)}
                  </p>
                  {summary.profitLoss !== undefined && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                      summary.profitLoss >= 0
                        ? 'bg-success-500/30 text-white'
                        : 'bg-danger-500/30 text-white'
                    }`}>
                      {summary.profitLoss >= 0 ? (
                        <TrendingUpIcon className="w-4 h-4" />
                      ) : (
                        <ShowChartIcon className="w-4 h-4" />
                      )}
                      <span className="font-semibold text-sm">
                        {summary.profitLoss >= 0 ? '+' : ''}
                        {formatCurrency(summary.profitLoss, currency)}
                        {' '}({summary.profitLossPercentage?.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                leftIcon={<AddIcon />}
                onClick={() => navigate('/assets/create')}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                Nuevo Activo
              </Button>
              <Button
                leftIcon={<AssessmentIcon />}
                onClick={() => navigate('/analytics')}
                className="bg-white text-primary-600 hover:bg-white/90"
              >
                Ver Analíticas
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Total Invertido"
            value={summary.totalInvested || 0}
            currency={currency}
            icon={<TrendingUpIcon className="w-5 h-5" />}
            iconColor="text-primary-600"
            loading={overviewLoading}
          />
          <MetricCard
            title="Ganancia/Pérdida Total"
            value={summary.profitLoss || 0}
            change={summary.profitLossPercentage}
            currency={currency}
            icon={<ShowChartIcon className="w-5 h-5" />}
            iconColor={summary.profitLoss >= 0 ? 'text-success-600' : 'text-danger-600'}
            loading={overviewLoading}
          />
          <MetricCard
            title="Número de Activos"
            value={summary.assetsCount || 0}
            currency={currency}
            icon={<PieChartIcon className="w-5 h-5" />}
            iconColor="text-warning-600"
            loading={overviewLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Performance Chart */}
          <Card
            title="Evolución del Portfolio"
            subtitle="Últimos 30 días"
            className="shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            {performanceLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loading />
              </div>
            ) : performance?.data?.length > 0 ? (
              <LineChart
                data={performance.data}
                lines={[{ dataKey: 'value', name: 'Valor del Portfolio', color: '#0ea5e9' }]}
                currency={currency}
                height={280}
              />
            ) : (
              <EmptyState
                title="Sin datos de rendimiento"
                description="Comienza a agregar activos para ver el rendimiento de tu cartera"
              />
            )}
          </Card>

          {/* Distribution Chart */}
          <Card
            title="Distribución de Activos"
            subtitle="Por tipo de inversión"
            className="shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            {distributionLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loading />
              </div>
            ) : distribution?.data?.byType?.length > 0 ? (
              <PieChart
                data={distribution.data.byType}
                nameKey="type"
                valueKey="value"
                currency={currency}
                height={280}
              />
            ) : (
              <EmptyState
                title="Sin datos de distribución"
                description="Agrega activos para ver el desglose de distribución"
              />
            )}
          </Card>
        </div>

        {/* Portfolios Section */}
        {portfolios.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Tus Carteras</h2>
              <Button
                variant="ghost"
                onClick={() => navigate('/portfolios')}
                className="text-primary-600 hover:text-primary-700"
              >
                Ver Todas →
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfoliosLoading ? (
                <Loading />
              ) : (
                portfolios.slice(0, 3).map((portfolio) => (
                  <PortfolioCard key={portfolio._id} portfolio={portfolio} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Recent Assets Section */}
        {assets.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Tus Activos</h2>
              <Button
                variant="ghost"
                onClick={() => navigate('/assets')}
                className="text-primary-600 hover:text-primary-700"
              >
                Ver Todos →
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assetsLoading ? (
                <Loading />
              ) : (
                assets.map((asset) => (
                  <AssetCard key={asset._id} asset={asset} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!overviewLoading && portfolios.length === 0 && assets.length === 0 && (
          <Card className="shadow-md">
            <EmptyState
              icon={<AccountBalanceWalletIcon className="w-16 h-16" />}
              title="Bienvenido a Growing"
              description="Comienza a rastrear tus inversiones creando tu primer activo y observa cómo crece tu patrimonio"
              action={
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={() => navigate('/assets/create')}
                    className="shadow-md"
                  >
                    Agregar Primer Activo
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<AddIcon />}
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
  );
};
