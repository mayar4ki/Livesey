import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Address, Hash } from 'viem';
import axios from 'axios';

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
    mutationFn: async (payload: VerifyTokenPayload) => await axios.post<VerifyTokenResponse>('/api/token/verify', payload),
  });
};
