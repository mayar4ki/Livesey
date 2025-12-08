'use client';

import { useOperator } from '@acme/client/services/factory/useOperator';
import { Card, CardContent } from '@acme/ui/card';
import { Spinner } from '@acme/ui/spinner';
import { PauseCircle, ShieldOff } from 'lucide-react';
import { ReactNode } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { ConnectWallet } from '../_components/common/ConnectWallet';

type RequireOperatorProps = {
  children: ReactNode;
};

export function RequireOperator({ children }: RequireOperatorProps) {
  const { address } = useAccount();
  const accountAddress = address as Address | undefined;
  const { operator, isLoading } = useOperator(accountAddress);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex-1">
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <Spinner className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Verifying operator permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (operator?.operator !== accountAddress) {
    return (
      <div className="p-4 md:p-6 flex-1">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Operator Access Required</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This app is only available to registered operators. Please switch to an operator wallet.
            </p>
            <ConnectWallet />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (operator?.isPaused) {
    return (
      <div className="p-4 md:p-6 flex-1">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PauseCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Operator Paused</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your operator account is currently paused. Contact an administrator or switch to an active operator.
            </p>
            <ConnectWallet />
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
