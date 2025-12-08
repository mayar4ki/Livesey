"use client";

import { useTokenApproval } from "@acme/client/services/erc20/useTokenApproval";
import { ERC20ImplementationAbi } from "@acme/smart-contract";
import { MutateOptions } from "@tanstack/react-query";
import { Address } from "viem";
import {
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

/**
 * Hook to distribute dividends for a token (operator only)
 * Handles approval of reward token and distribution in sequence
 * @param tokenAddress - Address of the token contract
 * @param rewardTokenAddress - Address of the reward token to distribute
 */
export function useDistributeDividends(
  tokenAddress: Address | undefined,
  rewardTokenAddress: Address | undefined
) {
  const {
    approveAsync,
    isPending: isApproving,
    transactionReceipt: approvalTx,
  } = useTokenApproval();
  const {
    writeContractAsync,
    data: hash,
    isPending: isDistributing,
  } = useWriteContract();
  const publicClient = usePublicClient();

  const distributeTx = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const distribute = async (
    amount: bigint,
    options?: {
      approveOptions?: MutateOptions;
      onDistributeTxSuccess?: () => void;
    }
  ) => {
    if (!tokenAddress || !rewardTokenAddress) {
      throw new Error("Token addresses are required");
    }

    // 1- Approve the token contract to spend the reward token
    const approveHash = await approveAsync(
      rewardTokenAddress,
      tokenAddress,
      amount,
      options?.approveOptions as never
    );

    await publicClient?.waitForTransactionReceipt({
      hash: approveHash,
    });

    // 2- Distribute the dividends
    const distributeHash = await writeContractAsync({
      address: tokenAddress,
      abi: ERC20ImplementationAbi,
      functionName: "distributeDividends",
      args: [amount],
    });

    await publicClient?.waitForTransactionReceipt({
      hash: distributeHash,
    });

    options?.onDistributeTxSuccess?.();

    return distributeHash;
  };

  return {
    distribute,
    isPending:
      isApproving ||
      isDistributing ||
      approvalTx.isLoading ||
      distributeTx.isLoading,
    isConfirming: approvalTx.isLoading || distributeTx.isLoading,
  };
}
