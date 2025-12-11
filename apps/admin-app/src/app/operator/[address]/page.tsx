'use client';

import { useOperator } from '@acme/client/services/factory/useOperator';
import { useOperatorDetails } from '@acme/client/services/operator/useOperatorDetails';
import { getChainUIName, getExplorerUrl } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { ArrowLeft, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useChainId } from 'wagmi';

import { OperatorPauseSection } from './_components/OperatorPauseSection';
import { OperatorSetNameSection } from './_components/OperatorSetNameSection';

export default function Page() {
  const params = useParams();
  const chainId = useChainId();
  const operatorAddress = params.address as Address | undefined;
  const { operator, isLoading } = useOperator(operatorAddress);
  const { data: operatorDetails, isLoading: isLoadingDetails } = useOperatorDetails(operatorAddress);

  if (isLoading || isLoadingDetails) {
    return <LoadingCard message="Loading operator details..." />;
  }

  if (!operator || !operatorAddress) {
    return (
      <ErrorStateCard
        icon={Users}
        title="Operator Not Found"
        message="The operator you're looking for doesn't exist or the address is invalid."
        action={
          <Button asChild variant="outline">
            <Link href="/operator">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Operators List
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{operatorDetails?.data?.name || 'Operator Details'}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <ExplorerLink hash={operatorAddress} chainId={chainId} showFull />
                    <Badge variant={operator.isPaused ? 'destructive' : 'default'}>{operator.isPaused ? 'Paused' : 'Active'}</Badge>
                    <Badge variant="secondary">{getChainUIName(chainId)}</Badge>
                  </div>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/operator">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={getExplorerUrl(operatorAddress, chainId)}
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
          {operatorDetails?.data && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created At:</span>
                  <p className="font-medium">{new Date(operatorDetails.data.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated At:</span>
                  <p className="font-medium">{new Date(operatorDetails.data.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Set Operator Name Section */}
        <OperatorSetNameSection operatorAddress={operatorAddress} chainId={chainId} currentName={operatorDetails?.data?.name} />

        {/* Pause/Unpause Section */}
        <OperatorPauseSection operatorAddress={operatorAddress} isPaused={operator.isPaused} />
      </div>
    </div>
  );
}
