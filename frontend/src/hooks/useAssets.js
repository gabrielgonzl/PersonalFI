import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../config/queryClient';
import * as assetService from '../services/assetService';

/**
 * Hook to get all assets
 */
export const useAssets = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ASSETS, params],
    queryFn: () => assetService.getAssets(params),
  });
};

/**
 * Hook to get single asset by ID
 */
export const useAsset = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.ASSET_DETAIL(id),
    queryFn: () => assetService.getAssetById(id),
    enabled: !!id,
  });
};

/**
 * Hook to get asset contributions
 */
export const useAssetContributions = (id, params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ASSET_CONTRIBUTIONS(id), params],
    queryFn: () => assetService.getAssetContributions(id, params),
    enabled: !!id,
  });
};

/**
 * Hook to get asset performance
 */
export const useAssetPerformance = (id, params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ASSET_PERFORMANCE(id), params],
    queryFn: () => assetService.getAssetPerformance(id, params),
    enabled: !!id,
  });
};

/**
 * Hook to create asset
 */
export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetService.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
    },
  });
};

/**
 * Hook to update asset
 */
export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => assetService.updateAsset(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSET_DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
    },
  });
};

/**
 * Hook to delete asset
 */
export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetService.deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
    },
  });
};

/**
 * Hook to update asset price
 */
export const useUpdateAssetPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => assetService.updateAssetPrice(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSET_DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSET_PERFORMANCE(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
    },
  });
};
