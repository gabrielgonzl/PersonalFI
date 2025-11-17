import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard/Dashboard';
import { AssetsList } from './pages/Assets/AssetsList';
import { AssetDetail } from './pages/Assets/AssetDetail';
import { CreateAsset } from './pages/Assets/CreateAsset';
import { PortfoliosList } from './pages/Portfolios/PortfoliosList';
import { PortfolioDetail } from './pages/Portfolios/PortfolioDetail';
import { CreatePortfolio } from './pages/Portfolios/CreatePortfolio';
import { Analytics } from './pages/Analytics/Analytics';
import { Settings } from './pages/Settings/Settings';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ThemeProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Layout>
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
              </Layout>
            </BrowserRouter>
          </ThemeProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
