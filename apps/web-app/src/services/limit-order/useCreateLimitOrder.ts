import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

import { useEIP712 } from '~/_hooks/useEIP712';
import { apiClient } from '~/services/apiClient';
import { use1inchCreateLimitOrder } from '../1inche/use1inchCreateLimitOrder';
import { Token } from '../token/useToken';

export enum LimitOrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface LimitOrder {
  id: string;
  orderHash: string;
  maker: string;
  makeToken: string;
  takeToken: string;
  makeAmount: string;
  takeAmount: string;
  signature: string;
  nonce: string;
  salt: string;
  expiration: string;
  chainId: number;
  status: 'pending' | 'filled' | 'cancelled' | 'expired';
  tokenId?: string | null;
  token?: Token | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  type: LimitOrderType;
}

export interface CreateLimitOrderRequest {
  makeToken: string;
  takeToken: string;
  makeAmount: string;
  takeAmount: string;
  makeTokenDecimals: number;
  takeTokenDecimals: number;
  expiration: number; // Unix timestamp (seconds)
}

/**
 * Hook to create a new limit order
 * This hook handles the complete flow:
 * 1. Creates and signs the 1inch limit order
 * 2. Sends it to the backend with EIP-712 authentication
 * @returns Mutation function to create a limit order
 */
export function useCreateLimitOrder() {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { makeSignatureRequest } = useEIP712();
  const { createLimitOrder: create1inchCreateLimitOrder } = use1inchCreateLimitOrder();

  const mm = useMutation({
    mutationFn: async (data: CreateLimitOrderRequest) => {
      // Step 1: Create and sign the 1inch limit order
      const { orderHash, signature, nonce, order, expiration } = await create1inchCreateLimitOrder({
        makeToken: data.makeToken,
        takeToken: data.takeToken,
        makeAmount: data.makeAmount,
        takeAmount: data.takeAmount,
        makeTokenDecimals: data.makeTokenDecimals,
        takeTokenDecimals: data.takeTokenDecimals,
        expiration: data.expiration,
      });

      // Step 2: Prepare the payload for the backend
      const backendPayload = {
        orderHash,
        makeToken: data.makeToken,
        takeToken: data.takeToken,
        makeAmount: order.makingAmount.toString(),
        takeAmount: order.takingAmount.toString(),
        signature,
        nonce: nonce.toString(), // Convert BigInt to string for JSON serialization
        salt: order.salt.toString(),
        expiration: Number(expiration),
        chainId,
      };

      // Step 3: Get EIP-712 signature headers for API authentication
      const authHeaders = await makeSignatureRequest('POST', '/api/limit-order', backendPayload);

      // Step 4: Send to backend
      const response = await apiClient.post('limit-order', backendPayload, {
        headers: authHeaders.headers,
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate limit orders queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['limit-orders'] });
      queryClient.invalidateQueries({ queryKey: ['limit-order'] });
    },
  });

  return mm;
}
