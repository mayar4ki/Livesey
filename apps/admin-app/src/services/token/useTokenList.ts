import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';
import { Token } from './types';

// Pagination response type
type Pagination = {
  skip: number;
  take: number;
  total: number;
};

// Token list response type
type TokenListResponse = {
  data: Token[];
  pagination: Pagination;
};

// Use token list options type
type UseTokenListOptions = {
  skip?: number;
  take?: number;
  search?: string;
};

/**
 * Hook to fetch tokens from the database with pagination
 * @param options Pagination options
 * @returns Query result with paginated list of tokens
 */
export function useTokenList(options: UseTokenListOptions = {}) {
  const { skip = 0, take = 10, search } = options;

  return useQuery<TokenListResponse>({
    queryKey: ['token-list', skip, take, search],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<TokenListResponse>(`token/list`, {
        params: {
          skip,
          take,
          ...(search && { search }),
        },
        signal,
      });
      return response.data;
    },
  });
}
