'use client';

import { useOperator } from '@acme/client/services/factory/useOperator';
import { getChainUIName, getExplorerUrl } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { ArrowLeft, ExternalLink, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
import { OperatedTokensCard } from './_components/OperatedTokensCard';

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
            <Link href="/dashboard/operator">
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
            <Link href="/dashboard/operator">
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
                <CardTitle className="text-xl mb-2">Operator Details</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <ExplorerLink hash={operatorAddress} chainId={chainId} showFull />
                    <Badge variant={operator.isPaused ? 'destructive' : 'default'}>
                      {operator.isPaused ? 'Paused' : 'Active'}
                    </Badge>
                    <Badge variant="secondary">{getChainUIName(chainId)}</Badge>
                  </div>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
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

        <Tabs defaultValue="operatedTokens" className="w-full ">
          <TabsList className="mb-4">
            <TabsTrigger value="operatedTokens">
              <Shield className="h-3.5 w-3.5" />
              Operated Tokens
            </TabsTrigger>
          </TabsList>

          {/* Voting Tab */}
          <TabsContent value="operatedTokens">
            <OperatedTokensCard address={operatorAddress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
