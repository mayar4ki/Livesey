'use client';

import { useFactoryInfo } from '@acme/client/services/factory/useFactoryInfo';
import { Card, CardContent } from '@acme/ui/card';
import { Spinner } from '@acme/ui/spinner';
import { ShieldOff } from 'lucide-react';
import { ReactNode } from 'react';
import { useAccount } from 'wagmi';

import { ConnectWallet } from '../_components/common/ConnectWallet';

type RequireAdminProps = {
  children: ReactNode;
};

export function RequireAdmin({ children }: RequireAdminProps) {
  const { address } = useAccount();
  const { adminAddress, isLoading } = useFactoryInfo();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex-1">
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <Spinner className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Verifying admin permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminAddress !== address) {
    return (
      <div className="p-4 md:p-6 flex-1">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This app is only available to the platform administrator. Please switch to the admin wallet.
            </p>
            <ConnectWallet />
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}

