'use client';

import { formatTokenAmount } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Skeleton } from '@acme/ui/skeleton';
import { toast } from '@acme/ui/sonner';
import { Spinner } from '@acme/ui/spinner';
import { Banknote, CircleDollarSign, TrendingUp, Wallet } from 'lucide-react';
import { useEffect } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useWithdrawableDividend } from '~/services/erc20/useWithdrawableDividend';
import { useWithdrawDividend } from '~/services/erc20/useWithdrawDividend';
import { useRewardTokenInfo } from '~/services/factory/useRewardTokenInfo';
import { Token } from '~/services/token/useToken';

export interface ProfitsTabProps {
  token: Token;
}

export const ProfitsTab = ({ token }: ProfitsTabProps) => {
  const { isConnected } = useAccount();
  const tokenAddress = token.token as Address;

  const {
    symbol: rewardTokenSymbol,
    decimals: rewardTokenDecimals,
    isLoading: isLoadingRewardToken,
  } = useRewardTokenInfo();
  const {
    withdrawableAmount,
    isLoading: isLoadingWithdrawable,
    refetch: refetchWithdrawable,
  } = useWithdrawableDividend(tokenAddress);
  const { withdraw, isPending, isConfirming, isConfirmed } = useWithdrawDividend(tokenAddress);

  // Refetch withdrawable amount after successful withdrawal
  useEffect(() => {
    if (isConfirmed) {
      refetchWithdrawable();
      toast.success('Dividends withdrawn successfully!');
    }
  }, [isConfirmed, refetchWithdrawable]);

  const isLoading = isLoadingWithdrawable || isLoadingRewardToken;
  const hasWithdrawableAmount = withdrawableAmount !== undefined && withdrawableAmount > 0n;
  const statusLabel = hasWithdrawableAmount ? 'Ready to withdraw' : 'Building up profits';

  // Format the withdrawable amount using the reward token decimals
  const formattedAmount =
    withdrawableAmount !== undefined
      ? formatTokenAmount(withdrawableAmount.toString(), rewardTokenDecimals ?? 6)
      : '0';

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-muted-foreground text-center">
            Connect your wallet to view and withdraw your available profits
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden pt-0">
        <CardHeader className=" pb-2  pt-4 bg-linear-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-start justify-between gap-3 ">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="leading-none">Profit center</CardTitle>
              </div>
              <CardDescription>
                Clear view of what&apos;s available right now and what happens when you withdraw
              </CardDescription>
            </div>
            <Badge
              variant={hasWithdrawableAmount ? 'default' : 'secondary'}
              className="rounded-full px-3 py-1 text-xs font-medium"
            >
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 ">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 rounded-xl border bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Available to withdraw</p>
                  {isLoading ? (
                    <Skeleton className="h-9 w-32" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">{formattedAmount}</span>
                      <span className="text-lg font-medium text-muted-foreground">
                        {rewardTokenSymbol ?? 'USDC'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <CircleDollarSign className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Dividends update automatically and are paid in your reward token.
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Reward token</span>
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-xl font-semibold">{rewardTokenSymbol ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Withdrawals go straight to the connected wallet.</p>
            </div>
          </div>

          <Button
            onClick={withdraw}
            disabled={!hasWithdrawableAmount || isPending || isConfirming}
            className="w-full sm:w-auto"
            size="lg"
          >
            {isPending || isConfirming ? (
              <>
                <Spinner className="mr-2" />
                {isPending ? 'Confirming...' : 'Processing...'}
              </>
            ) : (
              <>
                <Banknote className="mr-2 h-4 w-4" />
                Withdraw now
              </>
            )}
          </Button>

          <div className="border-t pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">How profits work</CardTitle>
              <CardDescription className="text-xs">Quick refresher so you know what to expect</CardDescription>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <p>Hold {token.symbol} and you earn dividends automatically.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <p>Your withdrawable balance updates on its own—you can claim anytime.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <p>Claims pay out in {rewardTokenSymbol ?? 'the reward token'} to your connected wallet.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
