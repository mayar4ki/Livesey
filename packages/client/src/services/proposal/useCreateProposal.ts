import { apiClient } from "@acme/client/services/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserEIP712 } from "../../hooks/useUserEIP712";

export interface CreateProposalRequest {
  title: string;
  description: string;
  duration: number; // Duration in seconds
  tokenId: string;
}

/**
 * Hook to create a new proposal
 * Authentication is handled via EIP-712 signature in the Authorization header
 * @returns Mutation function to create a proposal
 */
export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { makeSignatureRequest } = useUserEIP712();

  return useMutation({
    mutationFn: async (data: CreateProposalRequest) => {
      // Get EIP-712 signature headers for API authentication
      const authHeaders = await makeSignatureRequest(
        "POST",
        "/api/proposal",
        data
      );

      // Make the API request
      const response = await apiClient.post("proposal", data, {
        headers: authHeaders.headers,
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate proposals queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal"] });
    },
  });
}
