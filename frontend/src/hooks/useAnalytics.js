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
