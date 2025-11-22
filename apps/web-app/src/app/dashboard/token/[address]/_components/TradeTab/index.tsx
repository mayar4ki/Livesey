import { Token } from '~/services/token/useToken';
import { LimitOrderCard } from './LimitOrderCard';

import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { BaseCurrency } from '~/_config/1inch';
import { useTokenDecimals } from '~/services/erc20/useTokenDecimals';
import { TokenChartCard } from './TokenChartCard';
import { TradesListCard } from './TradesListCard';

export const TradeTab = ({ token }: { token: Token }) => {
  const { data: decimals, isLoading: isLoadingDecimals } = useTokenDecimals(token.token);
  const baseToken: BaseCurrency = {
    address: token.token,
    symbol: token.symbol,
    name: token.name,
    decimals: decimals ?? 18,
  };

  if (isLoadingDecimals) {
    return <LoadingCard message="Loading token decimals..." />;
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-3">
        <LimitOrderCard token={token} baseToken={baseToken} className="order-1 xl:order-2" />
        <div className="xl:col-span-2 gap-6 space-y-6 order-2 xl:order-1">
          <TokenChartCard />
          <TradesListCard />
        </div>
      </div>
    </>
  );
};
