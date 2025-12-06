import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useChainId, usePublicClient } from 'wagmi';

import { toast } from '@acme/ui/sonner';
import { Address, parseUnits } from 'viem';
import { useEIP712 } from '~/_hooks/useEIP712';
import { apiClient } from '~/services/apiClient';
import { use1inchCreateLimitOrder } from '../1inche/use1inchCreateLimitOrder';
import { useLimitOrderProtocolAddress } from '../1inche/useLimitOrderProtocolAddress';
import { useTokenApproval } from '../erc20/useTokenApproval';
import { Token } from '../token/useToken';
import { LIMIT_ORDERS_QUERY_KEY } from './useLimitOrders';
import { LIMIT_ORDERS_BY_TOKEN_QUERY_KEY } from './useLimitOrdersByToken';

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
  remainingMakingAmount: string;
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
  const publicClient = usePublicClient();
  const { address: limitOrderProtocolAddress } = useLimitOrderProtocolAddress();
  const { createLimitOrder: create1inchCreateLimitOrder, isPending: isCreating } = use1inchCreateLimitOrder();
  const { approveAsync, isPending: isTokenApproving, transactionReceipt: approvalTx } = useTokenApproval();

  const createLimitOrderMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { headers } = await makeSignatureRequest('POST', '/api/limit-order', payload);
      await apiClient.post('limit-order', payload, { headers });
    },
    onSuccess: () => {
      toast.success('Limit order created successfully');
      // Invalidate limit orders queries to refetch the list
      queryClient.invalidateQueries({ queryKey: [LIMIT_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LIMIT_ORDERS_BY_TOKEN_QUERY_KEY] });
    },
  });

  const createLimitOrder = async (data: CreateLimitOrderRequest) => {
    // Step 1: Approve the spend
    const hash = await approveAsync(
      data.makeToken as Address,
      limitOrderProtocolAddress!,
      parseUnits(data.makeAmount, data.makeTokenDecimals),
      {
        onSuccess: () => {
          toast.success('Transaction submitted, confirming...', {
            action: {
              label: 'Close',
              onClick: () => {},
            },
          });
        },
      }
    );

    await publicClient?.waitForTransactionReceipt({
      hash,
    });

    // Step 2: Create and sign the 1inch limit order
    const { orderHash, signature, nonce, order, expiration } = await create1inchCreateLimitOrder({
      makeToken: data.makeToken,
      takeToken: data.takeToken,
      makeAmount: data.makeAmount,
      takeAmount: data.takeAmount,
      makeTokenDecimals: data.makeTokenDecimals,
      takeTokenDecimals: data.takeTokenDecimals,
      expiration: data.expiration,
    });

    // Step 3: Prepare the payload for the backend
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

    // Step 4: submit to backend
    await createLimitOrderMutation.mutateAsync(backendPayload);
  };

  return {
    createLimitOrder,
    isPending: isCreating || createLimitOrderMutation.isPending || isTokenApproving || approvalTx.isLoading,
    isConfirming: approvalTx.isLoading,
  };
}
