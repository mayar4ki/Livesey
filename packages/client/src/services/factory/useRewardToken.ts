import { FactoryAbi as ABI } from "@acme/smart-contract";
import { Address } from "viem";
import { useReadContract } from "wagmi";
const ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

/**
 * Hook to fetch the reward token address from the Factory contract
 * @returns The reward token address and loading state
 */
export function useRewardToken() {
  const query = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "rewardToken",
  });

  return {
    ...query,
    rewardToken: query.data as `0x${string}` | undefined,
  };
}
