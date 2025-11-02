import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { VerifiedContract } from '@prisma/client';

type ContractHistoryResponse = {
  success: boolean;
  contracts: VerifiedContract[];
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
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('No wallet address provided');
      }

      const response = await fetch(`/api/token/history?walletAddress=${walletAddress}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch contract history');
      }

      return response.json();
    },
    enabled: isConnected && !!walletAddress,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });
}
