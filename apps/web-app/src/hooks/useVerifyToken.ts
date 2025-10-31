import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Hash } from 'viem';
import axios from 'axios';

type VerifyTokenResponse = {
  success: boolean;
  message: string;
  tx: string;
  chainId: number;
};

export const useVerifyToken = () => {
  return useMutation({
    mutationFn: async (payload: { tx: Hash; chainId: number }) => await axios.post<VerifyTokenResponse>('/api/token/verify', payload),
  });
};
