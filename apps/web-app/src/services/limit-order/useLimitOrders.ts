import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { apiClient } from '~/services/apiClient';
import { ListBaseResponse } from '~/services/types';
import { LimitOrder } from './useCreateLimitOrder';

export interface LimitOrderListQuery {
  skip?: number;
  take?: number;
  status?: 'pending' | 'filled' | 'cancelled' | 'expired';
  makeToken?: string;
  takeToken?: string;
  chainId?: number;
  maker?: Address;
}

/**
 * Hook to fetch limit orders with filtering
 * @param query - Query parameters for filtering and pagination
 * @returns Query result with paginated list of limit orders
 */
export function useLimitOrders(query: LimitOrderListQuery = {}) {
  const { skip = 0, take = 10, status, makeToken, takeToken, chainId, maker } = query;

  return useQuery({
    queryKey: ['limit-orders', skip, take, status, makeToken, takeToken, chainId, maker],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<LimitOrder>>('limit-order', {
        params: {
          skip,
          take,
          ...(status && { status }),
          ...(makeToken && { makeToken }),
          ...(takeToken && { takeToken }),
          ...(chainId && { chainId }),
          ...(maker && { maker }),
        },
        signal,
      });
      return response.data;
    },
  });
}
