'use client';

import { ERC20ImplementationAbi } from '@acme/smart-contract';
import { cn } from '@acme/ui';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { TokenContractDetailsCard } from '@acme/ui/bootstrapped/token/token-contract-details-card';
import { TokenHeaderCard } from '@acme/ui/bootstrapped/token/token-header-card';
import { TokenMetadataCard } from '@acme/ui/bootstrapped/token/token-metadata-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { Wallet } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { addTokenToWallet } from '~/_helpers/addTokenToWallet';
import { useTokenInfo } from '~/services/factory/useTokenInfo';
import { useToken } from '~/services/token/useToken';

import { TradeTab } from './_components/TradeTab';
import { VotingTab } from './_components/VotingTab';

export default function TokenPage() {
  const params = useParams();
  const chainId = params.chainId as string;
  const address = params.address as string;

  const { data: tokenResponse, isLoading, error } = useToken(chainId, address);
  const token = tokenResponse?.data;

  const { tokenInfo, isLoading: isLoadingTokenInfo } = useTokenInfo(address as Address | undefined);

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
      address: token.token,
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
        <TokenHeaderCard token={token} onAddToWallet={handleAddToWallet} isPaused={tokenInfo?.isPaused} />

        <Tabs defaultValue="overview" className="w-full ">
          <TabsList className="grid w-full grid-cols-6 lg:flex lg:w-fit mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="trade">Trade</TabsTrigger>

            <TabsTrigger value="voting">Voting</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <TokenContractDetailsCard token={token} chainId={+chainId ?? 1} />
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata">
            <TokenMetadataCard token={token} />
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
