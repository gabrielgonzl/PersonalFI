import { QueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME, QUERY_CACHE_TIME } from './constants';

// Custom error handler for queries
const queryErrorHandler = (error) => {
  // Log errors in development
  if (import.meta.env.DEV) {
    console.error('Query Error:', error);
  }

  // You can add custom error tracking here
  // Example: trackError(error);
};

// Custom mutation error handler
const mutationErrorHandler = (error) => {
  if (import.meta.env.DEV) {
    console.error('Mutation Error:', error);
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Caching configuration
      staleTime: QUERY_STALE_TIME, // 5 minutes
      cacheTime: QUERY_CACHE_TIME, // 10 minutes (renamed to gcTime in v5)
      gcTime: QUERY_CACHE_TIME, // v5 compatibility

      // Refetch configuration
      refetchOnWindowFocus: true, // Refetch when user returns to the tab
      refetchOnReconnect: true, // Refetch when internet connection is restored
      refetchOnMount: true, // Refetch when component mounts

      // Retry configuration
      retry: 2, // Retry failed queries 2 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Error handling
      onError: queryErrorHandler,

      // Network mode
      networkMode: 'online', // only run queries when online

      // Suspense (disabled by default, enable per-query if needed)
      suspense: false,
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1, // Retry failed mutations once
      retryDelay: 1000,

      // Error handling
      onError: mutationErrorHandler,

      // Network mode
      networkMode: 'online',
    },
  },
});

// Prefetch helper
export const prefetchQuery = async (queryKey, queryFn) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};

// Invalidate queries helper
export const invalidateQueries = (queryKey) => {
  return queryClient.invalidateQueries({ queryKey });
};

// Remove query helper
export const removeQuery = (queryKey) => {
  return queryClient.removeQueries({ queryKey });
};

// Query Keys - Organized by feature
export const QUERY_KEYS = {
  // Assets
  ASSETS: ['assets'],
  ASSET_DETAIL: (id) => ['assets', id],
  ASSET_CONTRIBUTIONS: (id) => ['assets', id, 'contributions'],
  ASSET_PERFORMANCE: (id) => ['assets', id, 'performance'],

  // Contributions
  CONTRIBUTIONS: ['contributions'],
  CONTRIBUTION_DETAIL: (id) => ['contributions', id],
  CONTRIBUTIONS_BY_ASSET: (assetId) => ['contributions', 'asset', assetId],
  CONTRIBUTIONS_BY_PORTFOLIO: (portfolioId) => ['contributions', 'portfolio', portfolioId],

  // Portfolios
  PORTFOLIOS: ['portfolios'],
  PORTFOLIO_DETAIL: (id) => ['portfolios', id],
  PORTFOLIO_ALLOCATION: (id) => ['portfolios', id, 'allocation'],
  PORTFOLIO_PERFORMANCE: (id) => ['portfolios', id, 'performance'],

  // Analytics
  ANALYTICS_OVERVIEW: ['analytics', 'overview'],
  ANALYTICS_PERFORMANCE: ['analytics', 'performance'],
  ANALYTICS_DISTRIBUTION: ['analytics', 'distribution'],
  ANALYTICS_TIMELINE: ['analytics', 'timeline'],
  ANALYTICS_TOP_PERFORMERS: ['analytics', 'top-performers'],

  // Settings
  SETTINGS: ['settings'],

  // Health Check
  HEALTH: ['health'],
};

// Query invalidation helpers - organized by feature
export const invalidateAssets = () => invalidateQueries(QUERY_KEYS.ASSETS);
export const invalidatePortfolios = () => invalidateQueries(QUERY_KEYS.PORTFOLIOS);
export const invalidateContributions = () => invalidateQueries(QUERY_KEYS.CONTRIBUTIONS);
export const invalidateAnalytics = () => {
  queryClient.invalidateQueries({ queryKey: ['analytics'] });
};
export const invalidateAll = () => {
  queryClient.invalidateQueries();
};
