import { MutateOptions } from '@tanstack/react-query';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import type { WriteContractParameters } from 'wagmi/actions';
import { Address } from 'viem';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

type DeleteBeaconProxyWriteParams = WriteContractParameters<typeof ABI, 'deleteBeaconProxy'>;
type DeleteBeaconProxyArgs = NonNullable<DeleteBeaconProxyWriteParams['args']>;

export const useDeleteBeaconProxy = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function deleteBeaconProxy(beaconProxyAddress: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: 'deleteBeaconProxy',
        args: [beaconProxyAddress],
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
    deleteBeaconProxy,
    data,
    ...rest,
    transactionReceipt,
  };
};

