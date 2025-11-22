import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEIP712 } from '~/_hooks/useEIP712';
import { apiClient } from '~/services/apiClient';

export interface CancelLimitOrderParams {
  orderHash: string;
  chainId: number;
}

/**
 * Hook to cancel a limit order
 * Authentication is handled via EIP-712 signature in the Authorization header
 * @returns Mutation function to cancel a limit order
 */
export function useCancelLimitOrder() {
  const queryClient = useQueryClient();
  const { makeSignatureRequest } = useEIP712();

  return useMutation({
    mutationFn: async ({ orderHash, chainId }: CancelLimitOrderParams) => {
      // Get EIP-712 signature headers for API authentication
      // Note: use POST method as EIP712 doesn't support PATCH
      const authHeaders = await makeSignatureRequest('PATCH', `/api/limit-order/${orderHash}/${chainId}/cancel`, {});

      // Make the API request
      const response = await apiClient.patch(
        `limit-order/${orderHash}/${chainId}/cancel`,
        {},
        {
          headers: authHeaders.headers,
        }
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate limit orders queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['limit-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-limit-orders'] });
      queryClient.invalidateQueries({ queryKey: ['limit-order'] });
    },
  });
}
