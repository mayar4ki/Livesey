import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { apiClient } from "../apiClient";
import { ListBaseResponse } from "../interfaces";
import { LimitOrder } from "./useCreateLimitOrder";

export interface LimitOrderListQuery {
  skip?: number;
  take?: number;
  status?: "pending" | "filled" | "cancelled" | "expired";
  makeToken?: string;
  takeToken?: string;
  chainId?: number;
  maker?: Address;
  search?: string;
}

export const LIMIT_ORDERS_QUERY_KEY = "limit-orders";

/**
 * Hook to fetch limit orders with filtering
 * @param query - Query parameters for filtering and pagination
 * @returns Query result with paginated list of limit orders
 */
export function useLimitOrders(query: LimitOrderListQuery = {}) {
  const {
    skip = 0,
    take = 10,
    status,
    makeToken,
    takeToken,
    chainId,
    maker,
    search,
  } = query;

  return useQuery({
    queryKey: [
      LIMIT_ORDERS_QUERY_KEY,
      skip,
      take,
      status,
      makeToken,
      takeToken,
      chainId,
      maker,
      search,
    ],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<LimitOrder>>(
        "limit-order",
        {
          params: {
            skip,
            take,
            ...(status && { status }),
            ...(makeToken && { makeToken }),
            ...(takeToken && { takeToken }),
            ...(chainId && { chainId }),
            ...(maker && { maker }),
            ...(search && { search }),
          },
          signal,
        }
      );
      return response.data;
    },
  });
}
