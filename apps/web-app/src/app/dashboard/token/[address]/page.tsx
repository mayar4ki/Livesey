'use client';

import { useTokenDecimals } from '@acme/client/services/erc20/useTokenDecimals';
import { useTokensLedger } from '@acme/client/services/factory/useTokensLedger';
import { useToken } from '@acme/client/services/token/useToken';
import { cn } from '@acme/ui';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { TokenContractDetailsCard } from '@acme/ui/bootstrapped/token/token-contract-details-card';
import { TokenHeaderCard } from '@acme/ui/bootstrapped/token/token-header-card';
import { TokenMetadataCard } from '@acme/ui/bootstrapped/token/token-metadata-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { Coins, Wallet } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { addTokenToWallet } from '~/_helpers/addTokenToWallet';
import { ProfitsTab } from './_components/ProfitsTab';
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

        <Tabs defaultValue="overview" className="w-full ">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Contract Details</TabsTrigger>
            <TabsTrigger value="trade">Sell / Buy</TabsTrigger>
            <TabsTrigger value="voting">Voting</TabsTrigger>
            <TabsTrigger value="profits">
              <Coins className="h-3.5 w-3.5" />
              Profits
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="md:space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start ">
              <TokenMetadataCard token={token.data} />
              <TokenContractDetailsCard token={token.data} decimals={decimals} />
            </div>
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting">
            <VotingTab token={token.data} />
          </TabsContent>

          {/* Profits Tab */}
          <TabsContent value="profits">
            <ProfitsTab token={token.data} />
          </TabsContent>

          {/* Trade Tab */}
          <TabsContent value="trade" className={cn('space-y-6 data-[state=inactive]:hidden')}>
            <TradeTab token={token.data} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
