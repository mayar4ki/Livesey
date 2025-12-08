import { apiClient } from "@acme/client/services/apiClient";
import { useQuery } from "@tanstack/react-query";

import { ListBaseResponse } from "../interfaces";
import { Proposal } from "./useProposal";

export interface UseProposalsOptions {
  skip?: number;
  take?: number;
}

/**
 * Hook to fetch proposals by token ID with pagination
 * @param tokenId - The ID of the token
 * @param options - Pagination options (page, pageSize)
 * @returns Query result with proposals data and pagination info
 */
export function useProposals(
  tokenId: string | undefined,
  options: UseProposalsOptions = {}
) {
  const { skip = 0, take = 10 } = options;

  return useQuery({
    queryKey: ["proposals", tokenId, skip, take],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<Proposal>>(
        `proposal/token/${tokenId}`,
        {
          params: {
            skip,
            take,
          },
          signal,
        }
      );
      return response.data;
    },
    enabled: !!tokenId,
  });
}
