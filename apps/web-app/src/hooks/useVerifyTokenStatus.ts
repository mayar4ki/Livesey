import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import { Address, Hash } from 'viem';
import axios from 'axios';

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
    queryFn: async () =>
      await axios.get<VerifyTokenResponse>(`/api/token/verify/status`, {
        params: {
          contractAddress,
          chainId,
        },
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
