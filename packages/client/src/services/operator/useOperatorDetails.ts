import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { apiClient } from "../apiClient";
import { BaseResponse } from "../interfaces";
import { Operator } from "./types";

/**
 * Hook to fetch a single operator's details by chainId and address
 * @param address - Wallet address of the operator
 * @param chainId - Optional chain ID (defaults to current chain)
 * @returns Query result with operator data including name, createdAt, updatedAt
 */
export function useOperatorDetails(
  address: string | undefined,
  chainId?: number
) {
  const _chainId = useChainId();
  const effectiveChainId = chainId ?? _chainId;

  return useQuery({
    queryKey: ["operator-details", effectiveChainId, address],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<BaseResponse<Operator>>(
        `operator/${address}/${effectiveChainId}`,
        {
          signal,
        }
      );
      return response.data;
    },
    enabled: !!effectiveChainId && !!address,
  });
}
