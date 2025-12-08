import { apiClient } from "@acme/client/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserEIP712 } from "../../hooks/useUserEIP712";

export interface CreateVoteRequest {
  proposalId: string;
  choice: boolean; // true = yes/for, false = no/against
}

/**
 * Hook to create a vote on a proposal
 * Authentication is handled via EIP-712 signature in the Authorization header
 * @returns Mutation function to create a vote
 */
export function useCreateVote() {
  const queryClient = useQueryClient();
  const { makeSignatureRequest } = useUserEIP712();

  return useMutation({
    mutationFn: async (data: CreateVoteRequest) => {
      // Get EIP-712 signature headers for API authentication
      const authHeaders = await makeSignatureRequest(
        "POST",
        "/api/proposal/vote",
        data
      );

      // Make the API request
      const response = await apiClient.post("proposal/vote", data, {
        headers: authHeaders.headers,
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate proposals queries to refetch the list with updated votes
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal"] });
    },
  });
}
