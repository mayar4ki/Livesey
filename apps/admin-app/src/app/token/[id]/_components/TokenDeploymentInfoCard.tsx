import { formatDateTime } from '@acme/client/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Token } from '~/services/token/types';

interface TokenDeploymentInfoCardProps {
  token: Token;
}

export function TokenDeploymentInfoCard({ token }: TokenDeploymentInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Deployed At</label>
          <p className="text-base mt-1">{formatDateTime(token.deployedAt)}</p>
        </div>
        {token.verifiedAt && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Verified At</label>
            <p className="text-base mt-1">{formatDateTime(token.verifiedAt)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
