import { ERC20ImplementationAbi } from '@acme/smart-contract';
import { toast } from '@acme/ui/sonner';
import { MutateOptions } from '@tanstack/react-query';
import { Address } from 'viem';
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

/**
 * Hook to check and approve token spending for limit orders
 * For 1inch limit orders, we need to approve the Limit Order Protocol contract
 */
export function useTokenSafeApproval(token: Address) {
  const { writeContract, data, ...rest } = useWriteContract();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Approve token spending
  const approve = async (spender: Address, amount: bigint, options?: MutateOptions) => {
    const currentAllowance = await publicClient?.readContract({
      address: token,
      abi: ERC20ImplementationAbi,
      functionName: 'allowance',
      args: [address!, spender],
    });

    if (currentAllowance === undefined || currentAllowance === null) {
      toast.error('error calculation allowance');
    }

    // If we already have enough allowance, skip the approval
    if (currentAllowance !== undefined && currentAllowance !== null && currentAllowance >= amount) {
      toast.error('Approval already set. You already have enough allowance');
      return;
    }

    writeContract(
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
    approve,
    data,
    ...rest,
    transactionReceipt,
  };
}
