import { Badge } from '@acme/ui/badge';
import { CopyButton } from '@acme/ui/bootstrapped/copy-button';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Separator } from '@acme/ui/separator';
import { Wallet } from 'lucide-react';
import { Token } from '~/services/token/types';

interface TokenContractDetailsCardProps {
  tokenInfo: Token;
  chainId: number;
}

export function TokenContractDetailsCard({ tokenInfo, chainId }: TokenContractDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contract Details</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Identity */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-3">Token Identity</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                <p className="text-base font-semibold mt-1">{tokenInfo.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Symbol</label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-sm font-medium">
                    {tokenInfo.symbol}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Supply</label>
                <p className="text-base font-mono font-semibold mt-1">{BigInt(tokenInfo.totalSupply).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Addresses */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Addresses
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Token Address</label>
                  <CopyButton
                    textToCopy={tokenInfo.token}
                    successMessage="Token address copied"
                    errorMessage="Failed to copy"
                    title="Copy address"
                    className="h-7 w-7 p-0"
                  />
                </div>
                <div className="mt-1">
                  <ExplorerLink hash={tokenInfo.token} chainId={chainId} showFull />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Operator</label>
                  <CopyButton
                    textToCopy={tokenInfo.operator}
                    successMessage="Operator address copied"
                    errorMessage="Failed to copy"
                    title="Copy address"
                    className="h-7 w-7 p-0"
                  />
                </div>
                <div className="mt-1">
                  <ExplorerLink hash={tokenInfo.operator} chainId={chainId} showFull />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</label>
                  <CopyButton
                    textToCopy={tokenInfo.createdBy}
                    successMessage="Operator address copied"
                    errorMessage="Failed to copy"
                    title="Copy address"
                    className="h-7 w-7 p-0"
                  />
                </div>
                <div className="mt-1">
                  <ExplorerLink hash={tokenInfo.createdBy} chainId={chainId} showFull />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Asset Reference */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-3">Transaction Hash</h4>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hash</label>
                <CopyButton
                  textToCopy={tokenInfo.transactionHash}
                  successMessage="Hash copied"
                  errorMessage="Failed to copy"
                  title="Copy hash"
                  className="h-7 w-7 p-0"
                />
              </div>
              <div className="mt-1">
                <code className="text-xs font-mono bg-muted px-3 py-2.5 rounded-md break-all block border border-border">
                  {tokenInfo.transactionHash}
                </code>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
