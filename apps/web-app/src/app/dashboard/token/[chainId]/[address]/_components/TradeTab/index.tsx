import { BuySellOrderCard } from './BuySellOrderCard';
import { TokenChartCard } from './TokenChartCard';
import { TradesListCard } from './TradesListCard';

export const TradeTab = () => {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TokenChartCard />
        </div>
        <BuySellOrderCard />
      </div>
      <TradesListCard />
    </>
  );
};
