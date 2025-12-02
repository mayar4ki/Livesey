'use client';

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
import { useTokensLedger } from '~/services/factory/useTokensLedger';
import { useToken } from '~/services/token/useToken';

import { addTokenToWallet } from '~/_helpers/addTokenToWallet';
import { useTokenDecimals } from '~/services/erc20/useTokenDecimals';
import { TradeTab } from './_components/TradeTab';
import { VotingTab } from './_components/VotingTab';

export default function TokenPage() {
  const params = useParams();
  const address = params.address as string;
  const { data: token, isLoading, error } = useToken({ address });
  const { data: decimals } = useTokenDecimals(token?.data.token);
  const { tokenInfo } = useTokensLedger(address as Address | undefined);

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
        <ErrorStateCard
          icon={Wallet}
          title="Token Not Found"
          message={error instanceof Error ? error.message : 'Failed to load token information'}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="space-y-6">
        <TokenHeaderCard
          token={token.data}
          onAddToWallet={() => {
            token &&
              addTokenToWallet({
                address: token.data.token,
                symbol: token.data.symbol,
                decimals: decimals !== undefined ? Number(decimals) : undefined,
              });
          }}
          isPaused={tokenInfo?.isPaused}
        />

        <Tabs defaultValue="trade" className="w-full ">
          <TabsList className="grid w-full grid-cols-6 lg:flex lg:w-fit mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="trade">Sell / Buy</TabsTrigger>

            <TabsTrigger value="voting">Voting</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <TokenContractDetailsCard token={token.data} decimals={decimals} />
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata">
            <TokenMetadataCard token={token.data} />
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting">
            <VotingTab token={token.data} />
          </TabsContent>

          {/* Trade Tab */}
          <TabsContent value="trade" forceMount className={cn('space-y-6 data-[state=inactive]:hidden')}>
            <TradeTab token={token.data} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
