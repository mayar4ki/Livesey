import { MutateOptions } from '@tanstack/react-query';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import type { WriteContractParameters } from 'wagmi/actions';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

type CreateBeaconProxyWriteParams = WriteContractParameters<typeof ABI, 'createToken'>;
type CreateBeaconProxyArgs = NonNullable<CreateBeaconProxyWriteParams['args']>;

export const useCreateToken = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function createToken(args: CreateBeaconProxyArgs, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'createToken',
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
    createToken,
    data,
    ...rest,
    transactionReceipt,
  };
};
