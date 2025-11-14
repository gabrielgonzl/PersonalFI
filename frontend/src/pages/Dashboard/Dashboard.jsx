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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import AddIcon from '@mui/icons-material/Add';

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your investment tracker</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<AddIcon />}
            onClick={() => navigate('/portfolios/create')}
          >
            New Portfolio
          </Button>
          <Button
            leftIcon={<AddIcon />}
            onClick={() => navigate('/assets/create')}
          >
            New Asset
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Portfolio Value"
          value={overview?.totalValue || 0}
          change={overview?.totalValueChange}
          currency={currency}
          icon={<AccountBalanceWalletIcon className="w-6 h-6" />}
          loading={overviewLoading}
        />
        <MetricCard
          title="Total Invested"
          value={overview?.totalInvested || 0}
          currency={currency}
          icon={<TrendingUpIcon className="w-6 h-6" />}
          loading={overviewLoading}
        />
        <MetricCard
          title="Total Profit/Loss"
          value={overview?.totalProfitLoss || 0}
          change={overview?.totalProfitLossPercentage}
          currency={currency}
          icon={<ShowChartIcon className="w-6 h-6" />}
          loading={overviewLoading}
        />
        <MetricCard
          title="Number of Assets"
          value={overview?.assetCount || 0}
          currency={currency}
          icon={<PieChartIcon className="w-6 h-6" />}
          loading={overviewLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card title="Portfolio Performance" subtitle="Last 30 days">
          {performanceLoading ? (
            <Loading />
          ) : performance?.data?.length > 0 ? (
            <LineChart
              data={performance.data}
              lines={[{ dataKey: 'value', name: 'Portfolio Value', color: '#0ea5e9' }]}
              currency={currency}
              height={300}
            />
          ) : (
            <EmptyState
              title="No performance data"
              description="Start adding assets to see your portfolio performance"
            />
          )}
        </Card>

        {/* Distribution Chart */}
        <Card title="Asset Distribution" subtitle="By type">
          {distributionLoading ? (
            <Loading />
          ) : distribution?.byType?.length > 0 ? (
            <PieChart
              data={distribution.byType}
              nameKey="type"
              valueKey="value"
              currency={currency}
              height={300}
            />
          ) : (
            <EmptyState
              title="No distribution data"
              description="Add assets to see distribution breakdown"
            />
          )}
        </Card>
      </div>

      {/* Portfolios Section */}
      {portfolios.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Portfolios</h2>
            <Button variant="ghost" onClick={() => navigate('/portfolios')}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <h2 className="text-2xl font-bold text-gray-900">Recent Assets</h2>
            <Button variant="ghost" onClick={() => navigate('/assets')}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <Card>
          <EmptyState
            icon={<AccountBalanceWalletIcon />}
            title="Welcome to Growing!"
            description="Start tracking your investments by creating your first portfolio or adding an asset"
            action={
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  leftIcon={<AddIcon />}
                  onClick={() => navigate('/portfolios/create')}
                >
                  Create Portfolio
                </Button>
                <Button
                  leftIcon={<AddIcon />}
                  onClick={() => navigate('/assets/create')}
                >
                  Add Asset
                </Button>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
};
