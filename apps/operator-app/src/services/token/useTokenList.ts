import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';
import { ListBaseResponse } from '../interfaces';
import { Token } from './types';

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

  return useQuery({
    queryKey: ['token-list', skip, take, search],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<Token>>(`token/list`, {
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
