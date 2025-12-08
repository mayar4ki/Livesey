import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import { useRewardToken } from './useRewardToken';

/**
 * Hook to fetch the reward token info (symbol and decimals) from the reward token contract
 * @returns The reward token address, symbol, decimals and loading state
 */
export function useRewardTokenInfo() {
  const { rewardToken, isLoading: isLoadingAddress } = useRewardToken();

  const { data, isLoading: isLoadingInfo } = useReadContracts({
    contracts: [
      {
        address: rewardToken,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address: rewardToken,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ],
    query: {
      enabled: !!rewardToken,
    },
  });

  const symbol = data?.[0]?.result as string | undefined;
  const decimals = data?.[1]?.result as number | undefined;

  return {
    rewardToken,
    symbol,
    decimals,
    isLoading: isLoadingAddress || isLoadingInfo,
  };
}

