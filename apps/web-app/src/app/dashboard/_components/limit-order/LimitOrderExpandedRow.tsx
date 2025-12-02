'use client';

import { formatTokenAmount } from '@acme/client/utils';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { TableCell, TableRow } from '@acme/ui/table';
import { LimitOrderType, type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
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
  const decimals = getOurTokenDecimals();
  const totalSupply = order.token ? Number(order.token.totalSupply) : 0;
  const transactedAmount = isSell ? Number(order.makeAmount) / 10 ** decimals : Number(order.takeAmount) / 10 ** decimals;
  const percentage = totalSupply > 0 ? ((transactedAmount / totalSupply) * 100).toFixed(2) : '0';

  return (
    <TableRow className="border-none">
      <TableCell colSpan={colSpan} className="p-0 border-none">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/20 border-b border-border/40">
          {/* Token Info */}
          {order.token && (
            <>
              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {order.token.symbol}
              </span>
              <span className="text-xs text-muted-foreground">{order.token.name}</span>
              <span className="w-px h-3 bg-border/60" />
              <span className="text-xs text-muted-foreground">
                {isSell ? 'Sell' : 'Buy'}{' '}
                <span className="font-mono text-foreground">
                  {isSell ? formatTokenAmount(order.makeAmount, decimals) : formatTokenAmount(order.takeAmount, decimals)}
                </span>
              </span>
              <span className={`text-xs  text-muted-foreground `}>
                <span className={`${isSell ? 'text-red-500' : 'text-emerald-500'} font-semibold`}>{percentage}% </span> of Supply
              </span>
              <span className="w-px h-3 bg-border/60" />
              <span className="text-xs text-muted-foreground">
                Supply: <span className="font-mono text-foreground">{order.token.totalSupply}</span>
              </span>
            </>
          )}

          {/* Seed Data */}
          {seedData && seedData.length > 0 && (
            <>
              <span className="w-px h-3 bg-border/60" />
              {seedData.map(({ key, value }, idx) => (
                <span key={key} className="flex items-center gap-1 text-xs">
                  <span className="h-1 w-1 rounded-full bg-emerald-500/50" />
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-mono text-foreground">{value}</span>
                  {idx < seedData.length - 1 && <span className="text-border/60 mx-1">·</span>}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 bg-muted/10 text-[10px]">
            <span className="text-muted-foreground">
              Hash: <ExplorerLink hash={order.orderHash} chainId={order.chainId} className="font-mono" />
            </span>
            <span className="text-muted-foreground">
              Maker: <ExplorerLink hash={order.maker} chainId={order.chainId} className="font-mono" />
            </span>
            <span className="text-muted-foreground">
              Sell Token: <ExplorerLink hash={order.makeToken} chainId={order.chainId} className="font-mono" />
            </span>
            <span className="text-muted-foreground">
              Buy Token: <ExplorerLink hash={order.takeToken} chainId={order.chainId} className="font-mono" />
            </span>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
