'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { CopyButton } from '@acme/ui/bootstrapped/copy-button';
import { Token } from '~/services/token/useTrendingTokens';

type TokenMetadataCardProps = {
  token: Token;
};

export function TokenMetadataCard({ token }: TokenMetadataCardProps) {
  const formatSeedData = () => {
    if (!token.seedData?.seedData) return null;
    return Array.isArray(token.seedData.seedData)
      ? token.seedData.seedData.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
          acc[item.key] = item.value;
          return acc;
        }, {})
      : token.seedData.seedData;
  };

  const seedDataObj = formatSeedData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Token ID</label>
          <p className="text-base font-mono mt-1 break-all">{token.id}</p>
        </div>
        {token.assetRefHash && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-muted-foreground">Asset Reference Hash</label>
              <CopyButton
                textToCopy={token.assetRefHash}
                successMessage="Hash copied to clipboard"
                errorMessage="Failed to copy hash"
                title="Copy hash"
                className="h-8 w-8 p-0 shrink-0"
              />
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <code className="text-xs font-mono bg-muted px-3 py-2 rounded break-all flex-1 min-w-0">{token.assetRefHash}</code>
            </div>
          </div>
        )}
        {token.seedData && seedDataObj && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-muted-foreground">Seed Data</label>
              <CopyButton
                textToCopy={() => JSON.stringify(seedDataObj)}
                successMessage="Seed data copied to clipboard"
                errorMessage="Failed to copy seed data"
                title="Copy seed data"
              />
            </div>
            <div className="mt-1">
              <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-48">{JSON.stringify(seedDataObj, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

