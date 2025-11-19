import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { QUERY_KEYS } from '../config/queryClient';
import * as assetService from '../services/assetService';

/**
 * Enhanced Assets Hooks with Optimizations:
 * - Optimized staleTime and cacheTime
 * - Prefetching capabilities
 * - Optimistic updates
 * - Smart cache invalidation
 */

/**
 * Hook to get all assets with prefetch capability
 */
export const useAssets = (params = {}, options = {}) => {
  const queryClient = useQueryClient();

  // Prefetch individual asset on hover
  const prefetchAsset = useCallback((assetId) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.ASSET_DETAIL(assetId),
      queryFn: () => assetService.getAssetById(assetId),
      staleTime: 30000, // 30 seconds
    });
  }, [queryClient]);

  const query = useQuery({
    queryKey: [...QUERY_KEYS.ASSETS, params],
    queryFn: () => assetService.getAssets(params),
    staleTime: 5 * 60 * 1000, // 5 minutes - assets don't change frequently
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });

  return {
    ...query,
    prefetchAsset,
  };
};

/**
 * Hook to get single asset by ID
 */
export const useAsset = (id, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.ASSET_DETAIL(id),
    queryFn: () => assetService.getAssetById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to get asset contributions
 */
export const useAssetContributions = (id, params = {}, options = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ASSET_CONTRIBUTIONS(id), params],
    queryFn: () => assetService.getAssetContributions(id, params),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to get asset performance
 */
export const useAssetPerformance = (id, params = {}, options = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ASSET_PERFORMANCE(id), params],
    queryFn: () => assetService.getAssetPerformance(id, params),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute - performance data updates frequently
    cacheTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to create asset with optimistic update
 */
export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetService.createAsset,

    // Optimistic update
    onMutate: async (newAsset) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ASSETS });

      // Snapshot previous value
      const previousAssets = queryClient.getQueryData(QUERY_KEYS.ASSETS);

      // Optimistically update cache
      queryClient.setQueryData(QUERY_KEYS.ASSETS, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: [
            ...(old.data || []),
            { ...newAsset, _id: `temp-${Date.now()}`, createdAt: new Date().toISOString() }
          ],
        };
      });

      // Return context with snapshot
      return { previousAssets };
    },

    // On error, rollback
    onError: (err, newAsset, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(QUERY_KEYS.ASSETS, context.previousAssets);
      }
      toast.error(err.message || 'Error al crear activo');
    },

    // On success, refetch and show success
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
      toast.success('Activo creado exitosamente');
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
    },
  });
};

/**
 * Hook to update asset with optimistic update
 */
export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => assetService.updateAsset(id, data),

    onMutate: async ({ id, data }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ASSET_DETAIL(id) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ASSETS });

      // Snapshot
      const previousAsset = queryClient.getQueryData(QUERY_KEYS.ASSET_DETAIL(id));
      const previousAssets = queryClient.getQueryData(QUERY_KEYS.ASSETS);

      // Optimistic update for detail
      queryClient.setQueryData(QUERY_KEYS.ASSET_DETAIL(id), (old) => ({
        ...old,
        data: { ...old?.data, ...data },
      }));

      // Optimistic update for list
      queryClient.setQueryData(QUERY_KEYS.ASSETS, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map(asset =>
            asset._id === id ? { ...asset, ...data } : asset
          ),
        };
      });

      return { previousAsset, previousAssets };
    },

    onError: (err, variables, context) => {
      if (context?.previousAsset) {
        queryClient.setQueryData(QUERY_KEYS.ASSET_DETAIL(variables.id), context.previousAsset);
      }
      if (context?.previousAssets) {
        queryClient.setQueryData(QUERY_KEYS.ASSETS, context.previousAssets);
      }
      toast.error(err.message || 'Error al actualizar activo');
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSET_DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
      toast.success('Activo actualizado exitosamente');
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

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ASSETS });

      const previousAssets = queryClient.getQueryData(QUERY_KEYS.ASSETS);

      // Optimistically remove from cache
      queryClient.setQueryData(QUERY_KEYS.ASSETS, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter(asset => asset._id !== id),
        };
      });

      return { previousAssets };
    },

    onError: (err, id, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(QUERY_KEYS.ASSETS, context.previousAssets);
      }
      toast.error(err.message || 'Error al eliminar activo');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
      toast.success('Activo eliminado exitosamente');
    },
  });
};

/**
 * Hook to update asset price with optimistic update
 */
export const useUpdateAssetPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => assetService.updateAssetPrice(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ASSET_DETAIL(id) });

      const previousAsset = queryClient.getQueryData(QUERY_KEYS.ASSET_DETAIL(id));

      // Optimistically update current price
      queryClient.setQueryData(QUERY_KEYS.ASSET_DETAIL(id), (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            currentPrice: data.price,
            updatedAt: new Date().toISOString(),
          },
        };
      });

      return { previousAsset };
    },

    onError: (err, variables, context) => {
      if (context?.previousAsset) {
        queryClient.setQueryData(QUERY_KEYS.ASSET_DETAIL(variables.id), context.previousAsset);
      }
      toast.error(err.message || 'Error al actualizar precio');
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSET_DETAIL(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSET_PERFORMANCE(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW });
      toast.success('Precio actualizado exitosamente');
    },
  });
};

/**
 * Hook for batch operations
 */
export const useBatchAssetOperations = () => {
  const queryClient = useQueryClient();

  const batchUpdate = useCallback(async (operations) => {
    const results = await Promise.allSettled(operations);

    // Collect affected queries
    const affectedQueries = new Set([QUERY_KEYS.ASSETS]);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const operation = operations[index];
        if (operation.assetId) {
          affectedQueries.add(QUERY_KEYS.ASSET_DETAIL(operation.assetId));
        }
        if (operation.portfolioId) {
          affectedQueries.add(QUERY_KEYS.PORTFOLIO_DETAIL(operation.portfolioId));
        }
      }
    });

    // Invalidate all affected queries
    affectedQueries.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });

    return results;
  }, [queryClient]);

  return { batchUpdate };
};
