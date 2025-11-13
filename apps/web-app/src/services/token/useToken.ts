import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';
import { BaseResponse, Token } from './useTrendingTokens';

/**
 * Hook to fetch a single token by chainId and address
 * @param chainId - Chain ID of the token
 * @param address - Contract address of the token
 * @returns Query result with token data
 */
export function useToken(chainId: number | string, address: string | undefined) {
  return useQuery({
    queryKey: ['token', chainId, address],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<BaseResponse<Token>>(
        `token/chain/${chainId}/address/${address}`,
        {
          signal,
        }
      );
      return response.data;
    },
    enabled: !!chainId && !!address,
  });
}

