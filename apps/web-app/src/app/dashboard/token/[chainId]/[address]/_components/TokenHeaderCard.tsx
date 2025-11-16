'use client';

import { formatTokenBalance, getChainUIName, getExplorerUrl } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Button } from '@acme/ui/button';
import { Card, CardContent } from '@acme/ui/card';
import { CheckCircle2, ExternalLink, Plus } from 'lucide-react';
import { Token } from '~/services/token/useTrendingTokens';

type TokenHeaderCardProps = {
  token: Token;
  onAddToWallet: () => void;
  isAddingToWallet: boolean;
  decimals?: number;
  isLoadingDecimals?: boolean;
};

export function TokenHeaderCard({ token, onAddToWallet, isAddingToWallet, decimals, isLoadingDecimals }: TokenHeaderCardProps) {
  const explorerUrl = getExplorerUrl(token.contractAddress as `0x${string}`, token.chainId);
  const formattedTotalSupply = formatTokenBalance(token.totalSupply, decimals !== undefined ? Number(decimals) : 1, 0);
  const deployedDate = new Date(token.deployedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Token Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              <h1 className="text-xl font-bold truncate">{token.name}</h1>
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 shrink-0">
                {token.symbol}
              </Badge>
              {token.verifiedAt && (
                <Badge variant="default" className="text-xs flex items-center gap-1 px-2 py-0.5 shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs px-2 py-0.5 shrink-0">
                {getChainUIName(token.chainId)}
              </Badge>
            </div>

            {/* Details inline */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">Supply:</span>
                <span className="font-mono text-xs">{isLoadingDecimals ? 'Loading...' : formattedTotalSupply}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">Contract:</span>
                <ExplorerLink hash={token.contractAddress as `0x${string}`} chainId={token.chainId} className="text-xs" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">Deployed:</span>
                <span className="text-xs">{deployedDate}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={onAddToWallet} disabled={isAddingToWallet} size="sm" variant="default" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add to Wallet
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
