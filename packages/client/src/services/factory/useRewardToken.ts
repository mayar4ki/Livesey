import { useReadContract } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

/**
 * Hook to fetch the reward token address from the Factory contract
 * @returns The reward token address and loading state
 */
export function useRewardToken() {
  const query = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'rewardToken',
  });

  return {
    ...query,
    rewardToken: query.data as `0x${string}` | undefined,
  };
}
