import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';
import { ListBaseResponse } from '~/services/types';
import { LimitOrder } from './useCreateLimitOrder';

export interface LimitOrdersByTokenQuery {
  skip?: number;
  take?: number;
  status?: 'pending' | 'filled' | 'cancelled' | 'expired';
}

export const LIMIT_ORDERS_BY_TOKEN_QUERY_KEY = 'limit-orders-by-token';

/**
 * Hook to fetch limit orders for a specific token
 * @param tokenAddress - Token contract address
 * @param chainId - Chain ID
 * @param query - Query parameters for filtering and pagination
 * @returns Query result with paginated list of limit orders for the token
 */
export function useLimitOrdersByToken(
  tokenAddress: string | undefined,
  chainId: number | undefined,
  query: LimitOrdersByTokenQuery = {}
) {
  const { skip = 0, take = 10, status } = query;

  return useQuery({
    queryKey: [LIMIT_ORDERS_BY_TOKEN_QUERY_KEY, tokenAddress, chainId, skip, take, status],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<LimitOrder>>(
        `limit-order/token/${tokenAddress}/${chainId}`,
        {
          params: {
            skip,
            take,
            ...(status && { status }),
          },
          signal,
        }
      );
      return response.data;
    },
    enabled: !!tokenAddress && !!chainId,
  });
}
