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
import { OverviewTab } from './_components/OverviewTab';
import { TokenHeaderCard } from './_components/TokenHeaderCard';
import { TradeTab } from './_components/TradeTab';
import { VotingTab } from './_components/VotingTab';

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
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab token={token} decimals={decimals} isLoadingDecimals={isLoadingDecimals} />
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting">
            <VotingTab tokenId={token.id} />
          </TabsContent>

          {/* Trade Tab */}
          <TabsContent value="trade" forceMount className={cn('space-y-6 data-[state=inactive]:hidden')}>
            <TradeTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
