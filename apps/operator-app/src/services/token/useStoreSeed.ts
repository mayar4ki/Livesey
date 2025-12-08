import { apiClient } from '@acme/client/services/apiClient';
import { useMutation } from '@tanstack/react-query';
import { AxiosHeaders } from 'axios';
import { useEIP712 } from '~/_hooks/useEIP712';

type StorePendingSeedPayload = {
  assetRefHash: string;
  seedData: Array<{ key: string; value: string }>;
};

/**
 * Hook to store pending seed data in Redis (before blockchain transaction)
 * @returns Mutation function to store pending seed data
 */
export function useStorePendingSeed() {
  const { makeAdminRequest } = useEIP712();

  return useMutation({
    mutationFn: async (payload: StorePendingSeedPayload) => {
      const { headers } = await makeAdminRequest('POST', '/api/token/pending-seed', payload);
      await apiClient.post<void>('token/pending-seed', payload, { headers: headers as unknown as AxiosHeaders });
    },
  });
}
