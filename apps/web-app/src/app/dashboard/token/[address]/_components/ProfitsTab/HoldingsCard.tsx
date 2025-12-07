'use client';

import { Skeleton } from '@acme/ui/skeleton';
import { PieChart, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { Address, formatUnits } from 'viem';
import { useTokenBalance } from '~/services/erc20/useTokenBalance';
import { Token } from '~/services/token/useToken';

export interface HoldingsCardProps {
  token: Token;
}

export const HoldingsCard = ({ token }: HoldingsCardProps) => {
  const { data: balanceData, isLoading } = useTokenBalance(token.token as Address);

  const { formattedBalance, percentageOfSupply } = useMemo(() => {
    if (!balanceData?.value || !token.totalSupply) {
      return { formattedBalance: '0', percentageOfSupply: '0' };
    }

    const balance = balanceData.value;
    const decimals = balanceData.decimals;

    // Format balance to human-readable number
    const formattedBalanceRaw = formatUnits(balance, decimals);
    const balanceNum = parseFloat(formattedBalanceRaw);
    const formattedBalance = balanceNum.toLocaleString(undefined, {
      maximumFractionDigits: 4,
    });

    // Calculate percentage (balance / totalSupply * 100)
    const totalSupplyNum = parseFloat(token.totalSupply);
    if (totalSupplyNum === 0) {
      return { formattedBalance, percentageOfSupply: '0' };
    }

    const percentage = (balanceNum / totalSupplyNum) * 100;
    const percentageOfSupply =
      percentage < 0.01 && percentage > 0
        ? '<0.01'
        : percentage.toLocaleString(undefined, { maximumFractionDigits: 2 });

    return { formattedBalance, percentageOfSupply };
  }, [balanceData, token.totalSupply]);

  return (
    <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Your holdings</span>
        <Wallet className="h-4 w-4" />
      </div>
      <div className="space-y-3">
        <div>
          {isLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <p className="text-lg font-semibold">
              {formattedBalance} <span className="text-muted-foreground text-sm">{token.symbol}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
          {isLoading ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <span className="text-muted-foreground">{percentageOfSupply}% of total supply</span>
          )}
        </div>
      </div>
    </div>
  );
};
