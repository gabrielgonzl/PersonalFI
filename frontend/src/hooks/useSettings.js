import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../config/queryClient';
import * as settingsService from '../services/settingsService';

/**
 * Hook to get settings
 */
export const useSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SETTINGS,
    queryFn: settingsService.getSettings,
    staleTime: Infinity, // Settings rarely change
  });
};

/**
 * Hook to update settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
    },
  });
};
