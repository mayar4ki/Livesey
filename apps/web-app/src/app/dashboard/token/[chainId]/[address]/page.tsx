'use client';

import { ERC20ImplementationAbi } from '@acme/smart-contract';
import { cn } from '@acme/ui';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { Wallet } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { addTokenToWallet } from '~/_helpers/addTokenToWallet';
import { useToken } from '~/services/token/useToken';
import { BuySellOrderCard } from './_components/BuySellOrderCard';
import { CommentsCard } from './_components/CommentsCard';
import { HoldersListCard } from './_components/HoldersListCard';
import { TokenBasicInfoCard } from './_components/TokenBasicInfoCard';
import { TokenChartCard } from './_components/TokenChartCard';
import { TokenContractInfoCard } from './_components/TokenContractInfoCard';
import { TokenDeploymentInfoCard } from './_components/TokenDeploymentInfoCard';
import { TokenHeaderCard } from './_components/TokenHeaderCard';
import { TokenMetadataCard } from './_components/TokenMetadataCard';
import { TradesListCard } from './_components/TradesListCard';
import { VotingCard } from './_components/VotingCard';

export default function TokenPage() {
  const params = useParams();
  const chainId = params.chainId as string;
  const address = params.address as string;

  const { data: tokenResponse, isLoading, error } = useToken(chainId, address);
  const token = tokenResponse?.data;

  // Read decimals from the contract
  const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
    address: address as Address,
    abi: ERC20ImplementationAbi,
    functionName: 'decimals',
    chainId: parseInt(chainId, 10),
  });

  const handleAddToWallet = () => {
    if (!token) return;

    addTokenToWallet({
      address: token.contractAddress,
      symbol: token.symbol,
      decimals: decimals !== undefined ? Number(decimals) : undefined,
    });
  };

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

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="space-y-6">
        <TokenHeaderCard
          token={token}
          onAddToWallet={handleAddToWallet}
          isAddingToWallet={isLoadingDecimals || decimals === undefined}
          decimals={decimals !== undefined ? Number(decimals) : undefined}
          isLoadingDecimals={isLoadingDecimals}
        />

        <Tabs defaultValue="overview" className="w-full ">
          <TabsList className="grid w-full grid-cols-6 lg:flex lg:w-fit mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="voting">Voting</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <TokenBasicInfoCard token={token} decimals={decimals} isLoadingDecimals={isLoadingDecimals} />
              <TokenContractInfoCard token={token} />
              <TokenDeploymentInfoCard token={token} />
              <TokenMetadataCard token={token} />
            </div>
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting">
            <VotingCard />
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <CommentsCard />
          </TabsContent>

          {/* Holders Tab */}
          <TabsContent value="holders">
            <HoldersListCard chainId={chainId} />
          </TabsContent>

          {/* Trade Tab */}
          <TabsContent value="trade" forceMount className={cn('space-y-6 data-[state=inactive]:hidden')}>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TokenChartCard />
              </div>
              <BuySellOrderCard />
            </div>
            <TradesListCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
