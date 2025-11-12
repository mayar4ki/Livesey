import { toast } from '@acme/ui/sonner';
import { useState } from 'react';
import { useWatchBeaconProxyCreatedEvent } from '~/services/factory/useWatchBeaconProxyCreatedEvent';

export function useBeaconProxyAddress(transactionHash: string | undefined) {
  const [beaconProxyAddress, setBeaconProxyAddress] = useState<string | null>(null);

  useWatchBeaconProxyCreatedEvent({
    onLogs: (logs) => {
      if (!logs || !transactionHash) return;

      for (const log of logs) {
        if (log.transactionHash === transactionHash && log.args?.createdBeaconProxy) {
          setBeaconProxyAddress(log.args.createdBeaconProxy);
          toast.success('Token created transaction is confirmed');
          break; // Exit early once we find a match
        }
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
