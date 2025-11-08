import { MutateOptions } from '@tanstack/react-query';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import type { WriteContractParameters } from 'wagmi/actions';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

type CreateBeaconProxyWriteParams = WriteContractParameters<typeof ABI, 'createBeaconProxy'>;
type CreateBeaconProxyArgs = NonNullable<CreateBeaconProxyWriteParams['args']>;

export const useCreateBeaconProxy = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function createBeaconProxy(args: CreateBeaconProxyArgs, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'createBeaconProxy',
        args,
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
    createBeaconProxy,
    data,
    ...rest,
    transactionReceipt,
  };
};
