import { QueryOptions, useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
import { apiClient } from '~/services/apiClient';
import { BaseResponse } from '../types';

export interface Token {
  id: string;
  token: Address;
  chainId: number;
  name: string;
  assetRefHash: string;
  seedData?: TokenSeedData | null;
  symbol: string;
  totalSupply: string;
  operator: string;
  transactionHash: string;
  blockNumber: bigint | string;
  createdBy: string;
  verifiedAt: Date | string | null;
  createdAt: Date | string;
}

export interface TokenSeedData {
  id: string;
  seedData: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Hook to fetch a single token by chainId and address
 * @param chainId - Chain ID of the token
 * @param address - Contract address of the token
 * @returns Query result with token data
 */
export function useToken(param: { chainId?: number | string; address: string | undefined }, options?: QueryOptions) {
  const { address, chainId } = param;

  const _chainId = useChainId();

  return useQuery({
    queryKey: ['token', chainId ?? _chainId, address],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<BaseResponse<Token>>(`token/chain/${chainId ?? _chainId}/address/${address}`, {
        signal,
      });
      return response.data;
    },
    enabled: !!(chainId ?? _chainId) && !!address,
  });
}
