'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Token } from '~/services/token/useTrendingTokens';

type TokenDeploymentInfoCardProps = {
  token: Token;
};

export function TokenDeploymentInfoCard({ token }: TokenDeploymentInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Deployed At</label>
          <p className="text-base mt-1">{new Date(token.deployedAt).toLocaleString()}</p>
        </div>
        {token.verifiedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Verified At</label>
            <p className="text-base mt-1">{new Date(token.verifiedAt).toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

