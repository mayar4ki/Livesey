import { MutateOptions } from '@tanstack/react-query';
import { Address } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import type { WriteContractParameters } from 'wagmi/actions';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

type UpgradeBeaconWriteParams = WriteContractParameters<typeof ABI, '_dangerous_upgrade_upgradeable_beacon_implementation'>;
type UpgradeBeaconArgs = NonNullable<UpgradeBeaconWriteParams['args']>;

export const useUpgradeBeacon = () => {
  const { writeContract, data, ...rest } = useWriteContract();

  function upgradeBeacon(newImplementation: Address, options?: MutateOptions) {
    writeContract(
      {
        address: ADDRESS,
        abi: ABI,
        functionName: '_dangerous_upgrade_upgradeable_beacon_implementation',
        args: [newImplementation],
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
    upgradeBeacon,
    data,
    ...rest,
    transactionReceipt,
  };
};
