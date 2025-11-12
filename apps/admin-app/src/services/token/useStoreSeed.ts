import { useMutation } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';

type StorePendingSeedPayload = {
  assetRefHash: string;
  seedData: Array<{ key: string; value: string }>;
};

/**
 * Hook to store pending seed data in Redis (before blockchain transaction)
 * @returns Mutation function to store pending seed data
 */
export function useStorePendingSeed() {
  return useMutation({
    mutationFn: async (payload: StorePendingSeedPayload) => {
      await apiClient.post<void>('token/pending-seed', payload);
    },
  });
}
