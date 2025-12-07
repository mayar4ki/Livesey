'use client';

import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { ArrowLeft, Coins } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useTokenInfo } from '~/services/factory/useTokenInfo';
import { useToken } from '~/services/token/useToken';

import { TokenHeaderCard } from '@acme/ui/bootstrapped/token/token-header-card';

import { TokenContractDetailsCard } from '@acme/ui/bootstrapped/token/token-contract-details-card';
import { TokenMetadataCard } from '@acme/ui/bootstrapped/token/token-metadata-card';
import { useTokenDecimals } from '~/services/erc20/useTokenDecimals';

export default function Page() {
  const params = useParams();
  const tokenId = params.id as string;
  const { data, isLoading, error } = useToken(tokenId);
  const token = data?.data;
  const { data: decimals } = useTokenDecimals(token?.token as Address | undefined);

  // Fetch token info from contract
  const { tokenInfo, isLoading: isLoadingTokenInfo } = useTokenInfo(token?.token as Address | undefined);

  if (isLoading || isLoadingTokenInfo) {
    return <LoadingCard message="Loading token details..." />;
  }

  if (error) {
    return (
      <ErrorStateCard
        icon={Coins}
        title="Error Loading Token"
        message={error instanceof Error ? error.message : 'Failed to load token details'}
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
      <TokenHeaderCard token={token} isPaused={tokenInfo?.isPaused} />
      <div className="mt-6">
        <Tabs defaultValue="contract" className="w-full">
          <TabsList>
            <TabsTrigger value="contract">Contract Details</TabsTrigger>
          </TabsList>
          <TabsContent value="contract" className="mt-5">
            <div className="md:space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start ">
              <TokenMetadataCard token={token} />
              <TokenContractDetailsCard token={token} decimals={decimals !== undefined ? Number(decimals) : undefined} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
