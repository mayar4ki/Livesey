import { ERC20ImplementationAbi } from "@acme/smart-contract";
import { MutateOptions } from "@tanstack/react-query";
import { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

/**
 * Hook to withdraw dividends from an ERC20 token with dividend functionality
 * @param tokenAddress - The address of the ERC20 token
 * @returns Functions and state for withdrawing dividends
 */
export function useWithdrawDividend(tokenAddress: Address | undefined) {
  const {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    ...rest
  } = useWriteContract();

  const withdraw = (options: MutateOptions) => {
    writeContract(
      {
        address: tokenAddress!,
        abi: ERC20ImplementationAbi,
        functionName: "withdrawDividend",
      },
      options as never
    );
  };

  const withdrawAsync = async () => {
    return writeContractAsync({
      address: tokenAddress!,
      abi: ERC20ImplementationAbi,
      functionName: "withdrawDividend",
    });
  };

  const transactionReceipt = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  return {
    withdraw,
    withdrawAsync,
    hash,
    isPending,
    isConfirming: transactionReceipt.isLoading,
    isConfirmed: transactionReceipt.isSuccess,
    transactionReceipt,
    ...rest,
  };
}
