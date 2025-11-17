import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../config/queryClient';
import * as portfolioService from '../services/portfolioService';

/**
 * Hook to get all portfolios
 */
export const usePortfolios = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PORTFOLIOS, params],
    queryFn: () => portfolioService.getPortfolios(params),
  });
};

/**
 * Hook to get single portfolio by ID
 */
export const usePortfolio = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.PORTFOLIO_DETAIL(id),
    queryFn: () => portfolioService.getPortfolioById(id),
    enabled: !!id,
  });
};

/**
 * Hook to get portfolio allocation
 */
export const usePortfolioAllocation = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.PORTFOLIO_ALLOCATION(id),
    queryFn: () => portfolioService.getPortfolioAllocation(id),
    enabled: !!id,
  });
};

/**
 * Hook to create portfolio
 */
export const useCreatePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: portfolioService.createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
    },
  });
};

/**
 * Hook to update portfolio
 */
export const useUpdatePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => portfolioService.updatePortfolio(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO_DETAIL(variables.id) });
    },
  });
};

/**
 * Hook to delete portfolio
 */
export const useDeletePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: portfolioService.deletePortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
    },
  });
};

/**
 * Hook to add cash to portfolio
 */
export const useAddCashToPortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => portfolioService.addCashToPortfolio(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO_DETAIL(variables.id) });
    },
  });
};

/**
 * Hook to distribute cash
 */
export const useDistributeCash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => portfolioService.distributeCash(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO_DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS });
    },
  });
};

/**
 * Hook to rebalance portfolio
 */
export const useRebalancePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => portfolioService.rebalancePortfolio(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO_DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO_ALLOCATION(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS });
    },
  });
};
