import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';
import { BaseResponse } from './useCreateProposal';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  duration: number;
  blockNumber: bigint | string;
  createdAt: Date | string;
  expiresAt: Date | string;
  tokenId: string;
  createdBy: string;
  votes?: Vote[];
}

export interface Vote {
  id: string;
  proposalId: string;
  createdBy: string;
  votingPower: bigint | string;
  choice: boolean; // true = yes/for, false = no/against
  createdAt: Date | string;
}

/**
 * Hook to fetch a single proposal by ID
 * @param proposalId - The ID of the proposal
 * @returns Query result with proposal data
 */
export function useProposal(proposalId: string | undefined) {
  return useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<BaseResponse<Proposal>>(`proposal/${proposalId}`, {
        signal,
      });
      return response.data;
    },
    enabled: !!proposalId,
  });
}
