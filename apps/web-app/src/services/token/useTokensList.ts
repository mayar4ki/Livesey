import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/services/apiClient';
import { ListBaseResponse } from '../types';
import { Token } from './useToken';

type UseTokensListOptions = {
  skip?: number;
  take?: number;
  search?: string;
  operator?: string;
};

/**
 * Fetch tokens with pagination and optional filters.
 */
export function useTokensList(options: UseTokensListOptions = {}) {
  const { skip = 0, take = 10, search, operator } = options;

  return useQuery({
    queryKey: ['token-list', skip, take, search, operator],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<Token>>(`token/list`, {
        params: {
          skip,
          take,
          ...(search && { search }),
          ...(operator && { operator }),
        },
        signal,
      });
      return response.data;
    },
  });
}
