import { MutateOptions, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Address } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

export const usePauseToken = () => {
  const queryClient = useQueryClient();
  const { writeContract, data, ...rest } = useWriteContract();

  function pauseToken(tokenAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'pauseToken',
        args: [tokenAddress],
      },
      options as never
    );
  }

  const transactionReceipt = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: !!data,
    },
  });

  useEffect(() => {
    if (transactionReceipt.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ['readContract', { address: ADDRESS }],
      });
    }
  }, [transactionReceipt.isSuccess, queryClient]);

  return {
    pauseToken,
    data,
    ...rest,
    transactionReceipt,
  };
};

export const useUnpauseToken = () => {
  const queryClient = useQueryClient();
  const { writeContract, data, ...rest } = useWriteContract();

  function unpauseToken(tokenAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'unpauseToken',
        args: [tokenAddress],
      },
      options as never
    );
  }

  const transactionReceipt = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: !!data,
    },
  });

  useEffect(() => {
    if (transactionReceipt.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ['readContract', { address: ADDRESS }],
      });
    }
  }, [transactionReceipt.isSuccess, queryClient]);

  return {
    unpauseToken,
    data,
    ...rest,
    transactionReceipt,
  };
};
