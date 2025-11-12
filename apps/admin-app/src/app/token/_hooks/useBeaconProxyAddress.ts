import { toast } from '@acme/ui/sonner';
import { useState } from 'react';
import { useWatchBeaconProxyCreatedEvent } from '~/services/factory/useWatchBeaconProxyCreatedEvent';

export function useBeaconProxyAddress(transactionHash: string | undefined) {
  const [beaconProxyAddress, setBeaconProxyAddress] = useState<string | null>(null);

  useWatchBeaconProxyCreatedEvent({
    onLogs: (logs) => {
      if (logs?.[0] && logs[0].transactionHash === transactionHash && logs[0].args.createdBeaconProxy) {
        setBeaconProxyAddress(logs[0].args.createdBeaconProxy);
        toast.success('Token created transaction is confirmed');
      }
    },
    enabled: !!transactionHash && !!!beaconProxyAddress,
  });

  const resetBeaconProxyAddress = () => {
    setBeaconProxyAddress(null);
  };

  return {
    beaconProxyAddress,
    resetBeaconProxyAddress,
  };
}
