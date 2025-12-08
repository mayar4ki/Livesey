import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { ListBaseResponse } from "../interfaces";
import { Token } from "./types";

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
    queryKey: ["trending-tokens", skip, take],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<Token>>(
        `token/list`,
        {
          params: {
            skip,
            take,
          },
          signal,
        }
      );
      return response.data;
    },
  });
}
