'use client';

import { formatTokenBalance, getChainUIName } from '@acme/shared/utils';
import { Badge } from '@acme/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Token } from '~/services/token/useTrendingTokens';

type TokenBasicInfoCardProps = {
  token: Token;
  decimals: number | undefined;
  isLoadingDecimals: boolean;
};

export function TokenBasicInfoCard({ token, decimals, isLoadingDecimals }: TokenBasicInfoCardProps) {
  const formattedTotalSupply = formatTokenBalance(token.totalSupply, decimals !== undefined ? Number(decimals) : 1, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Token Name</label>
          <p className="text-base font-medium mt-1">{token.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Symbol</label>
          <p className="text-base font-medium mt-1">
            <Badge variant="outline">{token.symbol}</Badge>
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Decimals</label>
          <p className="text-base mt-1">{isLoadingDecimals ? 'Loading...' : decimals !== undefined ? Number(decimals) : 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Total Supply</label>
          <p className="text-base font-mono mt-1">{formattedTotalSupply}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Chain</label>
          <p className="text-base mt-1">
            <Badge variant="secondary">{getChainUIName(token.chainId)}</Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
