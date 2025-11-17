import api from '../config/api';

/**
 * Analytics Service
 * Handles all API calls related to analytics and reporting
 */

// Get analytics overview
export const getAnalyticsOverview = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/analytics/overview?${queryString}` : '/analytics/overview';
  return api.get(url);
};

// Get performance data
export const getPerformanceData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/analytics/performance?${queryString}` : '/analytics/performance';
  return api.get(url);
};

// Get distribution data
export const getDistributionData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/analytics/distribution?${queryString}` : '/analytics/distribution';
  return api.get(url);
};

// Get timeline data
export const getTimelineData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/analytics/timeline?${queryString}` : '/analytics/timeline';
  return api.get(url);
};

// Get top performers
export const getTopPerformers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/analytics/top-performers?${queryString}` : '/analytics/top-performers';
  return api.get(url);
};

// NUEVO: Get risk metrics
export const getRiskMetrics = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/analytics/risk-metrics?${queryString}` : '/analytics/risk-metrics';
  return api.get(url);
};

// NUEVO: Get available benchmarks
export const getAvailableBenchmarks = async () => {
  return api.get('/analytics/benchmarks');
};

// NUEVO: Get recommended benchmark
export const getRecommendedBenchmark = async () => {
  return api.get('/analytics/recommended-benchmark');
};

// NUEVO: Compare with benchmark
export const compareWithBenchmark = async (symbol, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `/analytics/benchmark/${symbol}?${queryString}`
    : `/analytics/benchmark/${symbol}`;
  return api.get(url);
};
