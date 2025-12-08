'use client';

import { useToken } from '@acme/client/services/token/useToken';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { ArrowLeft, Coins, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Address } from 'viem';

import { TokenHeaderCard } from '@acme/ui/bootstrapped/token/token-header-card';

import { useTokenDecimals } from '@acme/client/services/erc20/useTokenDecimals';
import { useTokensLedger } from '@acme/client/services/factory/useTokensLedger';
import { TokenContractDetailsCard } from '@acme/ui/bootstrapped/token/token-contract-details-card';
import { TokenMetadataCard } from '@acme/ui/bootstrapped/token/token-metadata-card';
import { TokenOperatorSection } from './_components/TokenOperatorSection';
import { TokenPauseSection } from './_components/TokenPauseSection';

export default function Page() {
  const params = useParams();
  const address = params.address as string;
  const { data: token, isLoading, error } = useToken({ address });
  const { tokenInfo } = useTokensLedger(address as Address | undefined);
  const { data: decimals } = useTokenDecimals(token?.data.token);
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <LoadingCard message="Loading token information..." />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ErrorStateCard icon={Wallet} title="Token Not Found" message={error instanceof Error ? error.message : 'Failed to load token information'} />
      </div>
    );
  }

  if (!token) {
    return (
      <ErrorStateCard
        icon={Coins}
        title="Token Not Found"
        message="The token you're looking for doesn't exist."
        action={
          <Button asChild variant="outline">
            <Link href="/token">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Token List
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <TokenHeaderCard token={token.data} isPaused={tokenInfo?.isPaused} />
      <div className="mt-6">
        <Tabs defaultValue="contract" className="w-full">
          <TabsList>
            <TabsTrigger value="contract">Contract Details</TabsTrigger>
            <TabsTrigger value="manage" disabled={!tokenInfo}>
              Management
            </TabsTrigger>
          </TabsList>
          <TabsContent value="contract" className="mt-5">
            <div className="md:space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start ">
              <TokenMetadataCard token={token.data} />
              <TokenContractDetailsCard token={token.data} decimals={decimals} />
            </div>
          </TabsContent>

          <TabsContent value="manage" className="mt-5">
            {tokenInfo && <TokenPauseSection tokenAddress={token.data.token as Address} isPaused={tokenInfo.isPaused} />}
            {tokenInfo && (
              <TokenOperatorSection tokenAddress={token.data.token as Address} currentOperator={tokenInfo.operator} chainId={token.data.chainId} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
