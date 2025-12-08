import { Token } from '@acme/client/services/token/types';
import { LimitOrderCard } from './LimitOrderCard';

import { OrderBookCard } from './OrderBookCard';

export const TradeTab = ({ token }: { token: Token }) => {
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-3 overflow-hidden">
        <LimitOrderCard token={token} className="order-1  hidden xl:block   xl:order-2" />
        <div className="xl:col-span-2 gap-6 space-y-6 order-2 xl:order-1 overflow-hidden">
          {/* <TokenChartCard /> */}
          <OrderBookCard token={token} />
        </div>
      </div>
    </>
  );
};
