import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../config/queryClient';
import * as contributionService from '../services/contributionService';

/**
 * Hook to get all contributions
 */
export const useContributions = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONTRIBUTIONS, params],
    queryFn: () => contributionService.getContributions(params),
  });
};

/**
 * Hook to get single contribution by ID
 */
export const useContribution = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTION_DETAIL(id),
    queryFn: () => contributionService.getContributionById(id),
    enabled: !!id,
  });
};

/**
 * Hook to get contributions by date range
 */
export const useContributionsByDateRange = (startDate, endDate, params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONTRIBUTIONS, 'date-range', startDate, endDate, params],
    queryFn: () => contributionService.getContributionsByDateRange(startDate, endDate, params),
    enabled: !!startDate && !!endDate,
  });
};

/**
 * Hook to create contribution
 */
export const useCreateContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contributionService.createContribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
    },
  });
};

/**
 * Hook to update contribution
 */
export const useUpdateContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => contributionService.updateContribution(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTION_DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
    },
  });
};

/**
 * Hook to delete contribution
 */
export const useDeleteContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contributionService.deleteContribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
    },
  });
};
