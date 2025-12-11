import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { ListBaseResponse } from "../interfaces";
import { Operator } from "./types";

type UseOperatorListOptions = {
  skip?: number;
  take?: number;
  search?: string;
  chainId?: number;
};

/**
 * Hook to fetch operators from the database with pagination
 * @param options Pagination and filter options
 * @returns Query result with paginated list of operators
 */
export function useOperatorList(options: UseOperatorListOptions = {}) {
  const { skip = 0, take = 10, search, chainId } = options;

  return useQuery({
    queryKey: ["operator-list", skip, take, search, chainId],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ListBaseResponse<Operator>>(
        "operator/list",
        {
          params: {
            skip,
            take,
            ...(search && { search }),
            ...(chainId && { chainId }),
          },
          signal,
        }
      );
      return response.data;
    },
  });
}
