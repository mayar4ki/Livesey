import { useWatchTokenCreatedEvent } from '@acme/client/services/factory/useWatchTokenCreatedEvent';
import { toast } from '@acme/ui/sonner';
import { useState } from 'react';

export function useBeaconProxyAddress(transactionHash: string | undefined) {
  const [beaconProxyAddress, setBeaconProxyAddress] = useState<string | null>(null);

  useWatchTokenCreatedEvent({
    onLogs: (logs) => {
      if (!logs || !transactionHash) return;

      for (const log of logs) {
        if (log.transactionHash === transactionHash && log.args?.token) {
          setBeaconProxyAddress(log.args.token);
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
