import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './config/queryClient';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Lazy load pages for better performance
const Dashboard = lazy(() =>
  import('./pages/Dashboard/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const AssetsList = lazy(() =>
  import('./pages/Assets/AssetsList').then((module) => ({ default: module.AssetsList }))
);
const AssetDetail = lazy(() =>
  import('./pages/Assets/AssetDetail').then((module) => ({ default: module.AssetDetail }))
);
const CreateAsset = lazy(() =>
  import('./pages/Assets/CreateAsset').then((module) => ({ default: module.CreateAsset }))
);
const PortfoliosList = lazy(() =>
  import('./pages/Portfolios/PortfoliosList').then((module) => ({ default: module.PortfoliosList }))
);
const PortfolioDetail = lazy(() =>
  import('./pages/Portfolios/PortfolioDetail').then((module) => ({
    default: module.PortfolioDetail,
  }))
);
const CreatePortfolio = lazy(() =>
  import('./pages/Portfolios/CreatePortfolio').then((module) => ({
    default: module.CreatePortfolio,
  }))
);
const Analytics = lazy(() =>
  import('./pages/Analytics/Analytics').then((module) => ({ default: module.Analytics }))
);
const Settings = lazy(() =>
  import('./pages/Settings/Settings').then((module) => ({ default: module.Settings }))
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppProvider>
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/" element={<Dashboard />} />

                    {/* Assets */}
                    <Route path="/assets" element={<AssetsList />} />
                    <Route path="/assets/create" element={<CreateAsset />} />
                    <Route path="/assets/:id" element={<AssetDetail />} />
                    <Route path="/assets/:id/edit" element={<CreateAsset />} />

                    {/* Portfolios */}
                    <Route path="/portfolios" element={<PortfoliosList />} />
                    <Route path="/portfolios/create" element={<CreatePortfolio />} />
                    <Route path="/portfolios/:id" element={<PortfolioDetail />} />
                    <Route path="/portfolios/:id/edit" element={<CreatePortfolio />} />

                    {/* Analytics */}
                    <Route path="/analytics" element={<Analytics />} />

                    {/* Settings */}
                    <Route path="/settings" element={<Settings />} />

                    {/* 404 - Redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>
          </AppProvider>
        </ThemeProvider>
        {/* React Query Devtools - only in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
