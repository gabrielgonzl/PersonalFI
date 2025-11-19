import { lazy } from 'react';

/**
 * Lazy-loaded routes for code splitting and performance optimization
 *
 * Each route is loaded only when needed, reducing initial bundle size
 */

// Dashboard (can be eagerly loaded as it's the main page)
export const Dashboard = lazy(() =>
  import('../pages/Dashboard/Dashboard.enhanced').then(module => ({
    default: module.Dashboard,
  }))
);

// Analytics
export const Analytics = lazy(() =>
  import('../pages/Analytics/Analytics').then(module => ({
    default: module.Analytics,
  }))
);

// Assets
export const AssetsList = lazy(() =>
  import('../pages/Assets/AssetsList').then(module => ({
    default: module.AssetsList,
  }))
);

export const AssetDetail = lazy(() =>
  import('../pages/Assets/AssetDetail').then(module => ({
    default: module.AssetDetail,
  }))
);

export const CreateAsset = lazy(() =>
  import('../pages/Assets/CreateAsset').then(module => ({
    default: module.CreateAsset,
  }))
);

// Portfolios
export const PortfoliosList = lazy(() =>
  import('../pages/Portfolios/PortfoliosList').then(module => ({
    default: module.PortfoliosList,
  }))
);

export const PortfolioDetail = lazy(() =>
  import('../pages/Portfolios/PortfolioDetail').then(module => ({
    default: module.PortfolioDetail,
  }))
);

export const CreatePortfolio = lazy(() =>
  import('../pages/Portfolios/CreatePortfolio').then(module => ({
    default: module.CreatePortfolio,
  }))
);

// Settings
export const Settings = lazy(() =>
  import('../pages/Settings/Settings').then(module => ({
    default: module.Settings,
  }))
);

/**
 * Lazy-loaded heavy components
 */

// Charts (loaded only when needed)
export const HeavyCharts = {
  LineChart: lazy(() =>
    import('../components/charts/LineChart').then(module => ({
      default: module.LineChart,
    }))
  ),
  BarChart: lazy(() =>
    import('../components/charts/BarChart').then(module => ({
      default: module.BarChart,
    }))
  ),
  AreaChart: lazy(() =>
    import('../components/charts/AreaChart').then(module => ({
      default: module.AreaChart,
    }))
  ),
  PieChart: lazy(() =>
    import('../components/charts/PieChart').then(module => ({
      default: module.PieChart,
    }))
  ),
};

/**
 * Loading fallback component
 */
export const RouteLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
    </div>
  </div>
);
