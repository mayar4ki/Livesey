import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';
import { Token } from './types';

/**
 * Hook to fetch a single token by ID
 * @param id Token ID
 * @returns Query result with token data
 */
export function useToken(id: string) {
  return useQuery<Token>({
    queryKey: ['token', id],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<Token>(`token/${id}`, {
        signal,
      });
      return response.data;
    },
    enabled: !!id,
  });
}
