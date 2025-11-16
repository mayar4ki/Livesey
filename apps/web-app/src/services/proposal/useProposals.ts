import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';

import { ListBaseResponse } from '../types';
import { Proposal } from './useProposal';

export interface UseProposalsOptions {
  skip?: number;
  take?: number;
}

/**
 * Hook to fetch proposals by deployed token ID with pagination
 * @param deployedTokenId - The ID of the deployed token
 * @param options - Pagination options (page, pageSize)
 * @returns Query result with proposals data and pagination info
 */
export function useProposals(deployedTokenId: string | undefined, options: UseProposalsOptions = {}) {
  const { skip = 0, take = 10 } = options;

  return useQuery({
    queryKey: ['proposals', deployedTokenId, skip, take],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<Proposal>>(`proposal/token/${deployedTokenId}`, {
        params: {
          skip,
          take,
        },
        signal,
      });
      return response.data;
    },
    enabled: !!deployedTokenId,
  });
}
