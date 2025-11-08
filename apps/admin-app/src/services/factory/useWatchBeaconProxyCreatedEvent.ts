import { UseWatchContractEventParameters, useWatchContractEvent } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

export const useWatchBeaconProxyCreatedEvent = (params: UseWatchContractEventParameters<typeof ABI, 'BeaconProxyCreated'>) => {
  useWatchContractEvent({
    ...params,
    address: ADDRESS,
    abi: ABI,
    eventName: 'BeaconProxyCreated',
  });
};
