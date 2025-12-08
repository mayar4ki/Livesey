import { ERC20ImplementationAbi as ABI } from "@acme/smart-contract";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";

/**
 * Hook to fetch the withdrawable dividend amount for the connected user
 * @param tokenAddress - The address of the ERC20 token with dividend functionality
 * @returns The withdrawable dividend amount and loading state
 */
export function useWithdrawableDividend(tokenAddress: Address | undefined) {
  const { address: userAddress } = useAccount();

  const query = useReadContract({
    address: tokenAddress,
    abi: ABI,
    functionName: "withdrawableDividendOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!userAddress,
    },
  });

  return {
    ...query,
    withdrawableAmount: query.data as bigint | undefined,
  };
}
