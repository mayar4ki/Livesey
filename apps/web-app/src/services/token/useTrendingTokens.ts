import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';

export interface TokenSeedData {
  id: string;
  seedData: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Token {
  id: string;
  contractAddress: string;
  chainId: number;
  name: string;
  assetRefHash: string;
  seedData?: TokenSeedData | null;
  symbol: string;
  totalSupply: string;
  transactionHash: string;
  blockNumber: bigint | string;
  deployerAddress: string;
  verifiedAt: Date | string | null;
  deployedAt: Date | string;
}

export interface BaseResponse<T> {
  data: T;
}

export interface ListBaseResponse<T> extends BaseResponse<T[]> {
  pagination?: Pagination;
}

export interface Pagination {
  skip: number;
  take: number;
  total: number;
}

type UseTrendingTokensOptions = {
  skip?: number;
  take?: number;
};

/**
 * Hook to fetch trending tokens from the backend
 * @param options Pagination options
 * @returns Query result with paginated list of trending tokens
 */
export function useTrendingTokens(options: UseTrendingTokensOptions = {}) {
  const { skip = 0, take = 12 } = options;

  return useQuery({
    queryKey: ['trending-tokens', skip, take],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<Token>>(`token/list`, {
        params: {
          skip,
          take,
        },
        signal,
      });
      return response.data;
    },
  });
}
