import { formatDateTime, getChainUIName, getExplorerUrl } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardHeader } from '@acme/ui/card';
import { Calendar, CheckCircle2, ExternalLink, Network, PauseCircle } from 'lucide-react';
import { Token } from '~/services/token/types';

interface TokenHeaderCardProps {
  token: Token;
  isPaused?: boolean;
}

export function TokenHeaderCard({ token, isPaused }: TokenHeaderCardProps) {
  return (
    <Card>
      <CardHeader className="">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{token.name}</h1>
              <Badge variant="outline" className="text-base font-semibold">
                {token.symbol}
              </Badge>
              {isPaused !== undefined && (
                <Badge variant={isPaused ? 'destructive' : 'default'} className="flex items-center gap-1.5">
                  {isPaused ? <PauseCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {isPaused ? 'Paused' : 'Active'}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Network className="h-4 w-4" />
                <span className="font-medium text-foreground">Chain:</span>
                <span>{getChainUIName(token.chainId)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-foreground">Created:</span>
                <span>{formatDateTime(token.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Button asChild variant="outline" size="sm" className="w-full md:w-auto">
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
        </div>
      </CardHeader>
    </Card>
  );
}
