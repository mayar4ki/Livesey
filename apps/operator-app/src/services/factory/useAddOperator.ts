import { MutateOptions } from '@tanstack/react-query';
import { Address } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

export const useAddOperator = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function addOperator(operatorAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'addOperator',
        args: [operatorAddress],
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
    addOperator,
    data,
    ...rest,
    transactionReceipt,
  };
};
