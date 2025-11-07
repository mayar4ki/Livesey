import { useMutation } from '@tanstack/react-query';
import { Address } from 'viem';
import { apiClient } from '~/services/apiClient';

type VerifyTokenResponse = {
  success: boolean;
  message: string;
  contractAddress: Address;
  chainId: number;
  walletAddress: Address;
};

export type VerifyTokenPayload = {
  contractAddress: Address;
  chainId: number;
  args: any[];
  walletAddress: Address;
};

export const useVerifyToken = () => {
  return useMutation({
    mutationFn: async (payload: VerifyTokenPayload) => await apiClient.post<VerifyTokenResponse>('token/verify', payload),
  });
};
