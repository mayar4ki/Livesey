'use client';

import { CopyButton } from '@acme/ui/bootstrapped/copy-button';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { TableCell, TableRow } from '@acme/ui/table';
import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';

interface LimitOrderExpandedRowProps {
  order: LimitOrder;
  colSpan: number;
  seedData: any;
}

export function LimitOrderExpandedRow({ order, colSpan, seedData }: LimitOrderExpandedRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="bg-muted/50 p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Order Hash</div>
              <ExplorerLink hash={order.orderHash} chainId={order.chainId} className="font-mono text-sm" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Maker</div>
              <ExplorerLink hash={order.maker} chainId={order.chainId} className="text-sm" showFull />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Make Token (Sell)</div>
              <ExplorerLink hash={order.makeToken} chainId={order.chainId} className="text-sm font-mono" showFull />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Take Token (Buy)</div>
              <ExplorerLink hash={order.takeToken} chainId={order.chainId} className="text-sm font-mono" showFull />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Token Seed Data</h4>
            <div className="flex items-center gap-3">
              {order.token && (
                <div className="text-xs text-muted-foreground">
                  Token: {order.token.name} ({order.token.symbol})
                </div>
              )}
              <CopyButton
                textToCopy={() => JSON.stringify(seedData, null, 2)}
                successMessage="Seed data copied to clipboard"
                errorMessage="Failed to copy seed data"
                title="Copy seed data"
                className="h-7 w-7"
              />
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <pre className="text-xs font-mono overflow-auto max-h-64 whitespace-pre-wrap wrap-break-word">{JSON.stringify(seedData, null, 2)}</pre>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
