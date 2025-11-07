import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { apiClient } from '~/services/apiClient';

type ContractHistoryResponse = {
  success: boolean;
  contracts: any[];
  walletAddress: string;
};

/**
 * Hook to fetch verified contracts for the connected wallet address
 * @returns Query result with list of verified contracts
 */
export function useContractHistory() {
  const { address: walletAddress, isConnected } = useAccount();

  return useQuery<ContractHistoryResponse>({
    queryKey: ['contract-history', walletAddress],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ContractHistoryResponse>(`token/history`, {
        params: {
          walletAddress,
        },
        signal,
      });
      return response.data;
    },
    enabled: isConnected && !!walletAddress,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });
}
