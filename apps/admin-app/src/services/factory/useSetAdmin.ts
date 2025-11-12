import { MutateOptions } from '@tanstack/react-query';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import type { WriteContractParameters } from 'wagmi/actions';
import { Address } from 'viem';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

type SetAdminWriteParams = WriteContractParameters<typeof ABI, 'setAdmin'>;
type SetAdminArgs = NonNullable<SetAdminWriteParams['args']>;

export const useSetAdmin = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function setAdmin(newAdminAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'setAdmin',
        args: [newAdminAddress],
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
    setAdmin,
    data,
    ...rest,
    transactionReceipt,
  };
};

