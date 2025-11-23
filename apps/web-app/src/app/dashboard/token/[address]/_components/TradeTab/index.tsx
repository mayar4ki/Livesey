import { Token } from '~/services/token/useToken';
import { LimitOrderCard } from './LimitOrderCard';

import { BaseCurrency } from '~/_config/1inch';
import { getOurTokenDecimals } from '~/utils/token-decimals';
import { TradesListCard } from './TradesListCard';

export const TradeTab = ({ token }: { token: Token }) => {
  // Use env var decimals for our token
  const baseToken: BaseCurrency = {
    address: token.token,
    symbol: token.symbol,
    name: token.name,
    decimals: getOurTokenDecimals(),
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-3">
        <LimitOrderCard token={token} baseToken={baseToken} className="order-1 xl:order-2" />
        <div className="xl:col-span-2 gap-6 space-y-6 order-2 xl:order-1">
          {/* <TokenChartCard /> */}
          <TradesListCard />
        </div>
      </div>
    </>
  );
};
