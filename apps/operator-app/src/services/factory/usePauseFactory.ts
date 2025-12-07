import { MutateOptions } from '@tanstack/react-query';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

export const usePauseFactory = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function pauseFactory(options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'pause',
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

  return {
    pauseFactory,
    data,
    ...rest,
    transactionReceipt,
  };
};

export const useUnpauseFactory = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function unpauseFactory(options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'unpause',
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

  return {
    unpauseFactory,
    data,
    ...rest,
    transactionReceipt,
  };
};
