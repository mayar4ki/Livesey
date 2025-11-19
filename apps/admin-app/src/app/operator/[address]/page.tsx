'use client';

import { getChainUIName, getExplorerUrl } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { ArrowLeft, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
import { useOperator } from '~/services/factory/useOperator';

import { OperatorPauseSection } from './_components/OperatorPauseSection';

export default function Page() {
  const params = useParams();
  const chainId = useChainId();
  const operatorAddress = params.address as Address | undefined;
  const { operator, isLoading } = useOperator(operatorAddress);

  if (isLoading) {
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

  // Check if operator exists (operator address should not be zero address)
  if (operator.operator === '0x0000000000000000000000000000000000000000') {
    return (
      <ErrorStateCard
        icon={Users}
        title="Operator Not Found"
        message="This operator address is not registered in the Factory contract."
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
                <CardTitle className="text-2xl mb-2">Operator Details</CardTitle>
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
        </Card>

        {/* Pause/Unpause Section */}
        <OperatorPauseSection operatorAddress={operatorAddress} isPaused={operator.isPaused} />
      </div>
    </div>
  );
}
