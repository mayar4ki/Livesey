import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useEIP712 } from '~/_hooks/useEIP712';
import { apiClient } from '~/services/apiClient';
import { ListBaseResponse } from '~/services/types';
import { LimitOrder } from './useCreateLimitOrder';

export interface MyLimitOrdersQuery {
  skip?: number;
  take?: number;
  status?: 'pending' | 'filled' | 'cancelled' | 'expired';
}

/**
 * Hook to fetch current user's limit orders
 * Requires wallet connection and EIP-712 signature
 * @param query - Query parameters for filtering and pagination
 * @returns Query result with paginated list of user's limit orders
 */
export function useMyLimitOrders(query: MyLimitOrdersQuery = {}) {
  const { address, isConnected } = useAccount();
  const { makeSignatureRequest } = useEIP712();
  const { skip = 0, take = 10, status } = query;

  return useQuery({
    queryKey: ['my-limit-orders', address, skip, take, status],
    queryFn: async ({ signal }) => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      // Get EIP-712 signature headers for API authentication
      const authHeaders = await makeSignatureRequest('GET', '/api/limit-order/my-orders', {});

      const response = await apiClient.get<ListBaseResponse<LimitOrder>>('limit-order/my-orders', {
        params: {
          skip,
          take,
          ...(status && { status }),
        },
        headers: authHeaders.headers,
        signal,
      });
      return response.data;
    },
    enabled: isConnected && !!address,
  });
}
