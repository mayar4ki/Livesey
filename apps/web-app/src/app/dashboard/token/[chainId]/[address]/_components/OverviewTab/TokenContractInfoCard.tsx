'use client';

import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Token } from '~/services/token/useToken';

type TokenContractInfoCardProps = {
  token: Token;
};

export function TokenContractInfoCard({ token }: TokenContractInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Contract Address</label>
          <div className="mt-1">
            <ExplorerLink hash={token.token} chainId={token.chainId} showFull />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Deployer Address</label>
          <div className="mt-1">
            <ExplorerLink hash={token.createdBy} chainId={token.chainId} showFull />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
          <div className="mt-1">
            <ExplorerLink hash={token.transactionHash} chainId={token.chainId} showFull />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Block Number</label>
          <p className="text-base font-mono mt-1">{typeof token.blockNumber === 'bigint' ? token.blockNumber.toString() : token.blockNumber}</p>
        </div>
      </CardContent>
    </Card>
  );
}
