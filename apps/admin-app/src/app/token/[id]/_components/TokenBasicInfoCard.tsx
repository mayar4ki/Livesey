import { getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Token } from '~/services/token/types';

interface TokenBasicInfoCardProps {
  token: Token;
}

export function TokenBasicInfoCard({ token }: TokenBasicInfoCardProps) {
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
          <label className="text-sm font-medium text-muted-foreground">Total Supply</label>
          <p className="text-base font-mono mt-1">{BigInt(token.totalSupply).toLocaleString('en-US')}</p>
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
