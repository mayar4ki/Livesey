import { toast } from '@acme/ui/sonner';
import { Address } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/ERC20Implementation/abi';

/**
 * Hook to withdraw dividends from an ERC20 token with dividend functionality
 * @param tokenAddress - The address of the ERC20 token
 * @returns Functions and state for withdrawing dividends
 */
export function useWithdrawDividend(tokenAddress: Address | undefined) {
  const { writeContract, writeContractAsync, data: hash, isPending, ...rest } = useWriteContract();

  const withdraw = () => {
    writeContract(
      {
        address: tokenAddress!,
        abi: ABI,
        functionName: 'withdrawDividend',
      },
      {
        onSuccess: () => {
          toast.success('Withdrawal transaction submitted');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to withdraw dividends');
        },
      }
    );
  };

  const withdrawAsync = async () => {
    return writeContractAsync({
      address: tokenAddress!,
      abi: ABI,
      functionName: 'withdrawDividend',
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
