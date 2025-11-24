'use client';

import { formatTokenAmount } from '@acme/client/utils';
import { LimitOrderType } from '@acme/db';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { TableCell, TableRow } from '@acme/ui/table';
import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { TokenSeedData } from '~/services/token/useToken';
import { getOurTokenDecimals } from '~/utils/token-decimals';

interface LimitOrderExpandedRowProps {
  order: LimitOrder;
  colSpan: number;
  seedData: TokenSeedData['data'];
  isExpanded: boolean;
}

export function LimitOrderExpandedRow({ order, colSpan, seedData, isExpanded }: LimitOrderExpandedRowProps) {
  const isSell = order.type === LimitOrderType.SELL;

  // Calculate supply and percentage
  const decimals = getOurTokenDecimals();
  const totalSupply = order.token ? Number(order.token.totalSupply) : 0;

  const transactedAmount = isSell ? Number(order.makeAmount) / 10 ** decimals : Number(order.takeAmount) / 10 ** decimals;
  const percentage = totalSupply > 0 ? ((transactedAmount / totalSupply) * 100).toFixed(2) : '0';

  return (
    <>
      <TableRow>
        <TableCell colSpan={colSpan} className="p-0">
          {/* Token Supply Info */}

          <div className=" rounded-md  bg-muted/30 ">
            {order.token && (
              <div className=" p-2">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">{order.token.symbol} Info</div>
                    <div className="font-semibold text-foreground">
                      <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">{order.token.name}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">{isSell ? 'Selling' : 'Buying'}</div>
                    <div className="font-semibold text-foreground">
                      {isSell ? formatTokenAmount(order.makeAmount, decimals) : formatTokenAmount(order.takeAmount, decimals)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Percentage of Total Supply</div>
                    <div className={`font-bold ${isSell ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {percentage}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">Total Supply</div>
                    <div className="font-semibold text-foreground">{order.token.totalSupply}</div>
                  </div>
                </div>
              </div>
            )}

            {seedData && (
              <div className="grid grid-cols-1  sm:grid-cols-4 gap-2 p-2">
                {seedData.map(({ key, value }) => (
                  <div key={key} className="  border  rounded p-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500/40 group-hover:bg-primary/60 transition-colors" />
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{key}</div>
                    </div>
                    <div className="mt-0.5 break-all font-mono text-xs text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="space-y-4 p-4">
              {/* Order Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Details</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Order Hash</div>
                    <ExplorerLink hash={order.orderHash} chainId={order.chainId} className="font-mono text-sm break-all" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Maker (Creator)</div>
                    <ExplorerLink hash={order.maker} chainId={order.chainId} className="text-sm" showFull />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Make Token (Selling)</div>
                    <ExplorerLink hash={order.makeToken} chainId={order.chainId} className="text-sm font-mono" showFull />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Take Token (Buying)</div>
                    <ExplorerLink hash={order.takeToken} chainId={order.chainId} className="text-sm font-mono" showFull />
                  </div>
                </div>
              </div>
            </div>
          )}
        </TableCell>
      </TableRow>
    </>
  );
}
