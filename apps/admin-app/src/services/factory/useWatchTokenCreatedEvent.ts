import { UseWatchContractEventParameters, useWatchContractEvent } from 'wagmi';
import { ABI } from '~/_config/smart-contracts/Factory/abi';
import { ADDRESS } from '~/_config/smart-contracts/Factory/address';

export const useWatchTokenCreatedEvent = (params: UseWatchContractEventParameters<typeof ABI, 'TokenCreated'>) => {
  useWatchContractEvent({
    ...params,
    address: ADDRESS,
    abi: ABI,
    eventName: 'TokenCreated',
  });
};
