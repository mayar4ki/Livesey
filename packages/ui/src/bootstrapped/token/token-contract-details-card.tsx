import { Badge } from '@acme/ui/badge';
import { CopyButton } from '@acme/ui/bootstrapped/copy-button';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Separator } from '@acme/ui/separator';
import { Wallet } from 'lucide-react';
import { formatUnits } from 'viem';
import { Token } from './types';

interface TokenContractDetailsCardProps {
  token: Token;
  decimals?: number;
}

export function TokenContractDetailsCard({ token, decimals }: TokenContractDetailsCardProps) {
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
                <p className="text-base font-semibold mt-1">{token.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Symbol</label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-sm font-medium">
                    {token.symbol}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Supply</label>
                <p className="text-base font-mono font-semibold mt-1">{decimals ? formatUnits(BigInt(token.totalSupply), decimals) : '...'}</p>
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
                    textToCopy={token.token}
                    successMessage="Token address copied"
                    errorMessage="Failed to copy"
                    title="Copy address"
                    className="h-7 w-7 p-0"
                  />
                </div>
                <div className="mt-1">
                  <ExplorerLink hash={token.token} chainId={token.chainId} showFull />
                </div>
              </div>
              {token.operator && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Operator</label>
                    <CopyButton
                      textToCopy={token.operator.address}
                      successMessage="Operator address copied"
                      errorMessage="Failed to copy"
                      title="Copy address"
                      className="h-7 w-7 p-0"
                    />
                  </div>
                  <div className="mt-1">
                    <ExplorerLink hash={token.operator.address} chainId={token.chainId} showFull />
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</label>
                  <CopyButton
                    textToCopy={token.createdBy}
                    successMessage="Operator address copied"
                    errorMessage="Failed to copy"
                    title="Copy address"
                    className="h-7 w-7 p-0"
                  />
                </div>
                <div className="mt-1">
                  <ExplorerLink hash={token.createdBy} chainId={token.chainId} showFull />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Asset Reference */}

        <div>
          <h4 className="text-sm font-semibold mb-3">Transaction Hash</h4>
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hash</label>
              <CopyButton
                textToCopy={token.transactionHash}
                successMessage="Hash copied"
                errorMessage="Failed to copy"
                title="Copy hash"
                className="h-7 w-7 p-0 flex-shrink-0"
              />
            </div>
            <div className="min-w-0 mt-1 max-w-full">
              <ExplorerLink
                hash={token.transactionHash}
                chainId={token.chainId}
                showFull
                className="block text-xs font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 cursor-pointer transition-colors break-all w-full min-w-0 max-w-full"
                style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
