import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../config/queryClient';
import * as analyticsService from '../services/analyticsService';

/**
 * Hook to get analytics overview
 */
export const useAnalyticsOverview = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_OVERVIEW, params],
    queryFn: () => analyticsService.getAnalyticsOverview(params),
  });
};

/**
 * Hook to get performance data
 */
export const usePerformanceData = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_PERFORMANCE, params],
    queryFn: () => analyticsService.getPerformanceData(params),
  });
};

/**
 * Hook to get distribution data
 */
export const useDistributionData = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_DISTRIBUTION, params],
    queryFn: () => analyticsService.getDistributionData(params),
  });
};

/**
 * Hook to get timeline data
 */
export const useTimelineData = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_TIMELINE, params],
    queryFn: () => analyticsService.getTimelineData(params),
  });
};

/**
 * Hook to get top performers
 */
export const useTopPerformers = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_TOP_PERFORMERS, params],
    queryFn: () => analyticsService.getTopPerformers(params),
  });
};

/**
 * Hook to get risk metrics
 * NUEVO: Métricas de riesgo del portfolio
 */
export const useRiskMetrics = (params = {}) => {
  return useQuery({
    queryKey: ['analytics', 'risk-metrics', params],
    queryFn: () => analyticsService.getRiskMetrics(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook to get available benchmarks
 * NUEVO: Obtener benchmarks disponibles
 */
export const useBenchmarks = () => {
  return useQuery({
    queryKey: ['analytics', 'benchmarks'],
    queryFn: () => analyticsService.getAvailableBenchmarks(),
    staleTime: 60 * 60 * 1000, // 1 hora (los benchmarks no cambian frecuentemente)
  });
};

/**
 * Hook to get recommended benchmark
 * NUEVO: Obtener benchmark recomendado según assets
 */
export const useRecommendedBenchmark = () => {
  return useQuery({
    queryKey: ['analytics', 'recommended-benchmark'],
    queryFn: () => analyticsService.getRecommendedBenchmark(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook to compare with benchmark
 * NUEVO: Comparar portfolio con un benchmark específico
 */
export const useBenchmarkComparison = (symbol, params = {}) => {
  return useQuery({
    queryKey: ['analytics', 'benchmark-comparison', symbol, params],
    queryFn: () => analyticsService.compareWithBenchmark(symbol, params),
    enabled: !!symbol, // Solo ejecutar si hay un símbolo
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
