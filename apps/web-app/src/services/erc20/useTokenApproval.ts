import { ERC20ImplementationAbi } from '@acme/smart-contract';
import { MutateOptions } from '@tanstack/react-query';
import { Address } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

/**
 * Hook to check and approve token spending for limit orders
 * For 1inch limit orders, we need to approve the Limit Order Protocol contract
 */
export function useTokenApproval() {
  const { writeContractAsync, data, ...rest } = useWriteContract();

  // Approve token spending
  const approveAsync = async (token: Address, spender: Address, amount: bigint, options?: MutateOptions) => {
    return writeContractAsync(
      {
        address: token,
        abi: ERC20ImplementationAbi,
        functionName: 'approve',
        args: [spender, amount],
      },
      options as never
    );
  };

  const transactionReceipt = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: !!data,
    },
  });

  return {
    approveAsync,
    data,
    ...rest,
    transactionReceipt,
  };
}
