import { QueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME, QUERY_CACHE_TIME } from './constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      cacheTime: QUERY_CACHE_TIME,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query Keys
export const QUERY_KEYS = {
  // Assets
  ASSETS: ['assets'],
  ASSET_DETAIL: (id) => ['assets', id],
  ASSET_CONTRIBUTIONS: (id) => ['assets', id, 'contributions'],
  ASSET_PERFORMANCE: (id) => ['assets', id, 'performance'],

  // Contributions
  CONTRIBUTIONS: ['contributions'],
  CONTRIBUTION_DETAIL: (id) => ['contributions', id],

  // Portfolios
  PORTFOLIOS: ['portfolios'],
  PORTFOLIO_DETAIL: (id) => ['portfolios', id],
  PORTFOLIO_ALLOCATION: (id) => ['portfolios', id, 'allocation'],

  // Analytics
  ANALYTICS_OVERVIEW: ['analytics', 'overview'],
  ANALYTICS_PERFORMANCE: ['analytics', 'performance'],
  ANALYTICS_DISTRIBUTION: ['analytics', 'distribution'],
  ANALYTICS_TIMELINE: ['analytics', 'timeline'],
  ANALYTICS_TOP_PERFORMERS: ['analytics', 'top-performers'],

  // Settings
  SETTINGS: ['settings'],
};
