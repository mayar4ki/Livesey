'use client';

import { useTokenBalance } from '@acme/client/services/erc20/useTokenBalance';
import { useRewardTokenInfo } from '@acme/client/services/factory/useRewardTokenInfo';
import { Token } from '@acme/client/services/token/types';
import { formatTokenAmount } from '@acme/client/utils';
import { Skeleton } from '@acme/ui/skeleton';
import { useMemo } from 'react';
import { Address } from 'viem';

export interface DistributionInfoCardsProps {
  token: Token;
}

export const DistributionInfoCards = ({ token }: DistributionInfoCardsProps) => {
  const { rewardToken, symbol: rewardTokenSymbol, decimals: rewardTokenDecimals, isLoading: isRewardLoading } = useRewardTokenInfo();
  const { data: rewardBalance, isLoading: isBalanceLoading, refetch: refetchBalance } = useTokenBalance(rewardToken as Address | undefined);

  const rewardBalanceDisplay = useMemo(() => {
    if (rewardBalance?.value === undefined) return '--';
    return formatTokenAmount(rewardBalance.value.toString(), rewardBalance.decimals ?? 18);
  }, [rewardBalance]);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border p-4 bg-muted/40">
        <p className="text-sm text-muted-foreground">Reward token</p>
        <p className="text-lg font-semibold tracking-tight">{rewardTokenSymbol ?? 'Loading...'}</p>
        <p className="text-xs text-muted-foreground font-mono break-all">{rewardToken ?? 'Fetching reward token...'}</p>
      </div>
      <div className="rounded-xl border p-4 bg-muted/40">
        <p className="text-sm text-muted-foreground">Your balance</p>
        <div className="flex items-end gap-2">
          {isBalanceLoading || isRewardLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <>
              <span className="text-2xl font-bold leading-none">{rewardBalanceDisplay}</span>
              <span className="text-sm text-muted-foreground">{rewardTokenSymbol}</span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ensure the operator wallet holds enough {rewardTokenSymbol ?? 'reward tokens'} to fund this distribution.
        </p>
      </div>
      <div className="rounded-xl border p-4 bg-muted/40 bg-linear-to-r from-primary/10 via-primary/5 to-transparent">
        <p className="text-sm text-muted-foreground">Target token</p>
        <p className="text-lg font-semibold tracking-tight">{token.name}</p>
        <p className="text-xs text-muted-foreground font-mono break-all">{token.token}</p>
      </div>
    </div>
  );
};
