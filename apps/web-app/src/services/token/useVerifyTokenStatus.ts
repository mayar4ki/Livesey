import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { apiClient } from '@/services/apiClient';

type VerifyTokenResponse = {
  success: boolean;
  message: string;

  task: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
  };
};

export const useVerifyTokenStatus = ({ contractAddress, chainId }: { contractAddress: Address; chainId: number }) => {
  return useQuery({
    queryKey: ['verify-token-status', contractAddress, chainId],
    queryFn: async ({ signal }) =>
      await apiClient.get<VerifyTokenResponse>(`token/verify/status`, {
        params: {
          contractAddress,
          chainId,
        },
        signal,
      }),
    enabled: !!contractAddress && !!chainId,
    staleTime: 2 * 1000, // 2 seconds
    retry: 2,
    // refetchInterval: (query) => {
    //   // Stop refetching if status is completed or failed
    //   const data = query.state.data;
    //   const status = data?.data?.task?.status;

    //   return status === 'completed' || status === 'failed' ? false : 2 * 1000; // Continue refetching every 2 seconds
    // },
  });
};
