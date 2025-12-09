'use client';

import { useRewardTokenInfo } from '@acme/client/services/factory/useRewardTokenInfo';
import { Token } from '@acme/client/services/token/types';
import { Badge } from '@acme/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { PiggyBank, ShieldCheck } from 'lucide-react';

import { DistributeDividendsForm } from './DistributeDividendsForm';
import { DistributionInfoCards } from './DistributionInfoCards';

export interface ProfitsTabProps {
  token: Token;
}

export const ProfitsTab = ({ token }: ProfitsTabProps) => {
  const { symbol: rewardTokenSymbol } = useRewardTokenInfo();

  return (
    <div className="space-y-6 ">
      <Card className="overflow-hidden pt-0">
        <CardHeader className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent pt-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                <CardTitle className="leading-none">Profit distribution</CardTitle>
              </div>
              <CardDescription>Deposit rewards into {token.symbol} holders via distributeDividends.</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" />
              {rewardTokenSymbol ?? 'Reward token'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <DistributionInfoCards token={token} />
          <DistributeDividendsForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
};
