import { CopyButton } from '@acme/ui/bootstrapped/copy-button';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { cn } from '@acme/ui';
import { Token } from '~/services/token/types';

interface TokenMetadataCardProps {
  token: Token;
  className?: string;
}

export function TokenMetadataCard({ token, className }: TokenMetadataCardProps) {
  // Handle seedData structure - it can be nested with seedData.seedData
  const getSeedDataValue = () => {
    if (!token.seedData) return null;

    // Check if seedData has a nested structure
    const seedDataValue = (token.seedData as any).data;

    if (Array.isArray(seedDataValue)) {
      return seedDataValue.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    }

    return seedDataValue;
  };

  const seedDataObj = getSeedDataValue();

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Token ID</label>
          <p className="text-base font-mono mt-1 break-all">{token.id}</p>
        </div>
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
        {seedDataObj && (
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
