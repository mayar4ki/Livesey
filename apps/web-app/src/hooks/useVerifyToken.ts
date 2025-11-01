import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Address, Hash } from 'viem';
import axios from 'axios';

type VerifyTokenResponse = {
  success: boolean;
  message: string;
  contractAddress: Address;
  chainId: number;
};

export const useVerifyToken = () => {
  return useMutation({
    mutationFn: async (payload: { contractAddress: Address; chainId: number; args: any[] }) =>
      await axios.post<VerifyTokenResponse>('/api/token/verify', payload),
  });
};
