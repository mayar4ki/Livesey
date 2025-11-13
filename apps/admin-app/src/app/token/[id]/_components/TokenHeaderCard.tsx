import { getChainUIName, getExplorerUrl } from '@acme/shared/utils';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { ExternalLink } from 'lucide-react';
import { Token } from '~/services/token/types';

interface TokenHeaderCardProps {
  token: Token;
}

export function TokenHeaderCard({ token }: TokenHeaderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">{token.name}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {token.symbol}
                </Badge>
                <Badge variant="secondary">{getChainUIName(token.chainId)}</Badge>
              </div>
            </CardDescription>
          </div>
          <Button asChild variant="outline">
            <a
              href={getExplorerUrl(token.transactionHash as `0x${string}`, token.chainId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              View on Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

