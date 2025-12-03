'use client';

import { formatDateTime, formatTokenAmount } from '@acme/client/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@acme/ui/alert-dialog';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { AlertTriangle, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useGetOrderTokensInfo } from '~/_hooks/useGetOrderTokensInfo';
import { use1inchCancelLimitOrder } from '~/services/1inche/use1inchCancelLimitOrder';
import { LimitOrderType, type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';

interface CancelOrderActionProps {
  order: LimitOrder;
}

export function CancelOrderAction({ order }: CancelOrderActionProps) {
  const { cancelOrder, isPending: isCancelling, transactionReceipt } = use1inchCancelLimitOrder();
  const [openDialog, setOpenDialog] = useState(false);
  const getOrderTokensInfo = useGetOrderTokensInfo();

  const isPending = isCancelling || transactionReceipt.isLoading;

  const isOrderPending = order.status === 'pending';
  const isOrderCancelled = order.status === 'cancelled';
  const isOrderFilled = order.status === 'filled';

  const handleCancelOrder = () => {
    setOpenDialog(false);
    cancelOrder({ order });
  };

  const { makeTokenInfo, takeTokenInfo, _price } = getOrderTokensInfo(order);
  const isSell = order.type === LimitOrderType.SELL;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpenDialog(true)}
        disabled={!isOrderPending || isOrderCancelled || isOrderFilled || isPending}
        className="text-xs"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isCancelling ? 'Approving...' : 'Confirming...'}
          </>
        ) : (
          <>
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Cancel
          </>
        )}
      </Button>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Cancel Limit Order</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 space-y-4" asChild>
              <div>
                {/* Order Summary */}
                <div className="p-5 bg-muted/50 rounded-lg border-2 border-destructive/20">
                  <div className="space-y-3">
                    {/* Order Type */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Order Type</span>
                      <Badge
                        className={isSell ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                      >
                        {isSell ? 'SELL' : 'BUY'}
                      </Badge>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-destructive/20">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                          {isSell ? 'Selling' : 'Buying'}
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {formatTokenAmount(order.makeAmount, makeTokenInfo?.decimals ?? 18)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {makeTokenInfo?.symbol ?? 'Token'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                          {isSell ? 'For' : 'With'}
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {formatTokenAmount(order.takeAmount, takeTokenInfo?.decimals ?? 18)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {takeTokenInfo?.symbol ?? 'Token'}
                        </div>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="pt-3 border-t border-destructive/20 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Price</div>
                      <div className="text-sm font-semibold text-foreground">
                        ~{_price} {isSell ? takeTokenInfo?.symbol : makeTokenInfo?.symbol} per 1{' '}
                        {isSell ? makeTokenInfo?.symbol : takeTokenInfo?.symbol}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Order Hash</span>
                    <span className="font-mono text-xs text-foreground truncate max-w-[200px]">
                      {order.orderHash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium text-foreground">
                      {formatDateTime(new Date(Number(order.expiration) * 1000))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                </div>

                {/* Warning */}
                <div className="pt-2">
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      This will cancel your limit order. Once cancelled, this order cannot be filled. You will need
                      to create a new order if you want to place it again. This action will consume gas fees.
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleCancelOrder}>
                Cancel Order
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
